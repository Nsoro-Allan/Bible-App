<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$conn = getDBConnection();

// Collection of inspiring and meaningful Bible verses
// These are carefully selected verses that are uplifting and encouraging
$inspiringVerses = [
    // Faith & Trust
    ['book' => 19, 'chapter' => 23, 'verse' => 1], // Psalm 23:1
    ['book' => 19, 'chapter' => 46, 'verse' => 1], // Psalm 46:1
    ['book' => 20, 'chapter' => 3, 'verse' => 5], // Proverbs 3:5
    ['book' => 23, 'chapter' => 41, 'verse' => 10], // Isaiah 41:10
    ['book' => 58, 'chapter' => 11, 'verse' => 1], // Hebrews 11:1
    
    // Love & Compassion
    ['book' => 43, 'chapter' => 3, 'verse' => 16], // John 3:16
    ['book' => 43, 'chapter' => 13, 'verse' => 34], // John 13:34
    ['book' => 46, 'chapter' => 13, 'verse' => 4], // 1 Corinthians 13:4
    ['book' => 46, 'chapter' => 13, 'verse' => 13], // 1 Corinthians 13:13
    ['book' => 62, 'chapter' => 4, 'verse' => 8], // 1 John 4:8
    
    // Strength & Courage
    ['book' => 5, 'chapter' => 31, 'verse' => 6], // Deuteronomy 31:6
    ['book' => 6, 'chapter' => 1, 'verse' => 9], // Joshua 1:9
    ['book' => 19, 'chapter' => 27, 'verse' => 1], // Psalm 27:1
    ['book' => 23, 'chapter' => 40, 'verse' => 31], // Isaiah 40:31
    ['book' => 50, 'chapter' => 4, 'verse' => 13], // Philippians 4:13
    
    // Peace & Comfort
    ['book' => 19, 'chapter' => 23, 'verse' => 4], // Psalm 23:4
    ['book' => 19, 'chapter' => 34, 'verse' => 18], // Psalm 34:18
    ['book' => 23, 'chapter' => 26, 'verse' => 3], // Isaiah 26:3
    ['book' => 40, 'chapter' => 11, 'verse' => 28], // Matthew 11:28
    ['book' => 43, 'chapter' => 14, 'verse' => 27], // John 14:27
    ['book' => 50, 'chapter' => 4, 'verse' => 6], // Philippians 4:6
    ['book' => 50, 'chapter' => 4, 'verse' => 7], // Philippians 4:7
    
    // Wisdom & Guidance
    ['book' => 19, 'chapter' => 119, 'verse' => 105], // Psalm 119:105
    ['book' => 20, 'chapter' => 3, 'verse' => 6], // Proverbs 3:6
    ['book' => 20, 'chapter' => 16, 'verse' => 3], // Proverbs 16:3
    ['book' => 59, 'chapter' => 1, 'verse' => 5], // James 1:5
    
    // Hope & Joy
    ['book' => 19, 'chapter' => 30, 'verse' => 5], // Psalm 30:5
    ['book' => 19, 'chapter' => 37, 'verse' => 4], // Psalm 37:4
    ['book' => 19, 'chapter' => 118, 'verse' => 24], // Psalm 118:24
    ['book' => 23, 'chapter' => 40, 'verse' => 8], // Isaiah 40:8
    ['book' => 24, 'chapter' => 29, 'verse' => 11], // Jeremiah 29:11
    ['book' => 45, 'chapter' => 8, 'verse' => 28], // Romans 8:28
    ['book' => 45, 'chapter' => 15, 'verse' => 13], // Romans 15:13
    
    // God's Promises
    ['book' => 1, 'chapter' => 28, 'verse' => 15], // Genesis 28:15
    ['book' => 19, 'chapter' => 55, 'verse' => 22], // Psalm 55:22
    ['book' => 19, 'chapter' => 91, 'verse' => 11], // Psalm 91:11
    ['book' => 23, 'chapter' => 43, 'verse' => 2], // Isaiah 43:2
    ['book' => 45, 'chapter' => 8, 'verse' => 38], // Romans 8:38-39
    ['book' => 58, 'chapter' => 13, 'verse' => 5], // Hebrews 13:5
    
    // Grace & Salvation
    ['book' => 43, 'chapter' => 1, 'verse' => 12], // John 1:12
    ['book' => 43, 'chapter' => 10, 'verse' => 10], // John 10:10
    ['book' => 44, 'chapter' => 16, 'verse' => 31], // Acts 16:31
    ['book' => 45, 'chapter' => 5, 'verse' => 8], // Romans 5:8
    ['book' => 45, 'chapter' => 6, 'verse' => 23], // Romans 6:23
    ['book' => 49, 'chapter' => 2, 'verse' => 8], // Ephesians 2:8
    
    // New Life & Transformation
    ['book' => 47, 'chapter' => 5, 'verse' => 17], // 2 Corinthians 5:17
    ['book' => 48, 'chapter' => 2, 'verse' => 20], // Galatians 2:20
    ['book' => 50, 'chapter' => 1, 'verse' => 6], // Philippians 1:6
    
    // Prayer & Worship
    ['book' => 19, 'chapter' => 100, 'verse' => 4], // Psalm 100:4
    ['book' => 19, 'chapter' => 145, 'verse' => 18], // Psalm 145:18
    ['book' => 40, 'chapter' => 7, 'verse' => 7], // Matthew 7:7
    ['book' => 52, 'chapter' => 5, 'verse' => 16], // 1 Thessalonians 5:16
    ['book' => 52, 'chapter' => 5, 'verse' => 17], // 1 Thessalonians 5:17
];

try {
    // Get action parameter
    $action = isset($_GET['action']) ? $_GET['action'] : 'daily';
    
    if ($action === 'random') {
        // Get a random verse from the collection
        $randomVerse = $inspiringVerses[array_rand($inspiringVerses)];
    } else {
        // Get daily verse (based on day of year)
        $dayOfYear = date('z'); // 0-365
        $index = $dayOfYear % count($inspiringVerses);
        $randomVerse = $inspiringVerses[$index];
    }
    
    // Fetch the verse from database
    $stmt = $conn->prepare("SELECT b, c, v, t FROM t_kjv WHERE b = ? AND c = ? AND v = ? LIMIT 1");
    $stmt->bind_param('iii', $randomVerse['book'], $randomVerse['chapter'], $randomVerse['verse']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $verse = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'verse' => [
                'book_id' => (int)$verse['b'],
                'chapter' => (int)$verse['c'],
                'verse' => (int)$verse['v'],
                'text' => $verse['t']
            ]
        ]);
    } else {
        throw new Exception('Verse not found');
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

closeDBConnection($conn);
?>
