// ============================================
// State Management
// ============================================
const AppState = {
    currentBook: null,
    currentChapter: null,
    theme: localStorage.getItem('theme') || 'light',
    searchTimeout: null
};

// ============================================
// Theme Management
// ============================================
function initTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    localStorage.setItem('theme', AppState.theme);
}

// ============================================
// API Functions
// ============================================
async function fetchAPI(endpoint, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `api/${endpoint}${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        showError(`Failed to load data: ${error.message}`);
        return null;
    }
}

async function loadBooks() {
    const data = await fetchAPI('get_books.php');
    if (data && data.books) {
        renderBookList(data.books);
    }
}

async function loadChapters(bookId) {
    const chapterCount = getChapterCount(bookId);
    if (chapterCount > 0) {
        renderChapterNavigation(bookId, chapterCount);
    }
}

async function loadVerses(bookId, chapterId) {
    showLoading('versesContainer');
    
    const data = await fetchAPI('get_verses.php', { book: bookId, chapter: chapterId });
    if (data && data.verses) {
        renderVerses(data.verses, bookId, chapterId);
    }
}

async function searchBible(query) {
    if (!query || query.trim().length < 2) {
        hideSearchResults();
        return;
    }
    
    const trimmedQuery = query.trim();
    
    // Check if query matches a book name
    const bookMatch = findBookByName(trimmedQuery);
    if (bookMatch) {
        // Navigate directly to the book
        selectBook(bookMatch.id);
        hideSearchResults();
        return;
    }
    
    // Otherwise, search for verses
    showLoading('searchResults');
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('versesContainer').style.display = 'none';
    document.getElementById('chapterNav').style.display = 'none';
    
    const data = await fetchAPI('search.php', { q: trimmedQuery });
    if (data) {
        renderSearchResults(data.results, data.query, data.count);
    }
}

// Helper function to find book by name (case-insensitive, partial match)
function findBookByName(query) {
    const lowerQuery = query.toLowerCase();
    
    // Check for exact match first
    for (const [id, book] of Object.entries(BIBLE_BOOKS)) {
        if (book.name.toLowerCase() === lowerQuery) {
            return { id: parseInt(id), ...book };
        }
    }
    
    // Check for partial match (starts with)
    for (const [id, book] of Object.entries(BIBLE_BOOKS)) {
        if (book.name.toLowerCase().startsWith(lowerQuery)) {
            return { id: parseInt(id), ...book };
        }
    }
    
    // Check for contains (any part of the name)
    for (const [id, book] of Object.entries(BIBLE_BOOKS)) {
        if (book.name.toLowerCase().includes(lowerQuery)) {
            return { id: parseInt(id), ...book };
        }
    }
    
    // Check for common abbreviations and alternate names
    const bookAbbreviations = {
        'gen': 1, 'ex': 2, 'exo': 2, 'lev': 3, 'num': 4, 'deut': 5,
        'josh': 6, 'judg': 7, '1sam': 9, '2sam': 10, '1ki': 11, '2ki': 12,
        '1chr': 13, '2chr': 14, 'neh': 16, 'est': 17, 'ps': 19, 'psa': 19, 'psalm': 19,
        'prov': 20, 'pro': 20, 'eccl': 21, 'ecc': 21, 'song': 22, 'sos': 22,
        'isa': 23, 'jer': 24, 'lam': 25, 'eze': 26, 'ezek': 26, 'dan': 27,
        'hos': 28, 'amos': 30, 'obad': 31, 'jon': 32, 'mic': 33, 'nah': 34,
        'hab': 35, 'zeph': 36, 'hag': 37, 'zech': 38, 'zec': 38, 'mal': 39,
        'matt': 40, 'mat': 40, 'mt': 40, 'mk': 41, 'lk': 42, 'jn': 43, 'joh': 43,
        'act': 44, 'rom': 45, '1cor': 46, '2cor': 47, 'gal': 48, 'eph': 49,
        'phil': 50, 'php': 50, 'col': 51, '1thess': 52, '1th': 52, '2thess': 53, '2th': 53,
        '1tim': 54, '2tim': 55, 'tit': 56, 'philem': 57, 'heb': 58,
        'jas': 59, 'jam': 59, '1pet': 60, '1pe': 60, '2pet': 61, '2pe': 61,
        '1jn': 62, '2jn': 63, '3jn': 64, 'jude': 65, 'jud': 65, 'rev': 66
    };
    
    const abbrev = lowerQuery.replace(/\s+/g, '').replace(/\./g, '');
    if (bookAbbreviations[abbrev]) {
        const id = bookAbbreviations[abbrev];
        return { id, ...BIBLE_BOOKS[id] };
    }
    
    return null;
}

// ============================================
// Render Functions
// ============================================
function renderBookList(bookIds) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';
    
    bookIds.forEach(bookId => {
        const bookInfo = BIBLE_BOOKS[bookId];
        if (!bookInfo) return;
        
        const button = document.createElement('button');
        button.className = 'book-item';
        button.setAttribute('data-book-id', bookId);
        
        const bookName = document.createElement('span');
        bookName.textContent = bookInfo.name;
        
        const testament = document.createElement('span');
        testament.className = 'book-testament';
        testament.textContent = bookInfo.testament;
        
        button.appendChild(bookName);
        button.appendChild(testament);
        
        button.addEventListener('click', () => selectBook(bookId));
        
        bookList.appendChild(button);
    });
}

function renderChapterNavigation(bookId, chapterCount) {
    const chapterNav = document.getElementById('chapterNav');
    const chapterGrid = document.getElementById('chapterGrid');
    
    chapterGrid.innerHTML = '';
    
    for (let i = 1; i <= chapterCount; i++) {
        const button = document.createElement('button');
        button.className = 'chapter-button';
        button.textContent = i;
        button.setAttribute('data-chapter', i);
        
        button.addEventListener('click', () => selectChapter(bookId, i));
        
        chapterGrid.appendChild(button);
    }
    
    chapterNav.style.display = 'block';
}

function renderVerses(verses, bookId, chapterId) {
    const container = document.getElementById('versesContainer');
    container.innerHTML = '';
    container.style.display = 'block';
    
    if (verses.length === 0) {
        container.innerHTML = '<div class="no-results"><p class="no-results-text">No verses found.</p></div>';
        return;
    }
    
    verses.forEach(verse => {
        const verseElement = document.createElement('div');
        verseElement.className = 'verse';
        verseElement.setAttribute('data-verse', verse.verse);
        
        const verseNumber = document.createElement('span');
        verseNumber.className = 'verse-number';
        verseNumber.textContent = verse.verse;
        
        const verseText = document.createElement('p');
        verseText.className = 'verse-text';
        verseText.textContent = verse.text;
        
        verseElement.appendChild(verseNumber);
        verseElement.appendChild(verseText);
        
        container.appendChild(verseElement);
    });
    
    // Update active chapter button
    updateActiveChapter(chapterId);
    
    // Update bookmark icons if bookmarks module is available
    if (window.BookmarkModule) {
        window.BookmarkModule.updateVerseBookmarkIcons();
    }
}

function renderSearchResults(results, query, count) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    container.style.display = 'block';
    
    // Header
    const header = document.createElement('div');
    header.className = 'search-header';
    
    const title = document.createElement('h2');
    title.className = 'search-title';
    title.textContent = `Search Results for "${query}"`;
    
    const countText = document.createElement('p');
    countText.className = 'search-count';
    countText.textContent = `Found ${count} result${count !== 1 ? 's' : ''}`;
    
    header.appendChild(title);
    header.appendChild(countText);
    container.appendChild(header);
    
    // Check for book name matches
    const bookMatches = findAllBookMatches(query);
    if (bookMatches.length > 0) {
        const bookSection = document.createElement('div');
        bookSection.className = 'search-book-matches';
        
        const bookTitle = document.createElement('h3');
        bookTitle.className = 'search-section-title';
        bookTitle.textContent = 'Book Matches';
        bookSection.appendChild(bookTitle);
        
        bookMatches.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'search-book-item';
            bookElement.innerHTML = `
                <div class="search-book-info">
                    <span class="search-book-name">${book.name}</span>
                    <span class="search-book-testament">${book.testament}</span>
                </div>
                <span class="search-book-chapters">${book.chapters} chapters</span>
            `;
            
            bookElement.addEventListener('click', () => {
                selectBook(book.id);
                hideSearchResults();
            });
            
            bookSection.appendChild(bookElement);
        });
        
        container.appendChild(bookSection);
        
        // Add separator if there are also verse results
        if (results.length > 0) {
            const separator = document.createElement('div');
            separator.className = 'search-separator';
            const sepTitle = document.createElement('h3');
            sepTitle.className = 'search-section-title';
            sepTitle.textContent = 'Verse Results';
            separator.appendChild(sepTitle);
            container.appendChild(separator);
        }
    }
    
    // Results
    if (results.length === 0 && bookMatches.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <p class="no-results-text">No verses or books found matching your search.</p>
            <p class="no-results-hint">Try searching for a book name (e.g., "Genesis", "John") or verse content.</p>
        `;
        container.appendChild(noResults);
        return;
    }
    
    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        
        const reference = document.createElement('div');
        reference.className = 'search-result-reference';
        reference.textContent = `${getBookName(result.book)} ${result.chapter}:${result.verse}`;
        
        const text = document.createElement('div');
        text.className = 'search-result-text';
        
        // Highlight search terms
        const highlightedText = highlightSearchTerms(result.text, query);
        text.innerHTML = highlightedText;
        
        resultElement.appendChild(reference);
        resultElement.appendChild(text);
        
        resultElement.addEventListener('click', () => {
            navigateToVerse(result.book, result.chapter, result.verse);
        });
        
        container.appendChild(resultElement);
    });
}

