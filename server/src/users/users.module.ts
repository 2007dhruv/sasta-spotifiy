import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AdminController } from './admin.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Interaction, InteractionSchema } from '../songs/schemas/interaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Interaction.name, schema: InteractionSchema },
    ]),
  ],
  controllers: [UsersController, AdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
