import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Interaction, InteractionDocument } from '../songs/schemas/interaction.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Interaction.name) private interactionModel: Model<InteractionDocument>,
  ) {}

  async create(email: string, password: string, name: string, role?: string): Promise<UserDocument> {
    const newUser = new this.userModel({ email, password, name, role: role || 'client' });
    return newUser.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateUserStatus(id: string, update: { role?: string; status?: string }): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async findAllArtists(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'artist' }).exec();
  }

  async toggleFavorite(userId: string, songId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    const isLiked = user.likedSongs.some(id => id.toString() === songId);
    
    if (isLiked) {
      await this.recordInteraction(userId, songId, { isLiked: false });
      return this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { likedSongs: new Types.ObjectId(songId) } },
        { new: true }
      ).exec();
    } else {
      await this.recordInteraction(userId, songId, { isLiked: true });
      return this.userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { likedSongs: new Types.ObjectId(songId) } },
        { new: true }
      ).exec();
    }
  }

  async getLikedSongs(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId)
      .populate('likedSongs')
      .exec();
  }

  async addToHistory(userId: string, songId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    // Remove if already in history to move it to the front
    const filteredHistory = user.listeningHistory.filter(h => h.song.toString() !== songId);
    
    // Add new entry at the beginning
    const newEntry = { song: new Types.ObjectId(songId), playedAt: new Date() };
    const newHistory = [newEntry, ...filteredHistory].slice(0, 50); // Keep last 50

    await this.recordInteraction(userId, songId, { played: true, completionRate: 1 });

    return this.userModel.findByIdAndUpdate(
      userId,
      { listeningHistory: newHistory },
      { new: true }
    ).populate('listeningHistory.song').exec();
  }

  async getHistory(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId)
      .populate('listeningHistory.song')
      .exec();
  }

  private async recordInteraction(userId: string, songId: string, data: { isLiked?: boolean, played?: boolean, completionRate?: number }) {
    const update: any = { $set: { userId, songId } };
    
    const existing = await this.interactionModel.findOne({ userId, songId });
    
    if (data.played) {
      update.$inc = { playCount: 1 };
    }
    if (data.isLiked !== undefined) {
      update.$set.isLiked = data.isLiked;
    }
    if (data.completionRate !== undefined) {
      update.$set.completionRate = data.completionRate;
    }

    const playCount = (existing?.playCount || 0) + (data.played ? 1 : 0);
    const isLiked = data.isLiked !== undefined ? data.isLiked : (existing?.isLiked || false);
    const completionRate = data.completionRate !== undefined ? data.completionRate : (existing?.completionRate || 0);
    
    update.$set.score = (isLiked ? 15 : 0) + (playCount * 2) + (completionRate * 10);

    return this.interactionModel.findOneAndUpdate(
      { userId, songId },
      update,
      { upsert: true, new: true }
    ).exec();
  }
}

