import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { Song, SongSchema } from './schemas/song.schema';
import { Interaction, InteractionSchema } from './schemas/interaction.schema';
import { RecommendationAIService } from './recommendation-ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Song.name, schema: SongSchema },
      { name: Interaction.name, schema: InteractionSchema },
    ]),
  ],
  controllers: [SongsController],
  providers: [SongsService, RecommendationAIService],
  exports: [SongsService, RecommendationAIService],
})
export class SongsModule {}
