<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    echo json_encode([
        'success' => false,
        'error' => 'Search query is required'
    ]);
    exit;
}

$conn = getDBConnection();

// Search for verses containing the query (limit to 100 results)
$searchTerm = '%' . $conn->real_escape_string($query) . '%';
$sql = "SELECT b as book, c as chapter, v as verse, t as text 
        FROM t_kjv 
        WHERE t LIKE ? 
        ORDER BY b, c, v 
        LIMIT 100";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $searchTerm);
$stmt->execute();
$result = $stmt->get_result();

$results = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $results[] = [
            'book' => (int)$row['book'],
            'chapter' => (int)$row['chapter'],
            'verse' => (int)$row['verse'],
            'text' => $row['text']
        ];
    }
}

$stmt->close();
closeDBConnection($conn);

echo json_encode([
    'success' => true,
    'query' => $query,
    'count' => count($results),
    'results' => $results
]);
?>
