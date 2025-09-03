import express from 'express';


// GET /api/recordings — list metadata
router.get('/', async (_req, res) => {
try {
const db = await getDb();
const rows = await db.all(
`SELECT id, public_id, secure_url, filename, filesize, format, duration, createdAt
FROM recordings ORDER BY createdAt DESC`
);
res.json(rows);
} catch (err) {
console.error('List error:', err);
res.status(500).json({ error: 'Failed to fetch recordings' });
}
});


// GET /api/recordings/:id — redirect to Cloudinary URL (CDN handles streaming)
router.get('/:id', async (req, res) => {
try {
const db = await getDb();
const row = await db.get(`SELECT secure_url FROM recordings WHERE id = ?`, [req.params.id]);
if (!row) return res.status(404).json({ error: 'Not found' });
return res.redirect(302, row.secure_url);
} catch (err) {
console.error('Redirect error:', err);
res.status(500).json({ error: 'Failed to get recording' });
}
});


// (Optional) DELETE /api/recordings/:id — delete from Cloudinary + DB
router.delete('/:id', async (req, res) => {
try {
const db = await getDb();
const row = await db.get(`SELECT public_id FROM recordings WHERE id = ?`, [req.params.id]);
if (!row) return res.status(404).json({ error: 'Not found' });


// Remove from Cloudinary
await cloudinary.uploader.destroy(row.public_id, { resource_type: 'video' });
// Remove from DB
await db.run(`DELETE FROM recordings WHERE id = ?`, [req.params.id]);


res.json({ message: 'Deleted' });
} catch (err) {
console.error('Delete error:', err);
res.status(500).json({ error: 'Failed to delete recording' });
}
});


export default router;