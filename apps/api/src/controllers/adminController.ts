import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@growlog/shared';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

router.get('/users', authenticateToken, requireRole(UserRole.ADMIN), async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
            last_login_at: true
        }
    });
    res.json(users);
});

router.patch('/users/:id', authenticateToken, requireRole(UserRole.ADMIN), async (req: Request, res: Response) => {
    const { role } = req.body;

    if (!role || !['ADMIN', 'USER'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role }
        });
        res.json({ id: user.id, role: user.role });
    } catch (e) {
        res.status(404).json({ error: 'User not found' });
    }
});

export const adminRouter = router;
