import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../../.env') });
import 'dotenv/config'; // Keep default behavior as fallback/override
import { json } from 'body-parser';
import { apiRouter } from './routes';

const app: Express = express();
const PORT = process.env.PORT || 15100;

// Middleware
// Middleware
const defaultOrigins = [
    'http://localhost:15000',
    'http://localhost:15002',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:15002',
    'http://growlog.mooo.com:15002',
    'http://growlog.mooo.com'
];

const allowedOrigins = process.env.CORS_ORIGIN
    ? [...process.env.CORS_ORIGIN.split(',').map(o => o.trim()), ...defaultOrigins]
    : defaultOrigins;

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
    console.log(`⚡️ [API]: Server is running at http://localhost:${PORT}`);
});
