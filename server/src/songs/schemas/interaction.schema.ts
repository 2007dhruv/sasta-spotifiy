import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InteractionDocument = Interaction & Document;

@Schema({ timestamps: true })
export class Interaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Song', required: true })
  songId: Types.ObjectId;

  @Prop({ default: 0 })
  playCount: number;

  @Prop({ default: false })
  isLiked: boolean;

  @Prop({ default: 0 })
  completionRate: number; // 0 to 1

  @Prop({ default: 0 })
  skipCount: number;

  @Prop({ default: 0 })
  score: number; // Calculated preference score
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);

// Index for fast lookups
InteractionSchema.index({ userId: 1, songId: 1 }, { unique: true });
