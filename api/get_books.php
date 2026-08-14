<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$conn = getDBConnection();

// Get distinct books from the database
$sql = "SELECT DISTINCT b as book_id FROM t_kjv ORDER BY b ASC";
$result = $conn->query($sql);

$books = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $books[] = (int)$row['book_id'];
    }
}

closeDBConnection($conn);

echo json_encode([
    'success' => true,
    'books' => $books
]);
?>
