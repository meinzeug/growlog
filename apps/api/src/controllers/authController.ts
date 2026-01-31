import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_jwt_key_change_me';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                // Default role is USER, set by DB default
            }
        });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        // Don't return password hash
        const { password_hash, ...userWithoutPassword } = user;

        res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(400).json({ error: 'Invalid input or registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        const { password_hash, ...userWithoutPassword } = user;

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date() }
        });

        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(400).json({ error: 'Login failed' });
    }
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
});

export const authRouter = router;
