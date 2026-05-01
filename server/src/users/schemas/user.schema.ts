import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: 'client', enum: ['client', 'artist', 'admin'] })
  role: string;

  @Prop({ default: 'pending', enum: ['pending', 'verified', 'blocked'] })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Song' }] })
  likedSongs: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Playlist' }] })
  playlists: Types.ObjectId[];

  @Prop({
    type: [{
      song: { type: Types.ObjectId, ref: 'Song' },
      playedAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  listeningHistory: { song: Types.ObjectId; playedAt: Date }[];
}


export const UserSchema = SchemaFactory.createForClass(User);
