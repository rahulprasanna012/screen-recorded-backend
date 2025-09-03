import multer from 'multer';
import { getDb } from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';

const upload = multer({
storage: multer.memoryStorage(),
limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
fileFilter: (_req, file, cb) => {
const ok = ['video/webm', 'video/mp4', 'video/quicktime'].includes(file.mimetype);
cb(ok ? null : new Error('Unsupported file type'), ok);
}
});


export const uploadRecordings=async (req, res) => {
try {
if (!req.file) return res.status(400).json({ error: 'No file uploaded' });


const db = await getDb();
const { originalname, mimetype, size, buffer } = req.file;


// Wrap upload_stream in a Promise
const uploadResult = await new Promise((resolve, reject) => {
const stream = cloudinary.uploader.upload_stream(
{ resource_type: 'video', folder: 'screen-recordings' },
(error, result) => (error ? reject(error) : resolve(result))
);
stream.end(buffer);
});


const { public_id, secure_url, bytes, format, duration } = uploadResult;


const result = await db.run(
`INSERT INTO recordings (public_id, secure_url, filename, filesize, format, duration)
VALUES (?, ?, ?, ?, ?, ?)`,
[public_id, secure_url, originalname || public_id, bytes ?? size, format ?? mimetype, duration ?? null]
);


const row = await db.get(
`SELECT id, public_id, secure_url, filename, filesize, format, duration, createdAt
FROM recordings WHERE id = ?`,
[result.lastID]
);


res.status(201).json({ message: 'Uploaded', recording: row });
} catch (err) {
console.error('Upload error:', err);
res.status(500).json({ error: 'Upload failed' });
}
};

export const getAllRecordings=async (_req, res) => {
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
}

export const getRecordingsById=async (req, res) => {
try {
const db = await getDb();
const row = await db.get(`SELECT secure_url FROM recordings WHERE id = ?`, [req.params.id]);
if (!row) return res.status(404).json({ error: 'Not found' });
return res.redirect(302, row.secure_url);
} catch (err) {
console.error('Redirect error:', err);
res.status(500).json({ error: 'Failed to get recording' });
}
}

export const deleteRecordingsById=async (req, res) => {
try {
const db = await getDb();
const row = await db.get(`SELECT public_id FROM recordings WHERE id = ?`, [req.params.id]);
if (!row) return res.status(404).json({ error: 'Not found' });



await cloudinary.uploader.destroy(row.public_id, { resource_type: 'video' });


await db.run(`DELETE FROM recordings WHERE id = ?`, [req.params.id]);


res.json({ message: 'Deleted' });
} catch (err) {
console.error('Delete error:', err);
res.status(500).json({ error: 'Failed to delete recording' });
}
}