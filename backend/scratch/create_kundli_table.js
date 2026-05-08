
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const createTable = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS kundli_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                mobile VARCHAR(20) NOT NULL,
                gender VARCHAR(20) NOT NULL,
                dob DATE NOT NULL,
                tob TIME NOT NULL,
                pob VARCHAR(255) NOT NULL,
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                timezone_offset DECIMAL(4, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(sql);
        console.log("✅ Table 'kundli_requests' created or already exists.");
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    } finally {
        await connection.end();
    }
};

createTable();
