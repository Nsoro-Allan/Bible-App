# Holy Bible Web Application

A modern, responsive web application for reading and searching the King James Version Bible. Built with vanilla JavaScript and PHP, featuring a clean interface, dark/light themes, and comprehensive search functionality.

## Features

- **Modern Interface** - Clean, professional design with intuitive navigation
- **Dark/Light Mode** - Toggle between themes with persistent user preference
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Full-Text Search** - Search the entire Bible with instant results and highlighting
- **Easy Navigation** - Browse all 66 books, chapters, and verses effortlessly
- **Keyboard Shortcuts** - Efficient navigation with keyboard commands
- **Bookmarks** - Save and organize your favorite verses (via bookmarks.php API)

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server (or XAMPP/LAMPP)
- Modern web browser

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Nsoro-Allan/Bible-App.git
cd Bible-App
```

### 2. Database Setup

Start your database server and import the Bible database:

```bash
# Access MySQL
mysql -u root -p

# Create and import database
CREATE DATABASE bible_gen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bible_gen;
SOURCE Database/bible.sql;
exit;
```

### 3. Configure Database Connection

Update the database configuration in `config/database.php`:

```php
$host = 'localhost';
$db = 'bible_gen';
$user = 'root';
$pass = '';
```

### 4. Start the Application

**Using XAMPP/LAMPP:**
```bash
sudo /opt/lampp/lampp start
```

Access the application at: `http://localhost/Bible/`

**Using PHP Built-in Server (Development):**
```bash
php -S localhost:8000
```

Access the application at: `http://localhost:8000`

## Usage

### Navigation

1. **Select a Book** - Click any book from the sidebar (Old Testament or New Testament)
2. **Choose a Chapter** - Select a chapter number from the grid
3. **Read Verses** - Verses display with numbered formatting for easy reference

### Search

- Enter keywords in the search bar to find verses
- Results display with book, chapter, and verse references
- Click any result to navigate directly to that verse
- Search terms are highlighted in the results

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` (or `Cmd + K`) | Focus search bar |
| `Ctrl + Shift + L` | Toggle light/dark theme |
| `Arrow Left` | Navigate to previous chapter |
| `Arrow Right` | Navigate to next chapter |
| `Escape` | Clear search |

### Theme Toggle

Click the sun/moon icon in the header to switch between light and dark themes. Your preference is saved automatically in local storage.

## Project Structure

```
Bible/
├── index.html                 # Main application entry point
├── api/                       # Backend API endpoints
│   ├── bookmarks.php         # Bookmark management
│   ├── daily_verse.php       # Daily verse functionality
│   ├── folders.php           # Folder organization
│   ├── get_books.php         # Fetch all books
│   ├── get_chapters.php      # Fetch chapters for a book
│   ├── get_verses.php        # Fetch verses for a chapter
│   └── search.php            # Search functionality
├── assets/
│   ├── css/
│   │   └── styles.css        # Application styles and theme system
│   ├── images/
│   │   └── favicon.png       # Application icon
│   └── js/
│       ├── app.js            # Main application logic
│       ├── bible-data.js     # Bible reference data
│       └── bookmarks.js      # Bookmark management logic
├── config/
│   └── database.php          # Database configuration
├── Database/
│   └── bible.sql             # Bible database schema and data
└── README.md                 # Project documentation
```

## Technical Stack

### Frontend
- HTML5, CSS3, and Vanilla JavaScript
- CSS Custom Properties for theming
- Responsive Grid and Flexbox layouts
- SVG icons for scalable graphics

### Backend
- PHP with MySQLi
- Prepared statements for SQL injection prevention
- RESTful API design
- JSON response format

### Database
- MySQL with UTF-8 support
- Indexed columns for optimized search performance

**Schema (table: `t_kjv`):**
- `id` - Unique verse identifier
- `b` - Book number (1-66)
- `c` - Chapter number
- `v` - Verse number
- `t` - Verse text content

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Styling

Customize the application theme by editing CSS variables in `assets/css/styles.css`:

```css
:root {
    --accent-primary: #3ecf8e;  /* Primary accent color */
    --bg-primary: #ffffff;       /* Main background */
    --text-primary: #1a1a1a;     /* Primary text color */
    /* Additional theme variables */
}
```

### Database Configuration

Modify database connection settings in `config/database.php`:

```php
$host = 'your-host';
$db = 'your-database';
$user = 'your-username';
$pass = 'your-password';
```

## Troubleshooting

### Database Connection Errors

**Issue:** Cannot connect to database

**Solutions:**
- Verify MySQL service is running: `sudo /opt/lampp/lampp status`
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Confirm credentials in `config/database.php`
- Ensure database user has proper permissions

### No Books Displayed

**Issue:** Sidebar is empty or books don't load

**Solutions:**
- Open browser console (F12) and check for errors
- Verify API endpoint responds: `http://localhost/Bible/api/get_books.php`
- Confirm database was imported successfully
- Check that the `t_kjv` table contains data

### Search Not Functioning

**Issue:** Search returns no results or errors

**Solutions:**
- Test search endpoint directly: `http://localhost/Bible/api/search.php?q=test`
- Verify `t_kjv` table exists and has data
- Check browser console for JavaScript errors
- Ensure proper UTF-8 encoding in database

### Theme Not Persisting

**Issue:** Theme resets on page reload

**Solutions:**
- Check that browser allows localStorage
- Verify browser is not in private/incognito mode
- Clear browser cache and try again

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows existing style conventions and include appropriate documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

The King James Version Bible text is in the public domain.

## Acknowledgments

- Bible text: King James Version (Public Domain)
- SVG icons: Custom designed for this application

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Provide details about your environment and the problem

---

**Developed for Bible study and reading**
