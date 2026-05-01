import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SongsService } from './songs.service';
import { RecommendationAIService } from './recommendation-ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('songs')
export class SongsController {
  constructor(
    private readonly songsService: SongsService,
    private readonly aiService: RecommendationAIService,
  ) {}

  @Post('train')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async trainAI() {
    await this.aiService.buildAndTrainModel();
    return { message: 'AI Training triggered successfully' };
  }

  @Get('recommendations/ai')
  @UseGuards(JwtAuthGuard)
  async getAIRecommendations(@Req() req: any) {
    return this.aiService.getAIRecommendations(req.user._id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('artist', 'admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const dest = file.fieldname === 'audio' ? './uploads/songs' : './uploads/covers';
            cb(null, dest);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async upload(
    @UploadedFiles() files: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Body() body: any,
    @Req() req: any,
  ) {
    if (req.user.role === 'artist' && req.user.status !== 'verified') {
      throw new ForbiddenException('Artist account not verified by admin');
    }

    const audioUrl = files.audio?.[0]?.path;
    const coverImageUrl = files.cover?.[0]?.path;

    return this.songsService.create({
      ...body,
      audioUrl: audioUrl?.replace(/\\/g, '/'),
      coverImageUrl: coverImageUrl?.replace(/\\/g, '/'),
      uploadedBy: req.user._id,
    });
  }

  @Get()
  async findAll(@Query('genre') genre?: string) {
    if (genre) {
      return this.songsService.findByGenre(genre);
    }
    return this.songsService.findAll();
  }
}
