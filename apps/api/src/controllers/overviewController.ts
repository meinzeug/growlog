import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();
const router = Router();

router.get('/overview', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id!;
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    try {
        // 1. Counts
        const totalPlants = await prisma.plant.count({
            where: { owner_user_id: userId as string }
        });

        const activePlants = await prisma.plant.count({
            where: {
                owner_user_id: userId as string,
                status: { notIn: ['HARVESTED', 'DEAD'] }
            }
        });

        const healthyPlants = await prisma.plant.count({
            where: {
                owner_user_id: userId as string,
                status: 'HEALTHY'
            }
        });

        const wastePlants = await prisma.plant.count({
            where: {
                owner_user_id: userId as string,
                status: { in: ['DEAD', 'SICK'] }
            }
        });

        const tasksTodayCount = await prisma.task.count({
            where: {
                owner_user_id: userId as string,
                due_at: {
                    gte: todayStart,
                    lte: todayEnd
                },
                status: 'OPEN'
            }
        });

        // 2. Environment Data (Get latest metric from any active plant)
        const latestMetric = await prisma.plantMetric.findFirst({
            where: {
                plant: { owner_user_id: userId as string, status: { notIn: ['HARVESTED', 'DEAD'] } }
            },
            orderBy: { recorded_at: 'desc' },
            select: { temperature_c: true, humidity_pct: true, recorded_at: true }
        });

        // Fallback or targets if needed, but for now just use latest metric or null
        const environment = {
            temperature: latestMetric?.temperature_c || 24, // Default ideal if no data
            humidity: latestMetric?.humidity_pct || 60,
            lastUpdated: latestMetric?.recorded_at || new Date()
        };

        // 3. Growth Data (Last 5 weeks average height)
        // This is a bit complex in Prisma without raw SQL for dates, let's do a simple approximation
        // Get metrics from last 5 weeks
        const fiveWeeksAgo = new Date();
        fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);

        const recentMetrics = await prisma.plantMetric.findMany({
            where: {
                plant: { owner_user_id: userId as string },
                recorded_at: { gte: fiveWeeksAgo },
                height_cm: { not: null }
            },
            select: { height_cm: true, recorded_at: true }
        });

        // Group by week
        const weeksMap = new Map<string, { total: number; count: number }>();

        // Initialize 5 weeks
        for (let i = 4; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - (i * 7));
            const label = `WEEK ${5 - i}`; // Simplistic labeling
            // Actually, the UI shows 1 WEEK, 2 WEEK... let's just map relative to start
        }

        const chartData = [
            { label: '1 WEEK', height: 0 },
            { label: '2 WEEK', height: 0 },
            { label: '3 WEEK', height: 0 },
            { label: '4 WEEK', height: 0 },
            { label: '5 WEEK', height: 0 }
        ];

        // Fill with dummy logic or real logic?
        // Real logic: Group metrics by week number relative to now
        // For simplicity in this iteration:
        // Use average height of all active plants *now* as a baseline and distribute?
        // No, let's just return the raw metrics for the frontend to process or mock it if empty
        // If we have no metrics, send the mock data structure but zeroed? 
        // Let's implement a simple bucket sort

        if (recentMetrics.length > 0) {
            // Reset to 0
            chartData.forEach(d => d.height = 0);

            const now = new Date().getTime();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;

            recentMetrics.forEach(m => {
                const diff = now - m.recorded_at.getTime();
                const weekIndex = 4 - Math.floor(diff / oneWeek); // 0 to 4
                if (weekIndex >= 0 && weekIndex <= 4) {
                    // We need to average. But here we are iterating.
                    // Let's use an accumulator array
                }
            });

            // Re-do correctly
            const buckets = Array(5).fill(0).map(() => ({ sum: 0, count: 0 }));
            recentMetrics.forEach(m => {
                const diff = now - m.recorded_at.getTime();
                const weekIndex = 4 - Math.floor(diff / oneWeek);
                if (weekIndex >= 0 && weekIndex <= 4) {
                    buckets[weekIndex].sum += m.height_cm || 0;
                    buckets[weekIndex].count++;
                }
            });

            buckets.forEach((b, i) => {
                if (b.count > 0) chartData[i].height = Math.round(b.sum / b.count);
            });
        } else {
            // Mock data for "New User" experience so chart isn't empty?
            // User requested "Alle Mock Elemente... zu echten Funktionen machen"
            // So if no data, return 0 or empty.
            // But visually 0 is flat. Let's return 0s.
            chartData.forEach(d => d.height = 0);
        }

        // 4. Activity (Keep existing logic)
        // Check logs
        const logs = await prisma.plantLog.findMany({
            where: { created_by: userId as string },
            take: 5,
            orderBy: { logged_at: 'desc' },
            include: { plant: { select: { name: true } } }
        });

        // Check photos
        const photos = await prisma.plantPhoto.findMany({
            where: { uploaded_by: userId as string },
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { plant: { select: { name: true } } }
        });

        const activity = [
            ...logs.map(l => ({
                type: 'LOG',
                id: l.id,
                date: l.logged_at,
                title: l.title || l.type,
                subtitle: l.plant.name
            })),
            ...photos.map(p => ({
                type: 'PHOTO',
                id: p.id,
                date: p.created_at,
                title: 'New Photo',
                subtitle: p.plant.name
            }))
        ]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        // 5. Overdue
        const overdueTasks = await prisma.task.findMany({
            where: {
                owner_user_id: userId as string,
                status: 'OPEN',
                due_at: { lt: new Date() }
            },
            take: 5,
            orderBy: { due_at: 'asc' },
            include: { plant: true }
        });

        res.json({
            stats: {
                total: totalPlants,
                active: activePlants,
                healthy: healthyPlants,
                waste: wastePlants
            },
            environment,
            chartData,
            tasksTodayCount,
            recentActivity: activity,
            overdueTasks
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
});

export const overviewRouter = router;
