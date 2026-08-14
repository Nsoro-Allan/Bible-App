// ============================================
// Bookmark State Management
// ============================================
const BookmarkState = {
    folders: [],
    bookmarks: [],
    currentVerse: null,
    isCreatingFolder: false,
    selectedFolderId: null
};

// ============================================
// Bookmark API Functions
// ============================================
async function bookmarkAPI(endpoint, options = {}) {
    try {
        const url = `api/${endpoint}`;
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error(`Bookmark API Error (${endpoint}):`, error);
        showNotification(`Error: ${error.message}`, 'error');
        return null;
    }
}

async function loadFolders() {
    const data = await bookmarkAPI('folders.php?action=list');
    if (data && data.folders) {
        BookmarkState.folders = data.folders;
        updateFolderSelects();
        return data.folders;
    }
    return [];
}

async function createFolder(name) {
    const data = await bookmarkAPI('folders.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    
    if (data) {
        await loadFolders();
        showNotification('Folder created successfully', 'success');
        return data.folder_id;
    }
    return null;
}

async function loadBookmarks(folderId = null) {
    const params = folderId ? `?action=list&folder_id=${folderId}` : '?action=list';
    const data = await bookmarkAPI(`bookmarks.php${params}`);
    
    if (data && data.bookmarks) {
        BookmarkState.bookmarks = data.bookmarks;
        updateBookmarkCount();
        updateBookmarksPanel();
        updateVerseBookmarkIcons();
        return data.bookmarks;
    }
    return [];
}

async function checkBookmark(bookId, chapter, verse) {
    const data = await bookmarkAPI(`bookmarks.php?action=check&book_id=${bookId}&chapter=${chapter}&verse=${verse}`);
    return data;
}

async function addBookmark(bookmarkData) {
    const data = await bookmarkAPI('bookmarks.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmarkData)
    });
    
    if (data) {
        await loadBookmarks();
        showNotification('Bookmark saved successfully', 'success');
        return true;
    }
    return false;
}

async function deleteBookmark(bookmarkId) {
    const data = await bookmarkAPI(`bookmarks.php?action=remove&id=${bookmarkId}`, {
        method: 'DELETE'
    });
    
    if (data) {
        await loadBookmarks();
        showNotification('Bookmark removed successfully', 'success');
        return true;
    }
    return false;
}

async function exportBookmarks() {
    const data = await bookmarkAPI('bookmarks.php?action=export');
    
    if (data && data.data) {
        const json = JSON.stringify(data.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bible-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Bookmarks exported successfully', 'success');
        return true;
    }
    return false;
}

async function importBookmarks(fileContent) {
    try {
        const importData = JSON.parse(fileContent);
        
        const data = await bookmarkAPI('bookmarks.php?action=import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: importData })
        });
        
        if (data) {
            await loadFolders();
            await loadBookmarks();
            showNotification(`Import completed: ${data.imported} imported, ${data.skipped} skipped`, 'success');
            return true;
        }
        return false;
    } catch (error) {
        showNotification('Invalid bookmark file format', 'error');
        return false;
    }
}

// ============================================
// UI Update Functions
// ============================================
function updateFolderSelects() {
    const bookmarkFolderSelect = document.getElementById('bookmarkFolder');
    const filterSelect = document.getElementById('bookmarkFolderFilter');
    
    // Update bookmark modal folder select
    if (bookmarkFolderSelect) {
        const currentValue = bookmarkFolderSelect.value;
        bookmarkFolderSelect.innerHTML = '';
        
        BookmarkState.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            if (folder.is_default == 1) {
                option.textContent += ' (Default)';
            }
            bookmarkFolderSelect.appendChild(option);
        });
        
        // Restore selection or select default
        if (currentValue && BookmarkState.folders.find(f => f.id == currentValue)) {
            bookmarkFolderSelect.value = currentValue;
        } else {
            const defaultFolder = BookmarkState.folders.find(f => f.is_default == 1);
            if (defaultFolder) {
                bookmarkFolderSelect.value = defaultFolder.id;
            }
        }
    }
    
    // Update filter select
    if (filterSelect) {
        const currentFilter = filterSelect.value;
        filterSelect.innerHTML = '<option value="">All Folders</option>';
        
        BookmarkState.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = `${folder.name} (${folder.bookmark_count || 0})`;
            filterSelect.appendChild(option);
        });
        
        if (currentFilter) {
            filterSelect.value = currentFilter;
        }
    }
}

