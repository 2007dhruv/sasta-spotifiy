import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('toggle-favorite/:songId')
  async toggleFavorite(@Param('songId') songId: string, @Req() req: any) {
    return this.usersService.toggleFavorite(req.user._id, songId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getFavorites(@Req() req: any) {
    return this.usersService.getLikedSongs(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('history/:songId')
  async addToHistory(@Param('songId') songId: string, @Req() req: any) {
    return this.usersService.addToHistory(req.user._id, songId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.usersService.getHistory(req.user._id);
  }
}

