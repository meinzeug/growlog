import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// GET /notifications - List user notifications
router.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    try {
        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PUT /notifications/:id/read - Mark as read
router.put('/notifications/:id/read', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const { id } = req.params;
    try {
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification || notification.user_id !== userId) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// PUT /notifications/read-all - Mark all as read
router.put('/notifications/read-all', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    try {
        await prisma.notification.updateMany({
            where: { user_id: userId, read: false },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// POST /notifications - Create notification (internal use)
router.post('/notifications', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const { title, message, type } = req.body;

    if (!title || !message) {
        return res.status(400).json({ error: 'Title and message required' });
    }

    try {
        const notification = await prisma.notification.create({
            data: {
                user_id: userId,
                title,
                message,
                type: type || 'info'
            }
        });
        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

export const notificationRouter = router;
