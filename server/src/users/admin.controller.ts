import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private usersService: UsersService) {}

  @Get('artists')
  async getAllArtists() {
    return this.usersService.findAllArtists();
  }

  @Patch('verify-artist/:id')
  async verifyArtist(@Param('id') id: string) {
    return this.usersService.updateUserStatus(id, { status: 'verified' });
  }

  @Patch('block-user/:id')
  async blockUser(@Param('id') id: string) {
    return this.usersService.updateUserStatus(id, { status: 'blocked' });
  }
}
