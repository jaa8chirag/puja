
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkServices() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute("SELECT id, puja_name, image_url, puja_type FROM services WHERE puja_type = 'katha'");
        console.log('Katha Services from DB:');
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkServices();
