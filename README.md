# 🎵 Spotifiy (Full-Stack Music Streaming Platform)

A premium, full-stack Spotify clone featuring advanced Role-Based Access Control (RBAC), real-time music playback, persistent sessions, and a beautifully designed, dynamic UI with glassmorphism and micro-animations.

## 🌟 Core Features

- **🔐 Advanced Authentication & RBAC**: Secure JWT-based authentication with distinct roles (`client`, `artist`, `admin`). Includes an admin panel for user management and artist verification.
- **🎵 Global Music Engine**: Centralized audio controller with real-time MP3 streaming, interactive progress bar seeking, and continuous playback across navigation.
- **💖 Personalized Library**: Users can like and manage favorite songs with zero-error atomic MongoDB operations.
- **💾 Persistence & Stability**: Features session hydration to keep you logged in after refresh and playback memory to remember your song, timestamp, and volume across browser restarts.
- **🎨 Premium UI/UX**: Built with a custom CSS design system leveraging glassmorphism, dynamic gradients, and smooth Framer Motion animations.

## 🏗️ Tech Stack

- **Frontend**: React, Vite, Zustand (with persist), Framer Motion, Lucide React
- **Backend**: NestJS, JWT Auth (Passport), Multer
- **Database**: MongoDB (Mongoose)

## 🚀 Quick Start

### Prerequisites
- Make sure MongoDB is running locally at `mongodb://localhost:27017`.

### Backend Setup
```bash
cd server
npm install
npm run start:dev
```
*(Runs on http://localhost:3000)*

### Frontend Setup
```bash
cd client
npm install
npm run dev
```
*(Runs on http://localhost:5173)*
