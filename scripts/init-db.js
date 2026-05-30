// scripts/init-db.js
// Run with: node scripts/init-db.js
import mysql from 'mysql2/promise';
import * as dotenv from 'fs';

// Read .env.local manually
const envFile = dotenv.readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim()))
);

const config = {
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT || '3306'),
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  multipleStatements: true,
};

const SQL = `
CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\`;
USE \`${env.DB_NAME}\`;

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('daily','weekly') NOT NULL,
  name VARCHAR(255) NOT NULL,
  days JSON DEFAULT NULL,
  UNIQUE KEY uq_type_name (type, name)
);

CREATE TABLE IF NOT EXISTS activity_meta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) DEFAULT 'Other / Custom',
  time_val VARCHAR(10) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS activity_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date_key VARCHAR(10) NOT NULL,
  type ENUM('daily','weekly') NOT NULL,
  name VARCHAR(255) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_history (date_key, type, name)
);

CREATE TABLE IF NOT EXISTS todos (
  id BIGINT PRIMARY KEY,
  task TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Learning',
  completed TINYINT(1) NOT NULL DEFAULT 0,
  created_at VARCHAR(30) NOT NULL
);
`;

async function main() {
  const conn = await mysql.createConnection(config);
  console.log('Connected to MySQL');
  await conn.query(SQL);
  console.log('✅ Database and tables created successfully!');
  console.log(`Database: ${env.DB_NAME}`);
  console.log('Tables: activities, activity_meta, activity_history, todos');
  await conn.end();
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
