import mongoose, { Document } from 'mongoose';
import { PushOperator, PullOperator } from 'mongodb';
import { UserModel } from '../../../features/user/models/user.schema';

class BlockUserService {
  public async blockUser(userId: string, followerId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const followerObjectId = new mongoose.Types.ObjectId(followerId);

    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userObjectId, blocked: { $ne: followerObjectId } },
          update: {
            $push: {
              blocked: followerObjectId
            } as PushOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: { _id: followerObjectId, blockedBy: { $ne: userObjectId } },
          update: {
            $push: {
              blockedBy: userObjectId
            } as PushOperator<Document>
          }
        }
      }
    ]);
  }

  public async unblockUser(userId: string, followerId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const followerObjectId = new mongoose.Types.ObjectId(followerId);

    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userObjectId },
          update: {
            $pull: {
              blocked: followerObjectId
            } as PullOperator<Document>
          }
        }
      },
      {
        updateOne: {
          filter: { _id: followerObjectId },
          update: {
            $pull: {
              blockedBy: userObjectId
            } as PullOperator<Document>
          }
        }
      }
    ]);
  }
}

export const blockUserService: BlockUserService = new BlockUserService();
