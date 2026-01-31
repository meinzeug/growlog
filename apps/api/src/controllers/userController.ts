import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// GET /profile/preferences
router.get('/profile/preferences', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true }
    });
    res.json(user?.preferences || {});
});

// PATCH /profile/preferences
router.patch('/profile/preferences', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const { preferences } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { preferences }
        });
        res.json(user.preferences);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

export const userRouter = router;
