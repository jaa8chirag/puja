import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkBlogsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.query("SHOW TABLES LIKE 'blogs'");
        if (rows.length === 0) {
            console.log("Table 'blogs' does NOT exist. Creating it...");
            await connection.query(`
                CREATE TABLE IF NOT EXISTS blogs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) NOT NULL UNIQUE,
                    excerpt TEXT,
                    content LONGTEXT NOT NULL,
                    category VARCHAR(100),
                    tag VARCHAR(100),
                    author VARCHAR(100),
                    image_url VARCHAR(255),
                    read_time VARCHAR(50) DEFAULT '5 min',
                    status ENUM('draft', 'published') DEFAULT 'draft',
                    views INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log("Table 'blogs' created successfully.");
        } else {
            console.log("Table 'blogs' already exists.");
            const [columns] = await connection.query("DESCRIBE blogs");
            console.log("Columns:", columns.map(c => c.Field).join(', '));
            
            const [rowsCount] = await connection.query("SELECT COUNT(*) as total FROM blogs");
            console.log("Total Blogs in DB:", rowsCount[0].total);
            
            const [publishedCount] = await connection.query("SELECT COUNT(*) as total FROM blogs WHERE status = 'published'");
            console.log("Published Blogs:", publishedCount[0].total);
        }
    } catch (err) {
        console.error("Error checking/creating blogs table:", err);
    } finally {
        await connection.end();
    }
}

checkBlogsTable();
