import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Playlist, PlaylistDocument } from './schemas/playlist.schema';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<PlaylistDocument>,
  ) {}

  async create(createDto: { name: string; description?: string; ownerId: string }): Promise<PlaylistDocument> {
    const newPlaylist = new this.playlistModel({
      ...createDto,
      ownerId: new Types.ObjectId(createDto.ownerId),
      songs: [],
    });
    return newPlaylist.save();
  }

  async findAllByUser(userId: string): Promise<PlaylistDocument[]> {
    return this.playlistModel.find({ ownerId: new Types.ObjectId(userId.toString()) }).exec();
  }

  async findOne(id: string, userId: string): Promise<PlaylistDocument> {
    const playlist = await this.playlistModel.findById(id).populate('songs').exec();
    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }
    if (playlist.ownerId.toString() !== userId.toString()) {
      throw new ForbiddenException('You do not have access to this playlist');
    }
    return playlist;
  }

  async addSong(id: string, songId: string, userId: string): Promise<PlaylistDocument> {
    const playlist = await this.playlistModel.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId.toString() !== userId.toString()) throw new ForbiddenException('Access denied');

    const songObjectId = new Types.ObjectId(songId);
    if (!playlist.songs.some(s => s.toString() === songId.toString())) {
      playlist.songs.push(songObjectId);
      await playlist.save();
    }
    return await playlist.populate('songs');
  }

  async removeSong(id: string, songId: string, userId: string): Promise<PlaylistDocument> {
    const playlist = await this.playlistModel.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId.toString() !== userId.toString()) throw new ForbiddenException('Access denied');

    playlist.songs = playlist.songs.filter(s => s.toString() !== songId.toString());
    await playlist.save();
    return await playlist.populate('songs');
  }

  async delete(id: string, userId: string): Promise<void> {
    const playlist = await this.playlistModel.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.ownerId.toString() !== userId.toString()) throw new ForbiddenException('Access denied');

    await this.playlistModel.deleteOne({ _id: id }).exec();
  }
}