function updateBookmarkCount() {
    const countElement = document.getElementById('bookmarkCount');
    const count = BookmarkState.bookmarks.length;
    
    if (countElement) {
        countElement.textContent = count;
        if (count === 0) {
            countElement.style.display = 'none';
        } else {
            countElement.style.display = 'flex';
        }
    }
}

function updateBookmarksPanel() {
    const panelBody = document.getElementById('bookmarksPanelBody');
    const filterSelect = document.getElementById('bookmarkFolderFilter');
    const filterId = filterSelect ? filterSelect.value : '';
    
    if (!panelBody) return;
    
    panelBody.innerHTML = '';
    
    // Filter bookmarks
    let displayBookmarks = BookmarkState.bookmarks;
    if (filterId) {
        displayBookmarks = BookmarkState.bookmarks.filter(b => b.folder_id == filterId);
    }
    
    if (displayBookmarks.length === 0) {
        panelBody.innerHTML = `
            <div class="bookmarks-empty">
                <svg class="bookmarks-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <p class="bookmarks-empty-text">No bookmarks yet.<br>Click on any verse to add a bookmark.</p>
            </div>
        `;
        return;
    }
    
    displayBookmarks.forEach(bookmark => {
        const bookmarkElement = createBookmarkElement(bookmark);
        panelBody.appendChild(bookmarkElement);
    });
}

function createBookmarkElement(bookmark) {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.setAttribute('data-bookmark-id', bookmark.id);
    
    const bookName = getBookName(bookmark.book_id);
    const reference = `${bookName} ${bookmark.chapter}:${bookmark.verse}`;
    
    div.innerHTML = `
        <div class="bookmark-item-header">
            <span class="bookmark-item-reference">${reference}</span>
            <div class="bookmark-item-actions">
                <button class="bookmark-item-action delete" data-action="delete" title="Delete bookmark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
        <p class="bookmark-item-text">${bookmark.verse_text}</p>
        <span class="bookmark-item-folder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            ${bookmark.folder_name}
        </span>
        ${bookmark.note ? `<div class="bookmark-item-note">${bookmark.note}</div>` : ''}
    `;
    
    // Click on bookmark to navigate
    div.addEventListener('click', (e) => {
        if (!e.target.closest('.bookmark-item-action')) {
            navigateToVerse(bookmark.book_id, bookmark.chapter, bookmark.verse);
            closeBookmarksPanel();
        }
    });
    
    // Delete button - open confirmation modal instead of confirm()
    const deleteBtn = div.querySelector('[data-action="delete"]');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteConfirmModal(bookmark);
    });
    
    return div;
}

function updateVerseBookmarkIcons() {
    // Remove existing icons
    document.querySelectorAll('.verse-bookmark-icon').forEach(icon => icon.remove());
    
    // Add icons to verses
    document.querySelectorAll('.verse').forEach(verseElement => {
        const verseNumber = parseInt(verseElement.getAttribute('data-verse'));
        
        if (!verseNumber || !AppState.currentBook || !AppState.currentChapter) return;
        
        // Check if this verse is bookmarked
        const isBookmarked = BookmarkState.bookmarks.some(b => 
            b.book_id == AppState.currentBook && 
            b.chapter == AppState.currentChapter && 
            b.verse == verseNumber
        );
        
        // Create bookmark icon
        const icon = document.createElement('button');
        icon.className = 'verse-bookmark-icon';
        if (isBookmarked) {
            icon.classList.add('bookmarked');
        }
        icon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        icon.title = isBookmarked ? 'Edit bookmark' : 'Add bookmark';
        
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const verseText = verseElement.querySelector('.verse-text').textContent;
            openBookmarkModal(AppState.currentBook, AppState.currentChapter, verseNumber, verseText);
        });
        
        verseElement.appendChild(icon);
    });
}

