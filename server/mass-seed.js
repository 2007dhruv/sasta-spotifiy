const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoUri = 'mongodb://localhost:27017/spotify-clone';

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
  score: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Song = mongoose.model('Song', SongSchema);
const Interaction = mongoose.model('Interaction', InteractionSchema);

const demoSongs = [
  { title: "One More Dance", artist: "Arulo", genre: "Pop", audioUrl: "https://assets.mixkit.co/music/preview/mixkit-one-more-dance-968.mp3", coverImageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=1000" },
  { title: "Night Sky Hip Hop", artist: "Michael Ramir C.", genre: "Hip-Hop", audioUrl: "https://assets.mixkit.co/music/preview/mixkit-night-sky-hip-hop-970.mp3", coverImageUrl: "https://images.unsplash.com/photo-1514525253344-f81bcd02917d?auto=format&fit=crop&q=80&w=1000" },
  { title: "Summer Sport", artist: "AudioCoffee", genre: "Rock", audioUrl: "https://www.chosic.com/wp-content/uploads/2022/07/Summer-Sport.mp3", coverImageUrl: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&q=80&w=1000" },
  { title: "Lobby Time", artist: "Kevin MacLeod", genre: "Jazz", audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Lobby%20Time.mp3", coverImageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=1000" },
  { title: "Neon Drive", artist: "Ghostrifter Official", genre: "Synthwave", audioUrl: "https://www.chosic.com/wp-content/uploads/2021/04/Neon-Drive.mp3", coverImageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000" },
  { title: "Life is a Dream", artist: "Michael Ramir C.", genre: "Pop", audioUrl: "https://assets.mixkit.co/music/preview/mixkit-life-is-a-dream-975.mp3", coverImageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1000" },
  { title: "Island Beat", artist: "Arulo", genre: "Pop", audioUrl: "https://assets.mixkit.co/music/preview/mixkit-island-beat-974.mp3", coverImageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1000" },
  { title: "Dancin", artist: "Luke Bergs", genre: "Pop", audioUrl: "https://www.chosic.com/wp-content/uploads/2022/01/Dancin.mp3", coverImageUrl: "https://images.unsplash.com/photo-1546707012-c51841275bd0?auto=format&fit=crop&q=80&w=1000" },
  { title: "Neon Lights", artist: "Ghostrifter Official", genre: "Synthwave", audioUrl: "https://www.chosic.com/wp-content/uploads/2021/04/Neon-Lights.mp3", coverImageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=1000" },
  { title: "Farming Moon", artist: "McFunkypants", genre: "Pop", audioUrl: "https://www.chosic.com/wp-content/uploads/2023/07/Farming-By-Moonlight.mp3", coverImageUrl: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=1000" }
];

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('--- RE-SEEDING WITH REAL ASSETS ---');

    // 1. Clear Old Data
    await Song.deleteMany({});
    await Interaction.deleteMany({});
    await User.updateMany({}, { likedSongs: [] });

    // 2. Insert New High-Quality Songs
    const songs = await Song.insertMany(demoSongs);
    console.log(`Inserted ${songs.length} premium songs.`);

    // 3. Fetch All Users (to ensure your account 'Dhruv' gets recommendations too)
    const users = await User.find({});
    console.log(`Found ${users.length} users to simulate history for.`);

    // 4. Generate High-Quality Interactions
    console.log('Simulating realistic audience interactions...');
    const interactions = [];

    for (const user of users) {
      // Pick a random 'persona' for each user if not a demo account
      const personas = ['Pop', 'Rock', 'Jazz', 'Synthwave'];
      const targetGenre = user.email.includes("demo.com") 
        ? (user.email.includes("pop") ? "Pop" : (user.email.includes("rock") ? "Rock" : "Jazz"))
        : personas[Math.floor(Math.random() * personas.length)];

      console.log(`Simulating history for ${user.name} (${targetGenre} fan)...`);

      for (const song of songs) {
        // High interest if genre matches
        const isMatch = song.genre === targetGenre || (targetGenre === "Pop" && song.genre === "Synthwave");
        const prob = isMatch ? 0.9 : 0.1;

        if (Math.random() < prob) {
          const isLiked = isMatch ? Math.random() > 0.1 : Math.random() > 0.8;
          const playCount = isMatch ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 5) + 1;
          const completionRate = isLiked ? (0.95 + Math.random() * 0.05) : (0.2 + Math.random() * 0.4);
          
          const score = (isLiked ? 20 : 0) + (playCount * 0.5) + (completionRate * 10);

          interactions.push({
            userId: user._id,
            songId: song._id,
            isLiked,
            playCount,
            completionRate,
            score
          });

          if (isLiked) {
            await User.findByIdAndUpdate(user._id, { $addToSet: { likedSongs: song._id } });
          }
        }
      }
    }

    await Interaction.insertMany(interactions);
    console.log(`Successfully simulated ${interactions.length} interactions.`);
    console.log('--- MASS SEED COMPLETE ---');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
