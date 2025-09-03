import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let db;


export async function getDb() {
if (db) return db;
db = await open({ filename: path.join(__dirname, '..', 'database.db'), driver: sqlite3.Database });
await db.exec(`CREATE TABLE IF NOT EXISTS recordings (
id INTEGER PRIMARY KEY AUTOINCREMENT,
public_id TEXT NOT NULL,
secure_url TEXT NOT NULL,
filename TEXT NOT NULL,
filesize INTEGER NOT NULL,
format TEXT,
duration REAL,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);
return db;
}