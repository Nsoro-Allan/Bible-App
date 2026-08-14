<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$book = isset($_GET['book']) ? (int)$_GET['book'] : 0;

if ($book <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid book ID'
    ]);
    exit;
}

$conn = getDBConnection();

// Get distinct chapters for the given book
$sql = "SELECT DISTINCT c as chapter_id FROM t_kjv WHERE b = ? ORDER BY c ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $book);
$stmt->execute();
$result = $stmt->get_result();

$chapters = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $chapters[] = (int)$row['chapter_id'];
    }
}

$stmt->close();
closeDBConnection($conn);

echo json_encode([
    'success' => true,
    'chapters' => $chapters
]);
?>
