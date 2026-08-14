# Holy Bible Web App - KJV

A modern, professional Bible web application featuring the King James Version with a clean, responsive design inspired by Supabase.

## Features

- ✨ **Modern Design** - Clean, professional interface with solid colors (no gradients)
- 🌓 **Dark/Light Mode** - Toggle between themes with persistent preference
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 🔍 **Real-time Search** - Search the entire Bible with instant results and highlighting
- 📖 **Easy Navigation** - Browse all 66 books, chapters, and verses
- ⌨️ **Keyboard Shortcuts** - Efficient navigation with keyboard commands
- 🎨 **Supabase-Inspired UI** - Professional aesthetic with smooth animations

## Installation & Setup

### Prerequisites
- XAMPP/LAMPP installed with Apache and MySQL running
- PHP 7.4 or higher
- Modern web browser

### Database Setup

1. Start your XAMPP/LAMPP services:
```bash
sudo /opt/lampp/lampp start
```

2. Import the Bible database:
```bash
# Access MySQL
mysql -u root -p

# Create database and import
CREATE DATABASE bible_gen;
USE bible_gen;
SOURCE /opt/lampp/htdocs/Bible/Database/t_english-kjv.sql;
exit;
```

### Configuration

The default database configuration is in `config/database.php`:
- Host: `localhost`
- User: `root`
- Password: `` (empty)
- Database: `bible_gen`

Update these values if your setup is different.

### Access the Application

Open your web browser and navigate to:
```
http://localhost/Bible/
```

## Features & Usage

### Navigation
- **Select a Book** - Click any book from the sidebar
- **Choose a Chapter** - Click a chapter number from the grid
- **Read Verses** - Verses display with numbered formatting

### Search
- Type in the search bar to find verses containing your query
- Results show book, chapter, and verse references
- Click any result to jump directly to that verse
- Search terms are highlighted in results

### Keyboard Shortcuts
- `Ctrl + K` (or `Cmd + K` on Mac) - Focus search bar
- `Ctrl + Shift + L` - Toggle light/dark theme
- `Arrow Left` - Previous chapter
- `Arrow Right` - Next chapter
- `Escape` - Clear search

### Theme Toggle
- Click the sun/moon icon in the header to switch themes
- Your preference is saved automatically

## File Structure

```
Bible/
├── index.html              # Main application page
├── api/                    # Backend API endpoints
│   ├── get_books.php      # Fetch all books
│   ├── get_chapters.php   # Fetch chapters for a book
│   ├── get_verses.php     # Fetch verses for a chapter
│   └── search.php         # Search functionality
├── assets/
│   ├── css/
│   │   └── styles.css     # All styling (theme system included)
│   └── js/
│       ├── bible-data.js  # Bible reference data
│       └── app.js         # Main application logic
├── config/
│   └── database.php       # Database configuration
├── Database/
│   └── t_english-kjv.sql  # Bible database dump
└── README.md              # This file
```

## Technical Details

### Frontend
- Pure HTML5, CSS3, and Vanilla JavaScript (no frameworks)
- CSS Custom Properties for theming
- Responsive Grid Layout
- SVG icons for crisp display at any resolution

### Backend
- PHP with MySQLi
- Prepared statements for SQL injection protection
- RESTful API architecture
- JSON responses

### Database Schema
Table: `t_kjv`
- `id` - Unique verse identifier
- `b` - Book number (1-66)
- `c` - Chapter number
- `v` - Verse number
- `t` - Verse text
- `Timestamp` - Last updated

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Change Colors
Edit CSS variables in `assets/css/styles.css`:
```css
:root {
    --accent-primary: #3ecf8e;  /* Primary accent color */
    --bg-primary: #ffffff;       /* Main background */
    /* ... more variables */
}
```

### Modify Database Connection
Edit `config/database.php` to update connection details.

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running: `sudo /opt/lampp/lampp status`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Check database credentials in `config/database.php`

### No Books Showing
- Check browser console for errors (F12)
- Verify API endpoint is accessible: `http://localhost/Bible/api/get_books.php`
- Ensure database has been imported correctly

### Search Not Working
- Verify `search.php` endpoint returns data
- Check that database table `t_kjv` exists and has data
- Look for JavaScript errors in console

## Credits

- **Bible Text**: King James Version (Public Domain)
- **Design Inspiration**: Supabase
- **Icons**: Custom SVG icons

## License

This application code is provided as-is for educational and personal use. The King James Version Bible text is in the public domain.

---

**Built with ❤️ for Bible study and reading**