// Helper function to find all book matches
function findAllBookMatches(query) {
    const lowerQuery = query.toLowerCase();
    const matches = [];
    
    for (const [id, book] of Object.entries(BIBLE_BOOKS)) {
        if (book.name.toLowerCase().includes(lowerQuery)) {
            matches.push({ id: parseInt(id), ...book });
        }
    }
    
    return matches;
}

function highlightSearchTerms(text, query) {
    const terms = query.split(/\s+/).filter(term => term.length > 0);
    let highlightedText = text;
    
    terms.forEach(term => {
        const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="search-result-highlight">$1</span>');
    });
    
    return highlightedText;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// Navigation Functions
// ============================================
function selectBook(bookId) {
    AppState.currentBook = bookId;
    AppState.currentChapter = null;
    
    // Update UI
    updateActiveBook(bookId);
    updateBreadcrumb(bookId);
    
    // Hide search results
    hideSearchResults();
    
    // Show chapter navigation
    loadChapters(bookId);
    
    // Clear verses and show chapter selection message
    const versesContainer = document.getElementById('versesContainer');
    versesContainer.innerHTML = `
        <div class="welcome-message">
            <svg class="welcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <h2 class="welcome-title">${getBookName(bookId)}</h2>
            <p class="welcome-subtitle">Select a chapter to begin reading</p>
        </div>
    `;
    versesContainer.style.display = 'block';
}

function selectChapter(bookId, chapterId) {
    AppState.currentBook = bookId;
    AppState.currentChapter = chapterId;
    
    // Update UI
    updateBreadcrumb(bookId, chapterId);
    
    // Hide search results
    hideSearchResults();
    
    // Load and display verses
    loadVerses(bookId, chapterId);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToVerse(bookId, chapterId, verseId) {
    selectBook(bookId);
    selectChapter(bookId, chapterId);
    
    // Scroll to verse after a delay to ensure content is loaded
    setTimeout(() => {
        const verseElement = document.querySelector(`[data-verse="${verseId}"]`);
        if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.style.backgroundColor = 'var(--accent-light)';
            setTimeout(() => {
                verseElement.style.backgroundColor = '';
            }, 2000);
        }
    }, 500);
}

// ============================================
// UI Update Functions
// ============================================
function updateActiveBook(bookId) {
    document.querySelectorAll('.book-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.getAttribute('data-book-id')) === bookId) {
            item.classList.add('active');
        }
    });
}

