const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoUri = 'mongodb://localhost:27017/spotify-clone'; // Database name from typical NestJS setups or project history

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'client' },
  status: { type: String, default: 'verified' },
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
}, { timestamps: true });

const SongSchema = new mongoose.Schema({
  title: String,
  artist: String,
  genre: String,
  audioUrl: String,
  coverImageUrl: String
}, { timestamps: true });

const InteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  playCount: { type: Number, default: 0 },
  isLiked: { type: Boolean, default: false },
  completionRate: { type: Number, default: 0 },
  skipCount: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Song = mongoose.model('Song', SongSchema);
const Interaction = mongoose.model('Interaction', InteractionSchema);

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Clear existing AI data
    await Interaction.deleteMany({});
    console.log('Cleared Interactions');

    // 2. Fetch or Create Songs
    let songs = await Song.find({});
    if (songs.length < 10) {
      console.log('Not enough songs. Adding demo songs...');
      const demoSongs = [
        { title: 'Neon Lights', artist: 'SynthWave Pro', genre: 'Pop', audioUrl: 'uploads/songs/demo1.mp3', coverImageUrl: 'uploads/covers/demo1.jpg' },
        { title: 'Retro Pulse', artist: 'SynthWave Pro', genre: 'Pop', audioUrl: 'uploads/songs/demo2.mp3', coverImageUrl: 'uploads/covers/demo2.jpg' },
        { title: 'Midnight City', artist: 'Metro Boy', genre: 'Pop', audioUrl: 'uploads/songs/demo3.mp3', coverImageUrl: 'uploads/covers/demo3.jpg' },
        { title: 'Heavy Metal Thunder', artist: 'Iron Soul', genre: 'Rock', audioUrl: 'uploads/songs/demo4.mp3', coverImageUrl: 'uploads/covers/demo4.jpg' },
        { title: 'Electric Shred', artist: 'Iron Soul', genre: 'Rock', audioUrl: 'uploads/songs/demo5.mp3', coverImageUrl: 'uploads/covers/demo5.jpg' },
        { title: 'Urban Legend', artist: 'The Rebels', genre: 'Rock', audioUrl: 'uploads/songs/demo6.mp3', coverImageUrl: 'uploads/covers/demo6.jpg' },
        { title: 'Blue Note Morning', artist: 'Jazz Cat', genre: 'Jazz', audioUrl: 'uploads/songs/demo7.mp3', coverImageUrl: 'uploads/covers/demo7.jpg' },
        { title: 'Smooth Sailing', artist: 'Jazz Cat', genre: 'Jazz', audioUrl: 'uploads/songs/demo8.mp3', coverImageUrl: 'uploads/covers/demo8.jpg' },
        { title: 'Rainy Day Coffee', artist: 'Lounge Duo', genre: 'Jazz', audioUrl: 'uploads/songs/demo9.mp3', coverImageUrl: 'uploads/covers/demo9.jpg' },
        { title: 'Vibe Check', artist: 'Lounge Duo', genre: 'Jazz', audioUrl: 'uploads/songs/demo10.mp3', coverImageUrl: 'uploads/covers/demo10.jpg' },
      ];
      songs = await Song.insertMany(demoSongs);
      console.log(`Added ${songs.length} demo songs`);
    }

    // 3. Create Persona Users
    const personas = [
      { name: 'Pop Fanatic', email: 'pop@demo.com', genre: 'Pop' },
      { name: 'Rock Star', email: 'rock@demo.com', genre: 'Rock' },
      { name: 'Jazz Soul', email: 'jazz@demo.com', genre: 'Jazz' },
      { name: 'Eclectic Mix', email: 'mixed@demo.com', genre: 'mixed' }
    ];

    const users = [];
    for (const p of personas) {
      let user = await User.findOne({ email: p.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await User.create({ name: p.name, email: p.email, password: hashedPassword });
      }
      users.push({ user, persona: p });
    }
    console.log(`Prepared ${users.length} persona users`);

    // 4. Generate Interactions based on Personas
    console.log('Generating interactions...');
    const interactions = [];

    for (const { user, persona } of users) {
      for (const song of songs) {
        let isInterested = false;
        if (persona.genre === 'mixed') {
          isInterested = Math.random() > 0.2;
        } else {
          // EXTREME BIAS for their genre
          isInterested = song.genre === persona.genre ? Math.random() > 0.01 : Math.random() > 0.95;
        }

        if (isInterested) {
          const isLiked = song.genre === persona.genre ? Math.random() > 0.1 : Math.random() > 0.9;
          const playCount = song.genre === persona.genre ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 3) + 1;
          const completionRate = isLiked ? (0.9 + Math.random() * 0.1) : (0.1 + Math.random() * 0.4);
          
          // Higher range for score to help Neural Net distinguish
          const score = (isLiked ? 20 : 0) + (playCount * 0.5) + (completionRate * 10);

          interactions.push({
            userId: user._id,
            songId: song._id,
            isLiked,
            playCount,
            completionRate,
            score
          });

          if (isLiked && !user.likedSongs.includes(song._id)) {
            await User.findByIdAndUpdate(user._id, { $addToSet: { likedSongs: song._id } });
          }
        }
      }
    }

    await Interaction.insertMany(interactions);
    console.log(`Successfully seeded ${interactions.length} interactions!`);
    console.log('AI Training Data is now READY.');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
