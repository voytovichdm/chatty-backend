import { Application } from 'express';
import { authRoutes } from './features/auth/routes/authRoutes';
import { serverAdapter } from './shared/globals/services/queues/base.queue';
import { currentUserRoutes } from './features/auth/routes/currentRoutes';
import { authMiddleware } from './shared/globals/helpers/auth-middleware';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, currentUserRoutes.routes());
  };
  routes();
};
