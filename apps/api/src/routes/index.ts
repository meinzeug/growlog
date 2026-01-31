import { Router } from 'express';
import { authRouter } from '../controllers/authController';
import { growRouter } from '../controllers/growController';
import { plantRouter } from '../controllers/plantController';
import { taskRouter } from '../controllers/taskController';
import { adminRouter } from '../controllers/adminController';
import { overviewRouter } from '../controllers/overviewController';
import { feedbackRouter } from '../controllers/feedbackController';
import { configRouter } from '../controllers/configController';

import { userRouter } from '../controllers/userController';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/', overviewRouter);
apiRouter.use('/', growRouter);
apiRouter.use('/', plantRouter);
apiRouter.use('/', taskRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/', feedbackRouter);
apiRouter.use('/', configRouter);
apiRouter.use('/', userRouter);
