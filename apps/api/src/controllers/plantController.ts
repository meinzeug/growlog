import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Schemas
const createPlantSchema = z.object({
    grow_id: z.string(),
    environment_id: z.string().optional(),
    name: z.string().min(1),
    strain: z.string().optional(),
    plant_type: z.enum(['PHOTOPERIOD', 'AUTOFLOWER', 'UNKNOWN']).optional(),
    sex: z.enum(['FEMINIZED', 'REGULAR', 'UNKNOWN']).optional(),
    start_date: z.string().optional(), // Date string
    status: z.enum(['HEALTHY', 'ISSUES', 'SICK', 'HARVESTED', 'DEAD']).optional(),
    notes: z.string().optional()
});

// --- Plants ---

router.get('/plants', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const { growId } = req.query;

    const where: any = { owner_user_id: userId as string };
    if (growId) where.grow_id = growId as string;

    const plants = await prisma.plant.findMany({
        where,
        include: { grow: true, environment: true }
    });
    res.json(plants);
});

router.post('/plants', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    try {
        const data = createPlantSchema.parse(req.body);

        // Check grow ownership
        const grow = await prisma.grow.findFirst({ where: { id: data.grow_id, owner_user_id: userId as string } });
        if (!grow) return res.status(403).json({ error: 'Cannot add plant to this grow' });

        const plant = await prisma.plant.create({
            data: {
                ...data,
                owner_user_id: userId as string,
                start_date: data.start_date ? new Date(data.start_date) : undefined
            }
        });
        res.status(201).json(plant);
    } catch (error: any) {
        res.status(400).json({ error: 'Invalid input', details: error.errors || error.message });
    }
});

router.get('/plants/:id', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const plant = await prisma.plant.findFirst({
        where: { id: req.params.id, owner_user_id: userId as string },
        include: { grow: true, environment: true }
    });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    res.json(plant);
});

router.patch('/plants/:id', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    // Check ownership
    const exists = await prisma.plant.count({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!exists) return res.status(404).json({ error: 'Plant not found' });

    try {
        const { phase_started_at, start_date, ...rest } = req.body;
        const data: any = { ...rest };
        if (start_date) data.start_date = new Date(start_date);
        if (phase_started_at) data.phase_started_at = new Date(phase_started_at);

        const plant = await prisma.plant.update({
            where: { id: req.params.id },
            data
        });
        res.json(plant);
    } catch (e) {
        res.status(400).json({ error: 'Update failed' });
    }
});

router.post('/plants/:id/phase', authenticateToken, async (req: Request, res: Response) => {
    // Shortcut to update phase
    const userId = (req as AuthRequest).user?.id!;
    const { phase, phase_started_at } = req.body;

    if (!phase) return res.status(400).json({ error: 'Phase is required' });

    const plant = await prisma.plant.findFirst({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const updated = await prisma.plant.update({
        where: { id: req.params.id },
        data: {
            phase,
            phase_started_at: phase_started_at ? new Date(phase_started_at) : new Date()
        }
    });
    res.json(updated);
});


// --- Logs ---

router.get('/plants/:id/logs', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    // Verify plant ownership
    const plant = await prisma.plant.count({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const logs = await prisma.plantLog.findMany({
        where: { plant_id: req.params.id },
        orderBy: { logged_at: 'desc' }
    });
    res.json(logs);
});

router.post('/plants/:id/logs', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const plant = await prisma.plant.count({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    try {
        const { type, title, content, tags, logged_at, metrics_json } = req.body;
        const log = await prisma.plantLog.create({
            data: {
                plant_id: req.params.id,
                created_by: userId as string,
                type: type || 'NOTE',
                title,
                content,
                tags,
                logged_at: logged_at ? new Date(logged_at) : new Date(),
                metrics_json
            }
        });

        // If there are metrics, let's also save to PlantMetric if we want Option B redundancy, or just rely on this.
        // The prompt asked for Option B (extra table) for metrics.
        // So if the user sends metrics here, we might want to also create a Metric entry?
        // Let's keep them separate endpoints for clarity, or if metrics_json is sent, use it for display only in the log list.
        // We will have a separate /metrics endpoint for the chart data.

        res.status(201).json(log);
    } catch (e) {
        res.status(400).json({ error: 'Failed to create log' });
    }
});


// --- Photos ---

router.get('/plants/:id/photos', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const plant = await prisma.plant.count({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const photos = await prisma.plantPhoto.findMany({
        where: { plant_id: req.params.id },
        orderBy: { created_at: 'desc' }
    });

    // Map file_path to url
    const mapped = photos.map(p => ({
        ...p,
        url: `${process.env.VITE_API_URL || 'http://localhost:15100'}/uploads/${path.basename(p.file_path)}`
        // naive implementation, serving via static
    }));

    res.json(mapped);
});

router.post('/plants/:id/photos', authenticateToken, upload.single('photo'), async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const plant = await prisma.plant.count({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!plant) {
        // delete uploaded file if plant not found
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Plant not found' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const photo = await prisma.plantPhoto.create({
        data: {
            plant_id: req.params.id,
            uploaded_by: userId as string,
            file_path: req.file.path,
            caption: req.body.caption,
            taken_at: req.body.taken_at ? new Date(req.body.taken_at) : new Date()
        }
    });

    res.status(201).json({
        ...photo,
        url: `${process.env.VITE_API_URL || 'http://localhost:15100'}/uploads/${path.basename(photo.file_path)}`
    });
});

// --- Metrics ---

router.get('/plants/:id/metrics', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const plant = await prisma.plant.count({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const metrics = await prisma.plantMetric.findMany({
        where: { plant_id: req.params.id },
        orderBy: { recorded_at: 'asc' }
    });
    res.json(metrics);
});

router.post('/plants/:id/metrics', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const plant = await prisma.plant.count({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    try {
        const { height_cm, ph, ec, temperature_c, humidity_pct, notes, recorded_at } = req.body;
        const metric = await prisma.plantMetric.create({
            data: {
                plant_id: req.params.id,
                height_cm: height_cm ? parseFloat(height_cm) : undefined,
                ph: ph ? parseFloat(ph) : undefined,
                ec: ec ? parseFloat(ec) : undefined,
                temperature_c: temperature_c ? parseFloat(temperature_c) : undefined,
                humidity_pct: humidity_pct ? parseFloat(humidity_pct) : undefined,
                notes,
                recorded_at: recorded_at ? new Date(recorded_at) : new Date()
            }
        });
        res.status(201).json(metric);
    } catch (e) {
        res.status(400).json({ error: 'Invalid metric data' });
    }
});

export const plantRouter = router;
