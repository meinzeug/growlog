import { Router, Request, Response } from 'express';

export const feedbackRouter = Router();

feedbackRouter.post('/feedback', async (req: Request, res: Response) => {
    try {
        const { title, description, label } = req.body;

        const token = process.env.GITHUB_TOKEN;
        const owner = process.env.GITHUB_OWNER || 'meinzeug';
        const repo = process.env.GITHUB_REPO || 'growlog';

        if (!token) {
            return res.status(503).json({
                success: false,
                message: 'Feedback submission is currently disabled (No GitHub Token configured).'
            });
        }

        const body = {
            title: `[Feedback] ${title}`,
            body: `${description}\n\n*Submitted via GrowLog App*`,
            labels: label ? [label, 'user-feedback'] : ['user-feedback']
        };

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'GrowLog-App'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('GitHub API Error:', error);
            throw new Error(`GitHub API Error: ${error}`);
        }

        const data = await response.json();

        res.json({ success: true, issue_url: data.html_url });
    } catch (error: any) {
        console.error('Feedback Error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});
