import { Router, Request, Response } from 'express';

export const configRouter = Router();

configRouter.get('/config/features', (req: Request, res: Response) => {
    const hasGithubToken = !!process.env.GITHUB_TOKEN;

    res.json({
        features: {
            feedback: hasGithubToken
        }
    });
});
