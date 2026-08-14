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
            getBookmarks($conn);
            break;
        case 'check':
            checkBookmark($conn);
            break;
        case 'export':
            exportBookmarks($conn);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function getBookmarks($conn) {
    $folderId = isset($_GET['folder_id']) ? intval($_GET['folder_id']) : null;
    
    $query = "SELECT b.*, bf.name as folder_name 
              FROM bookmarks b 
              JOIN bookmark_folders bf ON b.folder_id = bf.id";
    
    if ($folderId) {
        $query .= " WHERE b.folder_id = ?";
    }
    
    $query .= " ORDER BY b.created_at DESC";
    
    if ($folderId) {
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $folderId);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($query);
    }
    
    $bookmarks = [];
    while ($row = $result->fetch_assoc()) {
        $bookmarks[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'bookmarks' => $bookmarks
    ]);
}

function checkBookmark($conn) {
    $bookId = intval($_GET['book_id']);
    $chapter = intval($_GET['chapter']);
    $verse = intval($_GET['verse']);
    
    $stmt = $conn->prepare("SELECT id, folder_id FROM bookmarks WHERE book_id = ? AND chapter = ? AND verse = ?");
    $stmt->bind_param('iii', $bookId, $chapter, $verse);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'bookmarked' => true,
            'bookmark_id' => $row['id'],
            'folder_id' => $row['folder_id']
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'bookmarked' => false
        ]);
    }
}

function exportBookmarks($conn) {
    $result = $conn->query("
        SELECT b.*, bf.name as folder_name 
        FROM bookmarks b 
        JOIN bookmark_folders bf ON b.folder_id = bf.id 
        ORDER BY b.created_at DESC
    ");
    
    $bookmarks = [];
    while ($row = $result->fetch_assoc()) {
        $bookmarks[] = $row;
    }
    
    // Also get folders
    $folderResult = $conn->query("SELECT * FROM bookmark_folders ORDER BY id");
    $folders = [];
    while ($row = $folderResult->fetch_assoc()) {
        $folders[] = $row;
    }
    
    $exportData = [
        'version' => '1.0',
        'export_date' => date('Y-m-d H:i:s'),
        'folders' => $folders,
        'bookmarks' => $bookmarks
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $exportData
    ]);
}

// ============================================
// POST Handlers
// ============================================
function handlePost($conn, $action) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'add':
            addBookmark($conn, $input);
            break;
        case 'import':
            importBookmarks($conn, $input);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function addBookmark($conn, $data) {
    $folderId = intval($data['folder_id']);
    $bookId = intval($data['book_id']);
    $chapter = intval($data['chapter']);
    $verse = intval($data['verse']);
    $verseText = $conn->real_escape_string($data['verse_text']);
    $note = isset($data['note']) ? $conn->real_escape_string($data['note']) : '';
    
    // Check if bookmark already exists
    $checkStmt = $conn->prepare("SELECT id FROM bookmarks WHERE book_id = ? AND chapter = ? AND verse = ?");
    $checkStmt->bind_param('iii', $bookId, $chapter, $verse);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing bookmark
        $stmt = $conn->prepare("UPDATE bookmarks SET folder_id = ?, note = ? WHERE book_id = ? AND chapter = ? AND verse = ?");
        $stmt->bind_param('isiii', $folderId, $note, $bookId, $chapter, $verse);
    } else {
        // Insert new bookmark
        $stmt = $conn->prepare("INSERT INTO bookmarks (folder_id, book_id, chapter, verse, verse_text, note) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('iiiiss', $folderId, $bookId, $chapter, $verse, $verseText, $note);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Bookmark saved successfully',
            'bookmark_id' => $conn->insert_id ?: $result->fetch_assoc()['id']
        ]);
    } else {
        throw new Exception('Failed to save bookmark');
    }
}

function importBookmarks($conn, $data) {
    if (!isset($data['data']) || !is_array($data['data'])) {
        throw new Exception('Invalid import data');
    }
    
    $importData = $data['data'];
    $imported = 0;
    $skipped = 0;
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Import folders first (excluding default)
        if (isset($importData['folders'])) {
            foreach ($importData['folders'] as $folder) {
                if ($folder['is_default'] == 0) {
                    $name = $conn->real_escape_string($folder['name']);
                    $stmt = $conn->prepare("INSERT INTO bookmark_folders (name, is_default) VALUES (?, 0) ON DUPLICATE KEY UPDATE name = name");
                    $stmt->bind_param('s', $name);
                    $stmt->execute();
                }
            }
        }
        
        // Import bookmarks
        if (isset($importData['bookmarks'])) {
            foreach ($importData['bookmarks'] as $bookmark) {
                // Find or get default folder
                $folderName = $conn->real_escape_string($bookmark['folder_name']);
                $folderResult = $conn->query("SELECT id FROM bookmark_folders WHERE name = '$folderName' LIMIT 1");
                
                if ($folderResult->num_rows == 0) {
                    // Use default folder
                    $folderResult = $conn->query("SELECT id FROM bookmark_folders WHERE is_default = 1 LIMIT 1");
                }
                
                $folderRow = $folderResult->fetch_assoc();
                $folderId = $folderRow['id'];
                
                // Check if bookmark exists
                $bookId = intval($bookmark['book_id']);
                $chapter = intval($bookmark['chapter']);
                $verse = intval($bookmark['verse']);
                
                $checkStmt = $conn->prepare("SELECT id FROM bookmarks WHERE book_id = ? AND chapter = ? AND verse = ?");
                $checkStmt->bind_param('iii', $bookId, $chapter, $verse);
                $checkStmt->execute();
                $checkResult = $checkStmt->get_result();
                
                if ($checkResult->num_rows > 0) {
                    $skipped++;
                } else {
                    $verseText = $conn->real_escape_string($bookmark['verse_text']);
                    $note = isset($bookmark['note']) ? $conn->real_escape_string($bookmark['note']) : '';
                    
                    $stmt = $conn->prepare("INSERT INTO bookmarks (folder_id, book_id, chapter, verse, verse_text, note) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->bind_param('iiiiss', $folderId, $bookId, $chapter, $verse, $verseText, $note);
                    $stmt->execute();
                    $imported++;
                }
            }
        }
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Import completed',
            'imported' => $imported,
            'skipped' => $skipped
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        throw new Exception('Import failed: ' . $e->getMessage());
    }
}

// ============================================
// DELETE Handlers
// ============================================
function handleDelete($conn, $action) {
    switch ($action) {
        case 'remove':
            deleteBookmark($conn);
            break;
        default:
            throw new Exception('Invalid action');
    }
}

function deleteBookmark($conn) {
    $bookmarkId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($bookmarkId <= 0) {
        throw new Exception('Invalid bookmark ID');
    }
    
    $stmt = $conn->prepare("DELETE FROM bookmarks WHERE id = ?");
    $stmt->bind_param('i', $bookmarkId);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Bookmark deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete bookmark');
    }
}
?>
