import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import { json } from 'body-parser';
import { apiRouter } from './routes';

const app: Express = express();
const PORT = process.env.PORT || 15100;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:15000',
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
