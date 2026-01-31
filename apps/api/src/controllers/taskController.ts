import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const router = Router();

// Schemas
const createTaskSchema = z.object({
    grow_id: z.string().optional(),
    plant_id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    due_at: z.string(), // ISO date
    repeat_rule: z.string().optional(),
    notify: z.boolean().optional(),
    notify_before_minutes: z.number().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()
});

router.get('/tasks', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const { growId, plantId, from, to } = req.query;

    const where: any = { owner_user_id: userId as string };
    if (growId) where.grow_id = growId as string;
    if (plantId) where.plant_id = plantId as string;
    if (from || to) {
        where.due_at = {};
        if (from) where.due_at.gte = new Date(from as string);
        if (to) where.due_at.lte = new Date(to as string);
    }

    const tasks = await prisma.task.findMany({
        where,
        orderBy: { due_at: 'asc' },
        include: { grow: true, plant: true }
    });
    res.json(tasks);
});

router.post('/tasks', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    try {
        const data = createTaskSchema.parse(req.body);
        const task = await prisma.task.create({
            data: {
                ...data,
                owner_user_id: userId as string,
                due_at: new Date(data.due_at)
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: 'Invalid input' });
    }
});

router.patch('/tasks/:id', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const task = await prisma.task.findFirst({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: req.body
    });
    res.json(updated);
});

router.post('/tasks/:id/complete', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const task = await prisma.task.findFirst({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: { status: 'DONE' }
    });

    // Handle Recurrence
    if (task.repeat_rule) {
        let nextDate = new Date(task.due_at);
        const rule = task.repeat_rule.toUpperCase();

        // Logic: Add interval to the ORIGINAL due date to keep cadence.
        if (rule === 'DAILY') nextDate.setDate(nextDate.getDate() + 1);
        else if (rule === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
        else if (rule === 'EVERY_3_DAYS') nextDate.setDate(nextDate.getDate() + 3);
        else if (rule === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);

        // If the calculated next date is in the past (e.g. missed task), 
        // should we skip to the future? For now, let's keep strict cadence 
        // but ensure we don't create duplicates if user spans click spam.
        // Actually, simple valid check:
        // Use max(now, nextDate)? No, strict cadence is better for growing schedules.

        await prisma.task.create({
            data: {
                owner_user_id: userId as string,
                grow_id: task.grow_id,
                plant_id: task.plant_id,
                title: task.title,
                description: task.description,
                due_at: nextDate,
                repeat_rule: task.repeat_rule,
                notify: task.notify,
                notify_before_minutes: task.notify_before_minutes,
                priority: task.priority,
                status: 'OPEN'
            }
        });
    }

    res.json(updated);
});

router.delete('/tasks/:id', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const task = await prisma.task.findFirst({ where: { id: req.params.id, owner_user_id: userId as string } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
});

export const taskRouter = router;
