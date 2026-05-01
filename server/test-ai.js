const mongoose = require('mongoose');
const tf = require('@tensorflow/tfjs');

const mongoUri = 'mongodb://localhost:27017/spotify-clone';

// Schemas (Minimal for testing)
const SongSchema = new mongoose.Schema({ title: String, genre: String });
const InteractionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  songId: mongoose.Schema.Types.ObjectId,
  score: Number
});
const UserSchema = new mongoose.Schema({ email: String, name: String });

const Song = mongoose.model('Song', SongSchema);
const Interaction = mongoose.model('Interaction', InteractionSchema);
const User = mongoose.model('User', UserSchema);

async function testAI() {
  try {
    await mongoose.connect(mongoUri);
    console.log('--- AI SANDBOX: PERFECTION PHASE ---');

    const interactions = await Interaction.find({});
    const songs = await Song.find({});
    const users = await User.find({ email: { $in: ['pop@demo.com', 'rock@demo.com', 'jazz@demo.com'] } });

    if (interactions.length === 0) {
      console.log('No interactions! Run seed-ai.js first.');
      process.exit(1);
    }

    // 1. Prepare Mappings
    const userIndexMap = new Map();
    const songIndexMap = new Map();
    const songIdMap = new Map();
    let uIdx = 0, sIdx = 0;

    interactions.forEach(i => {
      const uId = i.userId.toString();
      const sId = i.songId.toString();
      if (!userIndexMap.has(uId)) userIndexMap.set(uId, uIdx++);
      if (!songIndexMap.has(sId)) {
        songIndexMap.set(sId, sIdx);
        songIdMap.set(sIdx++, sId);
      }
    });

    const userIndices = interactions.map(i => userIndexMap.get(i.userId.toString()));
    const songIndices = interactions.map(i => songIndexMap.get(i.songId.toString()));
    const scores = interactions.map(i => i.score / 30); // Normalize

    // 2. Build Model
    const embeddingSize = 8;
    const userInput = tf.input({ shape: [1] });
    const userEmb = tf.layers.embedding({ inputDim: uIdx + 1, outputDim: embeddingSize }).apply(userInput);
    const songInput = tf.input({ shape: [1] });
    const songEmb = tf.layers.embedding({ inputDim: sIdx + 1, outputDim: embeddingSize }).apply(songInput);

    const concat = tf.layers.concatenate().apply([tf.layers.flatten().apply(userEmb), tf.layers.flatten().apply(songEmb)]);
    const dense1 = tf.layers.dense({ units: 16, activation: 'relu' }).apply(concat);
    const output = tf.layers.dense({ units: 1, activation: 'sigmoid' }).apply(dense1);

    const model = tf.model({ inputs: [userInput, songInput], outputs: output });
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    console.log('Training Neural Network...');
    await model.fit([tf.tensor1d(userIndices, 'int32'), tf.tensor1d(songIndices, 'int32')], tf.tensor1d(scores), {
      epochs: 100,
      verbose: 0
    });
    console.log('Training complete.\n');

    // 3. Evaluate for each Persona
    for (const user of users) {
      console.log(`Evaluating for User: ${user.name} (${user.email})`);
      const userIdx = userIndexMap.get(user._id.toString());
      if (userIdx === undefined) continue;

      const allSongIndices = Array.from(songIndexMap.values());
      const userInp = tf.tensor1d(new Array(allSongIndices.length).fill(userIdx), 'int32');
      const songInp = tf.tensor1d(allSongIndices, 'int32');

      const preds = model.predict([userInp, songInp]);
      const data = await preds.data();

      const recommendations = allSongIndices.map((idx, i) => ({
        songId: songIdMap.get(idx),
        score: data[i]
      })).sort((a, b) => b.score - a.score).slice(0, 3);

      console.log('Top AI Recommendations:');
      for (const rec of recommendations) {
        const s = await Song.findById(rec.songId);
        console.log(` - ${s.title} [${s.genre}] (Score: ${(rec.score * 100).toFixed(1)}%)`);
      }
      console.log('-----------------------------------');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testAI();
