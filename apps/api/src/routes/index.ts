import { Router } from 'express';
import { authRouter } from '../controllers/authController';
import { growRouter } from '../controllers/growController';
import { plantRouter } from '../controllers/plantController';
import { taskRouter } from '../controllers/taskController';
import { adminRouter } from '../controllers/adminController';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/', growRouter);
apiRouter.use('/', plantRouter);
apiRouter.use('/', taskRouter);
apiRouter.use('/admin', adminRouter);
