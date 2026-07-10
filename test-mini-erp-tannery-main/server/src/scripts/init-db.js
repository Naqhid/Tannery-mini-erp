import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.join(__dirname, '..', '..', 'sql');

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'tannery_mini_erp';

  // Connect without database name to run schema (which creates the DB)
  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

  try {
    console.log('Running schema.sql...');
    const schema = fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8');
    await conn.query(schema);
    console.log('Schema created.');

    console.log('Running seed.sql...');
    const seed = fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8');
    await conn.query(seed);
    console.log('Seed data inserted.');

    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

initDB();
