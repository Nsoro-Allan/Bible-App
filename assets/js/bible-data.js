// Bible Book Names and Chapter Counts
const BIBLE_BOOKS = {
    // Old Testament
    1: { name: "Genesis", chapters: 50, testament: "OT" },
    2: { name: "Exodus", chapters: 40, testament: "OT" },
    3: { name: "Leviticus", chapters: 27, testament: "OT" },
    4: { name: "Numbers", chapters: 36, testament: "OT" },
    5: { name: "Deuteronomy", chapters: 34, testament: "OT" },
    6: { name: "Joshua", chapters: 24, testament: "OT" },
    7: { name: "Judges", chapters: 21, testament: "OT" },
    8: { name: "Ruth", chapters: 4, testament: "OT" },
    9: { name: "1 Samuel", chapters: 31, testament: "OT" },
    10: { name: "2 Samuel", chapters: 24, testament: "OT" },
    11: { name: "1 Kings", chapters: 22, testament: "OT" },
    12: { name: "2 Kings", chapters: 25, testament: "OT" },
    13: { name: "1 Chronicles", chapters: 29, testament: "OT" },
    14: { name: "2 Chronicles", chapters: 36, testament: "OT" },
    15: { name: "Ezra", chapters: 10, testament: "OT" },
    16: { name: "Nehemiah", chapters: 13, testament: "OT" },
    17: { name: "Esther", chapters: 10, testament: "OT" },
    18: { name: "Job", chapters: 42, testament: "OT" },
    19: { name: "Psalms", chapters: 150, testament: "OT" },
    20: { name: "Proverbs", chapters: 31, testament: "OT" },
    21: { name: "Ecclesiastes", chapters: 12, testament: "OT" },
    22: { name: "Song of Solomon", chapters: 8, testament: "OT" },
    23: { name: "Isaiah", chapters: 66, testament: "OT" },
    24: { name: "Jeremiah", chapters: 52, testament: "OT" },
    25: { name: "Lamentations", chapters: 5, testament: "OT" },
    26: { name: "Ezekiel", chapters: 48, testament: "OT" },
    27: { name: "Daniel", chapters: 12, testament: "OT" },
    28: { name: "Hosea", chapters: 14, testament: "OT" },
    29: { name: "Joel", chapters: 3, testament: "OT" },
    30: { name: "Amos", chapters: 9, testament: "OT" },
    31: { name: "Obadiah", chapters: 1, testament: "OT" },
    32: { name: "Jonah", chapters: 4, testament: "OT" },
    33: { name: "Micah", chapters: 7, testament: "OT" },
    34: { name: "Nahum", chapters: 3, testament: "OT" },
    35: { name: "Habakkuk", chapters: 3, testament: "OT" },
    36: { name: "Zephaniah", chapters: 3, testament: "OT" },
    37: { name: "Haggai", chapters: 2, testament: "OT" },
    38: { name: "Zechariah", chapters: 14, testament: "OT" },
    39: { name: "Malachi", chapters: 4, testament: "OT" },
    
    // New Testament
    40: { name: "Matthew", chapters: 28, testament: "NT" },
    41: { name: "Mark", chapters: 16, testament: "NT" },
    42: { name: "Luke", chapters: 24, testament: "NT" },
    43: { name: "John", chapters: 21, testament: "NT" },
    44: { name: "Acts", chapters: 28, testament: "NT" },
    45: { name: "Romans", chapters: 16, testament: "NT" },
    46: { name: "1 Corinthians", chapters: 16, testament: "NT" },
    47: { name: "2 Corinthians", chapters: 13, testament: "NT" },
    48: { name: "Galatians", chapters: 6, testament: "NT" },
    49: { name: "Ephesians", chapters: 6, testament: "NT" },
    50: { name: "Philippians", chapters: 4, testament: "NT" },
    51: { name: "Colossians", chapters: 4, testament: "NT" },
    52: { name: "1 Thessalonians", chapters: 5, testament: "NT" },
    53: { name: "2 Thessalonians", chapters: 3, testament: "NT" },
    54: { name: "1 Timothy", chapters: 6, testament: "NT" },
    55: { name: "2 Timothy", chapters: 4, testament: "NT" },
    56: { name: "Titus", chapters: 3, testament: "NT" },
    57: { name: "Philemon", chapters: 1, testament: "NT" },
    58: { name: "Hebrews", chapters: 13, testament: "NT" },
    59: { name: "James", chapters: 5, testament: "NT" },
    60: { name: "1 Peter", chapters: 5, testament: "NT" },
    61: { name: "2 Peter", chapters: 3, testament: "NT" },
    62: { name: "1 John", chapters: 5, testament: "NT" },
    63: { name: "2 John", chapters: 1, testament: "NT" },
    64: { name: "3 John", chapters: 1, testament: "NT" },
    65: { name: "Jude", chapters: 1, testament: "NT" },
    66: { name: "Revelation", chapters: 22, testament: "NT" }
};

// Helper function to get book name by ID
function getBookName(bookId) {
    return BIBLE_BOOKS[bookId] ? BIBLE_BOOKS[bookId].name : `Book ${bookId}`;
}

// Helper function to get chapter count for a book
function getChapterCount(bookId) {
    return BIBLE_BOOKS[bookId] ? BIBLE_BOOKS[bookId].chapters : 0;
}

// Helper function to get testament
function getTestament(bookId) {
    return BIBLE_BOOKS[bookId] ? BIBLE_BOOKS[bookId].testament : "OT";
}
