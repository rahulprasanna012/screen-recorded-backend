import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import recordingsRouter from './routers/recordingsRoute.js';
import { configureCloudinary } from './config/cloudinary.js';
import { getDb } from './config/db.js';


const app = express();
const PORT = process.env.PORT || 5000;


// Init Cloudinary & DB (fail fast if misconfigured)
configureCloudinary();
await getDb();


// CORS
const allowed = [process.env.FRONTEND_ORIGIN, 'http://localhost:3000'].filter(Boolean);
app.use(cors({ origin: allowed }));


// Basic JSON parser for non-multipart requests
app.use(express.json());


// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));


// Recordings API
app.use('/api/recordings', recordingsRouter);


app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));