-- ============================================
-- Bookmark System Tables
-- ============================================

--
-- Table structure for table `bookmark_folders`
--

CREATE TABLE `bookmark_folders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Insert default Favorites folder
--

INSERT INTO `bookmark_folders` (`name`, `is_default`) VALUES ('Favorites', 1);

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `folder_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `chapter` int(11) NOT NULL,
  `verse` int(11) NOT NULL,
  `verse_text` text NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bookmark` (`book_id`, `chapter`, `verse`),
  KEY `idx_folder_id` (`folder_id`),
  KEY `idx_book_chapter` (`book_id`, `chapter`),
  CONSTRAINT `fk_bookmarks_folder` 
    FOREIGN KEY (`folder_id`) 
    REFERENCES `bookmark_folders` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
