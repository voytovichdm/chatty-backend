import { Application } from 'express';
import { serverAdapter } from './shared/services/queues/base.queue';
import { healthRoutes } from './features/user/routes/healthRoutes';
import { authRoutes } from './features/auth/routes/authRoutes';
import { authMiddleware } from './shared/globals/helpers/auth-middleware';
import { currentUserRoutes } from './features/auth/routes/currentRoutes';
import { postRoutes } from './features/post/routes/postRoutes';
import { reactionRoutes } from './features/reactions/routes/reactionRoutes';
import { commentRoutes } from './features/comments/routes/commentRoutes';
import { followerRoutes } from './features/followers/routes/followerRoutes';
import { notificationRoutes } from './features/notifications/routes/notificationRoutes';
import { imageRoutes } from './features/images/routes/imageRoutes';
import { chatRoutes } from './features/chat/routes/chatRoutes';
import { userRoutes } from './features/user/routes/userRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use('', healthRoutes.health());
    app.use('', healthRoutes.env());
    app.use('', healthRoutes.instance());
    app.use('', healthRoutes.fiboRoutes());
 
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
  };
  routes();
};