// ============================================
// Modal Functions
// ============================================
function openBookmarkModal(bookId, chapter, verse, verseText) {
    BookmarkState.currentVerse = { bookId, chapter, verse, verseText };
    
    const modal = document.getElementById('bookmarkModal');
    const modalTitle = document.getElementById('bookmarkModalTitle');
    const reference = document.getElementById('bookmarkReference');
    const text = document.getElementById('bookmarkText');
    const noteInput = document.getElementById('bookmarkNote');
    const removeBtn = document.getElementById('removeBookmark');
    
    // Set verse info
    const bookName = getBookName(bookId);
    reference.textContent = `${bookName} ${chapter}:${verse}`;
    text.textContent = verseText;
    
    // Check if verse is already bookmarked
    checkBookmark(bookId, chapter, verse).then(data => {
        if (data && data.bookmarked) {
            modalTitle.textContent = 'Edit Bookmark';
            removeBtn.style.display = 'block';
            
            // Find the bookmark to get the note
            const bookmark = BookmarkState.bookmarks.find(b => 
                b.book_id == bookId && b.chapter == chapter && b.verse == verse
            );
            if (bookmark) {
                document.getElementById('bookmarkFolder').value = bookmark.folder_id;
                noteInput.value = bookmark.note || '';
            }
        } else {
            modalTitle.textContent = 'Add Bookmark';
            removeBtn.style.display = 'none';
            noteInput.value = '';
        }
    });
    
    // Reset folder creation UI
    hideNewFolderInput();
    
    // Show modal
    modal.style.display = 'flex';
}

function closeBookmarkModal() {
    const modal = document.getElementById('bookmarkModal');
    modal.style.display = 'none';
    BookmarkState.currentVerse = null;
}

// Delete Confirmation Modal Functions
let bookmarkToDelete = null;

function openDeleteConfirmModal(bookmark) {
    bookmarkToDelete = bookmark;
    
    const modal = document.getElementById('deleteConfirmModal');
    const reference = document.getElementById('deleteBookmarkReference');
    const text = document.getElementById('deleteBookmarkText');
    
    const bookName = getBookName(bookmark.book_id);
    reference.textContent = `${bookName} ${bookmark.chapter}:${bookmark.verse}`;
    text.textContent = bookmark.verse_text;
    
    modal.style.display = 'flex';
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
    bookmarkToDelete = null;
}

async function confirmDeleteBookmark() {
    if (bookmarkToDelete) {
        const success = await deleteBookmark(bookmarkToDelete.id);
        if (success) {
            closeDeleteConfirmModal();
        }
    }
}

function showNewFolderInput() {
    const newFolderGroup = document.getElementById('newFolderGroup');
    const newFolderInput = document.getElementById('newFolderName');
    
    newFolderGroup.style.display = 'block';
    newFolderInput.focus();
    BookmarkState.isCreatingFolder = true;
}

function hideNewFolderInput() {
    const newFolderGroup = document.getElementById('newFolderGroup');
    const newFolderInput = document.getElementById('newFolderName');
    
    newFolderGroup.style.display = 'none';
    newFolderInput.value = '';
    BookmarkState.isCreatingFolder = false;
}

async function saveBookmark() {
    if (!BookmarkState.currentVerse) return;
    
    const folderSelect = document.getElementById('bookmarkFolder');
    const noteInput = document.getElementById('bookmarkNote');
    const newFolderInput = document.getElementById('newFolderName');
    
    let folderId = folderSelect.value;
    
    // Check if creating a new folder
    if (BookmarkState.isCreatingFolder) {
        const folderName = newFolderInput.value.trim();
        if (!folderName) {
            showNotification('Please enter a folder name', 'error');
            return;
        }
        
        const newFolderId = await createFolder(folderName);
        if (newFolderId) {
            folderId = newFolderId;
        } else {
            return;
        }
    }
    
    const bookmarkData = {
        folder_id: folderId,
        book_id: BookmarkState.currentVerse.bookId,
        chapter: BookmarkState.currentVerse.chapter,
        verse: BookmarkState.currentVerse.verse,
        verse_text: BookmarkState.currentVerse.verseText,
        note: noteInput.value.trim()
    };
    
    const success = await addBookmark(bookmarkData);
    if (success) {
        closeBookmarkModal();
    }
}

