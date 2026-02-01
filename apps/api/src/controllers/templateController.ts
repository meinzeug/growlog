import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// Get all plant templates
router.get('/templates/plants', authenticateToken, async (req: Request, res: Response) => {
    try {
        const templates = await prisma.plantTemplate.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(templates);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

export const templateRouter = router;
