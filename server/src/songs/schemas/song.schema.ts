import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SongDocument = Song & Document;

@Schema({ timestamps: true })
export class Song {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  artist: string;

  @Prop()
  album: string;

  @Prop({ required: true })
  genre: string;

  @Prop()
  duration: number; // in seconds

  @Prop({ required: true })
  audioUrl: string; // path to local file for now

  @Prop()
  coverImageUrl: string;

  @Prop({ type: String, ref: 'User' })
  uploadedBy: string;
}

export const SongSchema = SchemaFactory.createForClass(Song);
