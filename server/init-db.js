require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function main() {
  console.log('========================================================');
  console.log('🛒 QuickBasket MySQL Database Initializer & Migration');
  console.log('========================================================');

  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'quickbasket_db';

  console.log(`Checking connection to MySQL server at ${host}:${port} as '${user}'...`);

  try {
    const testConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 5000
    });

    console.log('✅ Connection to MySQL Server successful!');

    console.log(`Creating database '${database}' if not exists...`);
    await testConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await testConnection.end();

    console.log('Running full schema and table migrations...');
    const connected = await db.initDatabase();

    if (connected) {
      const status = db.getDbStatus();
      console.log('========================================================');
      console.log('🎉 QuickBasket MySQL setup complete!');
      console.log(`   Database: ${status.database}`);
      console.log(`   Products seeded: ${status.counts.products}`);
      console.log(`   Categories: ${status.counts.categories}`);
      console.log(`   Orders: ${status.counts.orders}`);
      console.log('========================================================');
      process.exit(0);
    } else {
      console.log('⚠️ Migration finished with fallback mode.');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Could not connect to MySQL Server:', error.message);
    console.log('');
    console.log('Troubleshooting Tips:');
    console.log('1. Make sure MySQL service is running on your machine (e.g., Services -> MySQL80 -> Start, or XAMPP / WAMP).');
    console.log('2. Check your password in server/.env (DB_PASSWORD=your_password).');
    console.log('3. You can also import server/schema.sql directly into MySQL Workbench or phpMyAdmin.');
    console.log('4. Meanwhile, QuickBasket Express will run smoothly using its JSON fallback store.');
    process.exit(1);
  }
}

main();