async function removeCurrentBookmark() {
    if (!BookmarkState.currentVerse) return;
    
    const { bookId, chapter, verse } = BookmarkState.currentVerse;
    const bookmark = BookmarkState.bookmarks.find(b => 
        b.book_id == bookId && b.chapter == chapter && b.verse == verse
    );
    
    if (bookmark) {
        if (confirm('Are you sure you want to remove this bookmark?')) {
            const success = await deleteBookmark(bookmark.id);
            if (success) {
                closeBookmarkModal();
            }
        }
    }
}

// ============================================
// Bookmarks Panel Functions
// ============================================
function toggleBookmarksPanel() {
    const panel = document.getElementById('bookmarksPanel');
    const toggle = document.getElementById('bookmarkToggle');
    
    if (panel.style.display === 'none' || !panel.classList.contains('active')) {
        openBookmarksPanel();
    } else {
        closeBookmarksPanel();
    }
}

function openBookmarksPanel() {
    const panel = document.getElementById('bookmarksPanel');
    const toggle = document.getElementById('bookmarkToggle');
    
    panel.style.display = 'flex';
    setTimeout(() => {
        panel.classList.add('active');
    }, 10);
    toggle.classList.add('active');
    
    loadBookmarks();
}

function closeBookmarksPanel() {
    const panel = document.getElementById('bookmarksPanel');
    const toggle = document.getElementById('bookmarkToggle');
    
    panel.classList.remove('active');
    toggle.classList.remove('active');
    
    setTimeout(() => {
        panel.style.display = 'none';
    }, 300);
}

// ============================================
// Import/Export Functions
// ============================================
function handleExport() {
    exportBookmarks();
}

