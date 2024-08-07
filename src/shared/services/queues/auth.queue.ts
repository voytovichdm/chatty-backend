import { authWorker } from '../../../shared/workers/auth.worker';
import { BaseQueue } from './base.queue';
import { IAuthJob } from '../../../features/auth/interfaces/auth.interface';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
