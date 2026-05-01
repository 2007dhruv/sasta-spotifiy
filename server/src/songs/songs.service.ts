import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Song, SongDocument } from './schemas/song.schema';
import { Interaction, InteractionDocument } from './schemas/interaction.schema';

@Injectable()
export class SongsService {
  constructor(
    @InjectModel(Song.name) private songModel: Model<SongDocument>,
    @InjectModel(Interaction.name) private interactionModel: Model<InteractionDocument>,
  ) {}

  async create(createSongDto: any): Promise<SongDocument> {
    const newSong = new this.songModel(createSongDto);
    return newSong.save();
  }

  async findAll(): Promise<SongDocument[]> {
    return this.songModel.find().exec();
  }

  async findOne(id: string): Promise<SongDocument> {
    const song = await this.songModel.findById(id).exec();
    if (!song) {
      throw new NotFoundException('Song not found');
    }
    return song;
  }

  async findByGenre(genre: string): Promise<SongDocument[]> {
    return this.songModel.find({ genre }).exec();
  }

  /**
   * Real-time Interaction Tracking for AI Learning
   */
  async recordInteraction(userId: string, songId: string, data: { isLiked?: boolean, played?: boolean, completionRate?: number }) {
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

    // Dynamic Scoring for AI
    // Like = 15 points, Play = 2 points, 100% completion = 10 points
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