function handleImport() {
    const fileInput = document.getElementById('importFileInput');
    fileInput.click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        importBookmarks(e.target.result);
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles inline for simplicity
    notification.style.cssText = `
        position: fixed;
        top: ${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) + 20}px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-size: 14px;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Daily Verse Functions
// ============================================
let currentDailyVerse = null;

async function loadDailyVerse(random = false) {
    const verseText = document.getElementById('dailyVerseText');
    const verseReference = document.getElementById('dailyVerseReference');
    const card = document.getElementById('dailyVerseCard');
    
    if (!verseText || !verseReference) return;
    
    // Show loading state
    verseText.classList.add('loading');
    verseText.textContent = 'Loading verse...';
    verseReference.textContent = '';
    
    try {
        const action = random ? 'random' : 'daily';
        const response = await fetch(`api/daily_verse.php?action=${action}`);
        const data = await response.json();
        
        if (data.success && data.verse) {
            currentDailyVerse = data.verse;
            const bookName = getBookName(data.verse.book_id);
            
            verseText.classList.remove('loading');
            verseText.textContent = `"${data.verse.text}"`;
            verseReference.textContent = `${bookName} ${data.verse.chapter}:${data.verse.verse}`;
            
            // Show card
            card.classList.remove('hidden');
        } else {
            throw new Error('Failed to load verse');
        }
    } catch (error) {
        console.error('Daily verse error:', error);
        verseText.classList.remove('loading');
        verseText.textContent = 'Unable to load verse. Please try again.';
        verseReference.textContent = '';
    }
}

function goToDailyVerseLocation() {
    if (currentDailyVerse) {
        navigateToVerse(
            currentDailyVerse.book_id,
            currentDailyVerse.chapter,
            currentDailyVerse.verse
        );
        
        // Hide daily verse card after navigation
        const card = document.getElementById('dailyVerseCard');
        if (card) {
            card.style.display = 'none';
        }
    }
}

// ============================================
// Event Listeners Setup
// ============================================
function initBookmarks() {
    // Load initial data
    loadFolders();
    loadBookmarks();
    
    // Load daily verse
    loadDailyVerse();
    
    // Bookmark toggle button
    const bookmarkToggle = document.getElementById('bookmarkToggle');
    if (bookmarkToggle) {
        bookmarkToggle.addEventListener('click', toggleBookmarksPanel);
    }
    
    // Close bookmarks panel
    const closePanel = document.getElementById('closeBookmarksPanel');
    if (closePanel) {
        closePanel.addEventListener('click', closeBookmarksPanel);
    }
    
    // Modal close buttons
    const closeModal = document.getElementById('closeBookmarkModal');
    const cancelModal = document.getElementById('cancelBookmark');
    const modalOverlay = document.getElementById('bookmarkModalOverlay');
    
    if (closeModal) closeModal.addEventListener('click', closeBookmarkModal);
    if (cancelModal) cancelModal.addEventListener('click', closeBookmarkModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeBookmarkModal);
    
    // Delete modal close buttons
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const deleteModalOverlay = document.getElementById('deleteModalOverlay');
    const confirmDelete = document.getElementById('confirmDelete');
    
    if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeDeleteConfirmModal);
    if (cancelDelete) cancelDelete.addEventListener('click', closeDeleteConfirmModal);
    if (deleteModalOverlay) deleteModalOverlay.addEventListener('click', closeDeleteConfirmModal);
    if (confirmDelete) confirmDelete.addEventListener('click', confirmDeleteBookmark);
    
    // Save bookmark button
    const saveBtn = document.getElementById('saveBookmark');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveBookmark);
    }
    
    // Remove bookmark button
    const removeBtn = document.getElementById('removeBookmark');
    if (removeBtn) {
        removeBtn.addEventListener('click', removeCurrentBookmark);
    }
    
    // Create folder button
    const createFolderBtn = document.getElementById('btnCreateFolder');
    if (createFolderBtn) {
        createFolderBtn.addEventListener('click', showNewFolderInput);
    }
    
    // Cancel folder button
    const cancelFolderBtn = document.getElementById('btnCancelFolder');
    if (cancelFolderBtn) {
        cancelFolderBtn.addEventListener('click', hideNewFolderInput);
    }
    
    // Folder filter
    const folderFilter = document.getElementById('bookmarkFolderFilter');
    if (folderFilter) {
        folderFilter.addEventListener('change', () => {
            updateBookmarksPanel();
        });
    }
    
    // Export button
    const exportBtn = document.getElementById('btnExportBookmarks');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Import button
    const importBtn = document.getElementById('btnImportBookmarks');
    if (importBtn) {
        importBtn.addEventListener('click', handleImport);
    }
    
    // File input
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileImport);
    }
    
    // Daily verse buttons
    const refreshDailyVerse = document.getElementById('refreshDailyVerse');
    if (refreshDailyVerse) {
        refreshDailyVerse.addEventListener('click', () => loadDailyVerse(true));
    }
    
    const goToDailyVerse = document.getElementById('goToDailyVerse');
    if (goToDailyVerse) {
        goToDailyVerse.addEventListener('click', goToDailyVerseLocation);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Close modal on Escape
        if (e.key === 'Escape') {
            const bookmarkModal = document.getElementById('bookmarkModal');
            if (bookmarkModal && bookmarkModal.style.display === 'flex') {
                closeBookmarkModal();
            }
            
            const deleteModal = document.getElementById('deleteConfirmModal');
            if (deleteModal && deleteModal.style.display === 'flex') {
                closeDeleteConfirmModal();
            }
            
            const panel = document.getElementById('bookmarksPanel');
            if (panel && panel.classList.contains('active')) {
                closeBookmarksPanel();
            }
        }
        
        // Toggle bookmarks panel with Ctrl+B
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleBookmarksPanel();
        }
    });
    
    console.log('Bookmarks Initialized');
}

// Initialize bookmarks when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookmarks);
} else {
    initBookmarks();
}

// Export functions for use in app.js
window.BookmarkModule = {
    loadBookmarks,
    updateVerseBookmarkIcons,
    BookmarkState
};
