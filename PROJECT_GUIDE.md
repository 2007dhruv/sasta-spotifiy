# 🌐 Project Guide: Spotify Clone (Full-Stack)

Everything you need to know about what we built, how it works, and how to run it.

---

## 🚀 How to Run the Project

### 1. Prerequisite: Local MongoDB
Ensure your local MongoDB is running at `mongodb://localhost:27017`.

### 2. Start the Backend (NestJS)
Open a terminal and run:
```powershell
cd server
npm run start:dev
```
*Current Port: `http://localhost:3000`*

### 3. Start the Frontend (Vite + React)
Open a **new** terminal and run:
```powershell
cd client
npm run dev
```
*Current URL: `http://localhost:5173`*

---

## ✅ Core Features We Built

### 🔐 Advanced Authentication (RBAC)
- **Roles:** `client` (Listener), `artist` (Song Creator), `admin` (Manager).
- **Status:** `pending` (Default for Artists), `verified` (Can upload), `blocked` (No access).
- **Secure JWT:** All sensitive actions require a valid token.

### 🏠 Dynamic Music Dashboard
- **Live Data:** Fetches real songs and categories from the database.
- **Micro-Animations:** Skeleton loaders (Pulse effect) for a smooth "Good Evening" greeting.
- **Glassmorphism:** Modern design language with blur effects and vibrant gradients.

### 🛡️ Admin Management Panel
- **User List:** View all registered artists and their statuses.
- **One-Click Actions:** Admins can instantly **Verify** artists or **Block** users.
- **Stats:** Overview of total users and pending actions.

### 🎵 Global Music & Playback Engine
- **Music Store:** Centralized control of songs, search, and playback.
- **Audio Controller:** A global engine that handles real-time MP3 streaming, play/pause syncing, and volume control.
- **Interactive Player:** A premium bar with seek functionality, time tracking, and dynamic song info.
- **File Handling:** Multi-part file uploads (Audio + Images) synced to the backend filesystem.

---

### 💖 Favorite Songs System
- **Heart Interaction:** Like/Unlike songs from the dashboard or the player bar.
- **Dedicated Library:** A premium "Liked Songs" section to manage your favorite tracks.
- **Atomic Operations:** Uses MongoDB `$addToSet` and `$pull` for zero-error collection management.

### 💾 Persistence & Stability Engine
- **Session Hydration:** App automatically fetches your profile (`/auth/me`) on refresh so you NEVER lose your Admin/Artist buttons.
- **Playback Memory:** Remembers your current song, exact timestamp, and volume even after browser closure.

---

## 🏗️ Technical Stack
- **Frontend:** React, Vite, Zustand (with `persist`), Framer Motion, Lucide React.
- **Backend:** NestJS, JWT Auth (Passport), Multer.
- **Database:** MongoDB (Mongoose).
- **Styling:** Custom CSS Design System.

---

## ✅ Recently Completed
- [x] **Session Hydration:** Profile recovery on browser refresh.
- [x] **Playback Persistence:** Remembering song progress across restarts.
- [x] **Favorite Songs Page:** Dedicated UI and backend collection logic.
- [x] **Interactive Seeking:** Clickable progress bar for timeline control.
- [x] **Artist Auto-fill:** Automated upload modal field population.
