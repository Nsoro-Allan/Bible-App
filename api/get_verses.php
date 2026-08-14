<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$book = isset($_GET['book']) ? (int)$_GET['book'] : 0;
$chapter = isset($_GET['chapter']) ? (int)$_GET['chapter'] : 0;

if ($book <= 0 || $chapter <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid book or chapter ID'
    ]);
    exit;
}

$conn = getDBConnection();

// Get all verses for the given book and chapter
$sql = "SELECT v as verse_number, t as text FROM t_kjv WHERE b = ? AND c = ? ORDER BY v ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $book, $chapter);
$stmt->execute();
$result = $stmt->get_result();

$verses = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $verses[] = [
            'verse' => (int)$row['verse_number'],
            'text' => $row['text']
        ];
    }
}

$stmt->close();
closeDBConnection($conn);

echo json_encode([
    'success' => true,
    'book' => $book,
    'chapter' => $chapter,
    'verses' => $verses
]);
?>