function updateActiveChapter(chapterId) {
    document.querySelectorAll('.chapter-button').forEach(button => {
        button.classList.remove('active');
        if (parseInt(button.getAttribute('data-chapter')) === chapterId) {
            button.classList.add('active');
        }
    });
}

function updateBreadcrumb(bookId, chapterId = null) {
    const breadcrumb = document.getElementById('breadcrumb');
    
    if (!bookId) {
        breadcrumb.innerHTML = '<span class="breadcrumb-item">Select a book to begin</span>';
        return;
    }
    
    let html = `<span class="breadcrumb-item">${getBookName(bookId)}</span>`;
    
    if (chapterId) {
        html += '<span class="breadcrumb-separator">/</span>';
        html += `<span class="breadcrumb-item breadcrumb-current">Chapter ${chapterId}</span>`;
    }
    
    breadcrumb.innerHTML = html;
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Loading...</div>';
    container.style.display = 'block';
}

function showError(message) {
    console.error(message);
    // You could implement a toast notification here
}

function hideSearchResults() {
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('versesContainer').style.display = 'block';
    document.getElementById('chapterNav').style.display = AppState.currentBook ? 'block' : 'none';
}

// ============================================
// Search Functionality
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (AppState.searchTimeout) {
            clearTimeout(AppState.searchTimeout);
        }
        
        // Debounce search
        if (query.length >= 2) {
            AppState.searchTimeout = setTimeout(() => {
                searchBible(query);
            }, 500);
        } else if (query.length === 0) {
            hideSearchResults();
        }
    });
    
    // Clear search on escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            hideSearchResults();
        }
    });
}

// ============================================
// Keyboard Shortcuts
// ============================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Focus search with Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Toggle theme with Ctrl+Shift+L
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Navigate chapters with arrow keys (when not in search)
        if (AppState.currentBook && AppState.currentChapter && document.activeElement.tagName !== 'INPUT') {
            const maxChapters = getChapterCount(AppState.currentBook);
            
            if (e.key === 'ArrowLeft' && AppState.currentChapter > 1) {
                e.preventDefault();
                selectChapter(AppState.currentBook, AppState.currentChapter - 1);
            } else if (e.key === 'ArrowRight' && AppState.currentChapter < maxChapters) {
                e.preventDefault();
                selectChapter(AppState.currentBook, AppState.currentChapter + 1);
            }
        }
    });
}

// ============================================
// Initialization
// ============================================
function init() {
    // Initialize theme
    initTheme();
    
    // Initialize search
    initSearch();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Load books
    loadBooks();
    
    // Set initial breadcrumb
    updateBreadcrumb();
    
    console.log('Bible App Initialized');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
