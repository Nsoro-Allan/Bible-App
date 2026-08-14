<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$conn = getDBConnection();

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($method) {
        case 'GET':
            handleGet($conn, $action);
            break;
        case 'POST':
            handlePost($conn, $action);
            break;
        case 'PUT':
            handlePut($conn, $action);
            break;
        case 'DELETE':
            handleDelete($conn, $action);
            break;
        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

closeDBConnection($conn);

// ============================================
// GET Handlers
// ============================================
function handleGet($conn, $action) {
    switch ($action) {
        case 'list':
            getFolders($conn);
            break;
        default:
            getFolders($conn);
            break;
    }
}

function getFolders($conn) {
    $result = $conn->query("
        SELECT bf.*, COUNT(b.id) as bookmark_count 
        FROM bookmark_folders bf 
        LEFT JOIN bookmarks b ON bf.id = b.folder_id 
        GROUP BY bf.id 
        ORDER BY bf.is_default DESC, bf.name ASC
    ");
    
    $folders = [];
    while ($row = $result->fetch_assoc()) {
        $folders[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'folders' => $folders
    ]);
}

// ============================================
// POST Handlers
// ============================================
function handlePost($conn, $action) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'create':
            createFolder($conn, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function createFolder($conn, $data) {
    if (!isset($data['name']) || empty(trim($data['name']))) {
        throw new Exception('Folder name is required');
    }
    
    $name = $conn->real_escape_string(trim($data['name']));
    
    // Check if folder name already exists
    $checkStmt = $conn->prepare("SELECT id FROM bookmark_folders WHERE name = ?");
    $checkStmt->bind_param('s', $name);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception('A folder with this name already exists');
    }
    
    $stmt = $conn->prepare("INSERT INTO bookmark_folders (name, is_default) VALUES (?, 0)");
    $stmt->bind_param('s', $name);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Folder created successfully',
            'folder_id' => $conn->insert_id
        ]);
    } else {
        throw new Exception('Failed to create folder');
    }
}

// ============================================
// PUT Handlers
// ============================================
function handlePut($conn, $action) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'rename':
            renameFolder($conn, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function renameFolder($conn, $data) {
    if (!isset($data['id']) || !isset($data['name'])) {
        throw new Exception('Folder ID and name are required');
    }
    
    $id = intval($data['id']);
    $name = $conn->real_escape_string(trim($data['name']));
    
    if (empty($name)) {
        throw new Exception('Folder name cannot be empty');
    }
    
    // Check if this is the default folder
    $checkStmt = $conn->prepare("SELECT is_default FROM bookmark_folders WHERE id = ?");
    $checkStmt->bind_param('i', $id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows == 0) {
        throw new Exception('Folder not found');
    }
    
    $folder = $result->fetch_assoc();
    if ($folder['is_default'] == 1) {
        throw new Exception('Cannot rename the default Favorites folder');
    }
    
    // Check if new name already exists
    $checkNameStmt = $conn->prepare("SELECT id FROM bookmark_folders WHERE name = ? AND id != ?");
    $checkNameStmt->bind_param('si', $name, $id);
    $checkNameStmt->execute();
    $nameResult = $checkNameStmt->get_result();
    
    if ($nameResult->num_rows > 0) {
        throw new Exception('A folder with this name already exists');
    }
    
    $stmt = $conn->prepare("UPDATE bookmark_folders SET name = ? WHERE id = ?");
    $stmt->bind_param('si', $name, $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Folder renamed successfully'
        ]);
    } else {
        throw new Exception('Failed to rename folder');
    }
}

// ============================================
// DELETE Handlers
// ============================================
function handleDelete($conn, $action) {
    switch ($action) {
        case 'remove':
            deleteFolder($conn);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function deleteFolder($conn) {
    $folderId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($folderId <= 0) {
        throw new Exception('Invalid folder ID');
    }
    
    // Check if this is the default folder
    $checkStmt = $conn->prepare("SELECT is_default FROM bookmark_folders WHERE id = ?");
    $checkStmt->bind_param('i', $folderId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows == 0) {
        throw new Exception('Folder not found');
    }
    
    $folder = $result->fetch_assoc();
    if ($folder['is_default'] == 1) {
        throw new Exception('Cannot delete the default Favorites folder');
    }
    
    // Move bookmarks to default folder before deleting
    $defaultFolder = $conn->query("SELECT id FROM bookmark_folders WHERE is_default = 1 LIMIT 1")->fetch_assoc();
    $defaultId = $defaultFolder['id'];
    
    $conn->begin_transaction();
    
    try {
        // Move bookmarks
        $moveStmt = $conn->prepare("UPDATE bookmarks SET folder_id = ? WHERE folder_id = ?");
        $moveStmt->bind_param('ii', $defaultId, $folderId);
        $moveStmt->execute();
        
        // Delete folder
        $deleteStmt = $conn->prepare("DELETE FROM bookmark_folders WHERE id = ?");
        $deleteStmt->bind_param('i', $folderId);
        $deleteStmt->execute();
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Folder deleted successfully. Bookmarks moved to Favorites.'
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        throw new Exception('Failed to delete folder: ' . $e->getMessage());
    }
}
?>
