const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'idea_graveyard_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: { rejectUnauthorized: false }
  });
  const [rows] = await connection.execute(
    `SELECT * FROM FAILURE_CATEGORIES`
  );
  console.log('Query result:', rows.length);
  await connection.end();
}
test().catch(console.error);
