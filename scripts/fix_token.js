const db = require('../database/db');
const { pool } = require('../database/supabase');

async function fix() {
    // SQLite
    const rows = db.prepare('SELECT download_id, token FROM download_links').all();
    const updateSqlite = db.prepare('UPDATE download_links SET download_url = ? WHERE download_id = ?');
    for (const r of rows) {
        updateSqlite.run(`/api/download/${r.token}`, r.download_id);
    }
    console.log(`Updated ${rows.length} download links in SQLite.`);

    // Supabase
    const supaRows = await pool.query('SELECT download_id, token FROM download_links');
    for (const r of supaRows.rows) {
        await pool.query('UPDATE download_links SET download_url = $1 WHERE download_id = $2', [
            `/api/download/${r.token}`,
            r.download_id
        ]);
    }
    console.log(`Updated ${supaRows.rows.length} download links in Supabase.`);

    await pool.end();
}

fix().catch(console.error);
