import express from 'express';
import { deleteRecordingsById, getAllRecordings, getRecordingsById, uploadRecordings } from '../controllers/recordingsController.js';

const router=express.Router()

router.post('/', uploadRecordings);

router.get('/', getAllRecordings);
router.get('/:id',getRecordingsById);


router.delete('/:id', deleteRecordingsById);


export default router;