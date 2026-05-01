import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as tf from '@tensorflow/tfjs';
import { Interaction, InteractionDocument } from './schemas/interaction.schema';
import { Song, SongDocument } from './schemas/song.schema';

@Injectable()
export class RecommendationAIService implements OnModuleInit {
  private model: tf.LayersModel;
  private userIndexMap: Map<string, number> = new Map();
  private songIndexMap: Map<string, number> = new Map();
  private songIdMap: Map<number, string> = new Map();

  constructor(
    @InjectModel(Interaction.name) private interactionModel: Model<InteractionDocument>,
    @InjectModel(Song.name) private songModel: Model<SongDocument>,
  ) {}

  async onModuleInit() {
    console.log('AI Recommendation Service Initialized. Ready for training.');
  }

  /**
   * Phase 2: Build & Train the Neural Network
   */
  async buildAndTrainModel() {
    console.log('Training AI Model...');

    // 1. Prepare Data
    const interactions = await this.interactionModel.find().exec();
    const songs = await this.songModel.find().exec();

    if (interactions.length === 0) {
        console.log('No interactions found. Skip training.');
        return;
    }

    // Map IDs to Indices
    this.createIndexMaps(interactions);

    const userIndices = interactions.map(i => this.userIndexMap.get(i.userId.toString())!);
    const songIndices = interactions.map(i => this.songIndexMap.get(i.songId.toString())!);
    const scores = interactions.map(i => i.score / 20); // Normalize score (max is around 20-30 in seed)

    const userTensor = tf.tensor1d(userIndices, 'int32');
    const songTensor = tf.tensor1d(songIndices, 'int32');
    const scoreTensor = tf.tensor1d(scores, 'float32');

    // 2. Build NCF Model
    const numUsers = this.userIndexMap.size;
    const numSongs = this.songIndexMap.size;
    const embeddingSize = 8;

    // User Input
    const userInput = tf.input({ shape: [1], name: 'user' });
    const userEmbedding = tf.layers.embedding({
      inputDim: numUsers + 1,
      outputDim: embeddingSize,
      name: 'user_embedding'
    }).apply(userInput) as tf.SymbolicTensor;
    const userFlatten = tf.layers.flatten().apply(userEmbedding) as tf.SymbolicTensor;

    // Song Input
    const songInput = tf.input({ shape: [1], name: 'song' });
    const songEmbedding = tf.layers.embedding({
      inputDim: numSongs + 1,
      outputDim: embeddingSize,
      name: 'song_embedding'
    }).apply(songInput) as tf.SymbolicTensor;
    const songFlatten = tf.layers.flatten().apply(songEmbedding) as tf.SymbolicTensor;

    // Concatenate & Deep Layers
    const concat = tf.layers.concatenate().apply([userFlatten, songFlatten]) as tf.SymbolicTensor;
    
    let dense = tf.layers.dense({ units: 16, activation: 'relu' }).apply(concat) as tf.SymbolicTensor;
    dense = tf.layers.dense({ units: 8, activation: 'relu' }).apply(dense) as tf.SymbolicTensor;
    const output = tf.layers.dense({ units: 1, activation: 'sigmoid' }).apply(dense) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: [userInput as tf.SymbolicTensor, songInput as tf.SymbolicTensor], outputs: output });

    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    // 3. Train
    await this.model.fit([userTensor, songTensor], scoreTensor, {
      epochs: 50,
      batchSize: 32,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0 && logs) console.log(`Epoch ${epoch}: Loss = ${logs.loss.toFixed(4)}`);
        }
      }
    });

    console.log('AI Model Training Complete!');
    
    // Clean up tensors
    tf.dispose([userTensor, songTensor, scoreTensor]);
  }

  private createIndexMaps(interactions: any[]) {
    let uIdx = 0;
    let sIdx = 0;
    this.userIndexMap.clear();
    this.songIndexMap.clear();

    interactions.forEach(i => {
      const uId = i.userId.toString();
      const sId = i.songId.toString();

      if (!this.userIndexMap.has(uId)) this.userIndexMap.set(uId, uIdx++);
      if (!this.songIndexMap.has(sId)) {
        this.songIndexMap.set(sId, sIdx);
        this.songIdMap.set(sIdx++, sId);
      }
    });
  }

  /**
   * Phase 3: Inference
   */
  async getAIRecommendations(userId: string, limit: number = 10): Promise<SongDocument[]> {
    if (!this.model) {
      await this.buildAndTrainModel();
    }

    const uIdx = this.userIndexMap.get(userId);
    if (uIdx === undefined) return []; // New user, fallback to trending

    const allSongsIndices = Array.from(this.songIndexMap.values());
    const userInp = tf.tensor1d(new Array(allSongsIndices.length).fill(uIdx), 'int32');
    const songInp = tf.tensor1d(allSongsIndices, 'int32');

    const predictions = this.model.predict([userInp, songInp]) as tf.Tensor;
    const predData = await predictions.data();

    // Sort by score
    const scoredSongs = allSongsIndices.map((sIdx, i) => ({
      sIdx,
      score: predData[i]
    })).sort((a, b) => b.score - a.score);

    // Map back to IDs
    const topSongIds = scoredSongs.slice(0, limit).map(s => this.songIdMap.get(s.sIdx)).filter((id): id is string => id !== undefined);

    tf.dispose([userInp, songInp, predictions]);

    return this.songModel.find({ _id: { $in: topSongIds } }).exec();
  }
}
