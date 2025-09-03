import express from 'express';
import { deleteRecordingsById, getAllRecordings, getRecordingsById, uploadRecordings } from '../controllers/recordingsController.js';
import multer from 'multer';

const router=express.Router()

const upload = multer({
storage: multer.memoryStorage(),
limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
fileFilter: (req, file, cb) => {
const ok = ['video/webm', 'video/mp4', 'video/quicktime'].includes(file.mimetype);
cb(ok ? null : new Error('Unsupported file type'), ok);
}
});


router.post('/',upload.single('video'), uploadRecordings);

router.get('/', getAllRecordings);
router.get('/:id',getRecordingsById);


router.delete('/:id', deleteRecordingsById);


export default router;