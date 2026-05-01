import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  async create(@Body() body: { name: string; description?: string }, @Req() req: any) {
    return this.playlistsService.create({
      ...body,
      ownerId: req.user._id,
    });
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.playlistsService.findAllByUser(req.user._id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.playlistsService.findOne(id, req.user._id);
  }

  @Post(':id/songs/:songId')
  async addSong(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @Req() req: any,
  ) {
    return this.playlistsService.addSong(id, songId, req.user._id);
  }

  @Delete(':id/songs/:songId')
  async removeSong(
    @Param('id') id: string,
    @Param('songId') songId: string,
    @Req() req: any,
  ) {
    return this.playlistsService.removeSong(id, songId, req.user._id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.playlistsService.delete(id, req.user._id);
  }
}

