const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
      multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('Schema executed successfully.');

    const seedPath = path.join(__dirname, 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        console.log('Executing seed.sql...');
        await connection.query(seedSql);
        console.log('Seed executed successfully.');
    }

    await connection.end();
    console.log('Database setup complete.');
  } catch (err) {
    console.error('Error setting up database:', err);
  }
}

setup();
