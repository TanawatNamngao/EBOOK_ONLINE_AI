const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'ebookstore.db');
const db = new Database(dbPath);

// เปิดใช้ Foreign Key Constraints
db.pragma('foreign_keys = ON');

function initDatabase() {
    try {
        const tableCheck = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='ebooks'").get();
        if (tableCheck.count === 0) {
            console.log('🔄 Initializing database schema from schema.sql...');
            const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
            db.exec(schemaSql);

            console.log('🌱 Seeding initial database records from seed.sql...');
            const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
            db.exec(seedSql);

            console.log('✅ Database initialized and seeded successfully with 30+ orders!');
        } else {
            console.log('📦 Database already initialized.');
        }
    } catch (err) {
        console.error('❌ Database initialization error:', err);
    }
}

// เรียกใช้ทันที
initDatabase();

module.exports = db;
