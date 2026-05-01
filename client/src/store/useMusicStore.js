import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const useMusicStore = create(
  persist(
    (set, get) => ({
      songs: [],
      loading: false,
      error: null,
      currentSong: null,
      isPlaying: false,
      uploadProgress: 0,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      likedSongs: [], // Just IDs for UI syncing
      favoriteSongs: [], // Full song objects for the page
      history: [], // Full objects with playedAt
      aiRecommendations: [], // AI personalized songs
      toast: { show: false, message: '', type: 'success' },

      fetchAIRecommendations: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/songs/recommendations/ai`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ aiRecommendations: response.data || [] });
        } catch (err) {
          console.error('Failed to fetch AI recommendations:', err);
        }
      },

      showToast: (message, type = 'success') => {
        set({ toast: { show: true, message, type } });
        setTimeout(() => {
          set({ toast: { show: false, message: '', type: 'success' } });
        }, 3000);
      },

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (dur) => set({ duration: dur }),
      setVolume: (val) => set({ volume: val }),

      fetchSongs: async (genre = '') => {
        set({ loading: true, error: null });
        try {
          const url = genre ? `${API_URL}/songs?genre=${genre}` : `${API_URL}/songs`;
          const response = await axios.get(url);
          set({ songs: response.data, loading: false });
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to fetch songs', loading: false });
        }
      },

      fetchFavorites: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/users/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const songs = response.data?.likedSongs || [];
          set({ 
            favoriteSongs: songs,
            likedSongs: songs.map(s => s._id)
          });
        } catch (err) {
          console.error('Failed to fetch favorites:', err);
        }
      },

      toggleFavorite: async (songId) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Optimistic UI update
        const isLiked = get().likedSongs.includes(songId);
        const newLikedSongs = isLiked 
          ? get().likedSongs.filter(id => id !== songId) 
          : [...get().likedSongs, songId];
        
        set({ likedSongs: newLikedSongs });

        try {
          await axios.post(`${API_URL}/users/toggle-favorite/${songId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          get().fetchFavorites(); // Refresh to get correct full objects
          get().showToast(
            isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs',
            isLiked ? 'error' : 'success'
          );
        } catch (err) {
          console.error('Failed to toggle favorite:', err);
          // Rollback on error
          set({ likedSongs: get().likedSongs }); 
          get().showToast('Failed to update favorites', 'error');
        }
      },

      uploadSong: async (formData) => {
        set({ loading: true, error: null, uploadProgress: 0 });
        const token = localStorage.getItem('token');
        try {
          const response = await axios.post(`${API_URL}/songs/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              set({ uploadProgress: progress });
            }
          });
          set({ loading: false, uploadProgress: 100 });
          get().fetchSongs();
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
          set({ error: errorMessage, loading: false, uploadProgress: 0 });
          throw err;
        }
      },

      requestedSeekTime: null,

      setCurrentSong: (song) => set({ currentSong: song, isPlaying: true, requestedSeekTime: null }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      seekTo: (time) => set({ requestedSeekTime: time }),

      playNext: () => {
        const { songs, currentSong } = get();
        if (!songs.length || !currentSong) return;
        const currentIndex = songs.findIndex(s => s._id === currentSong._id);
        const nextIndex = (currentIndex + 1) % songs.length;
        set({ currentSong: songs[nextIndex], isPlaying: true, requestedSeekTime: 0 });
      },

      playPrevious: () => {
        const { songs, currentSong } = get();
        if (!songs.length || !currentSong) return;
        const currentIndex = songs.findIndex(s => s._id === currentSong._id);
        const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
        set({ currentSong: songs[prevIndex], isPlaying: true, requestedSeekTime: 0 });
      },
      playlists: [],
      activePlaylist: null,
      
      fetchPlaylists: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/playlists`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ playlists: response.data || [] });
        } catch (err) {
          console.error('Failed to fetch playlists:', err);
        }
      },

      fetchPlaylistDetail: async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        set({ loading: true });
        try {
          const response = await axios.get(`${API_URL}/playlists/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ activePlaylist: response.data, loading: false });
        } catch (err) {
          console.error('Failed to fetch playlist detail:', err);
          set({ loading: false });
          throw err;
        }
      },

      createPlaylist: async (name) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await axios.post(`${API_URL}/playlists`, { name }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set((state) => ({ playlists: [...state.playlists, response.data] }));
          return response.data;
        } catch (err) {
          console.error('Failed to create playlist:', err);
          throw err;
        }
      },

      addSongToPlaylist: async (playlistId, songId) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          await axios.post(`${API_URL}/playlists/${playlistId}/songs/${songId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Refresh list to update counts/covers
          get().fetchPlaylists();
          // Find playlist name for the toast
          const playlist = get().playlists.find(p => p._id === playlistId);
          get().showToast(`Added to ${playlist?.name || 'playlist'}!`);
        } catch (err) {
          console.error('Failed to add song to playlist:', err);
          get().showToast('Failed to add to playlist', 'error');
          throw err;
        }
      },

      removeSongFromPlaylist: async (playlistId, songId) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          await axios.delete(`${API_URL}/playlists/${playlistId}/songs/${songId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Update active playlist locally for instant UI feedback
          const active = get().activePlaylist;
          if (active && active._id === playlistId) {
            set({
              activePlaylist: {
                ...active,
                songs: active.songs.filter(s => s._id !== songId)
              }
            });
          }
          get().fetchPlaylists();
          get().showToast('Removed from playlist', 'error');
        } catch (err) {
          console.error('Failed to remove song:', err);
          get().showToast('Failed to remove song', 'error');
        }
      },

      deletePlaylist: async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          await axios.delete(`${API_URL}/playlists/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set((state) => ({ 
            playlists: state.playlists.filter(p => p._id !== id),
            activePlaylist: state.activePlaylist?._id === id ? null : state.activePlaylist
          }));
          get().showToast('Playlist deleted');
        } catch (err) {
          console.error('Failed to delete playlist:', err);
          get().showToast('Failed to delete playlist', 'error');
          throw err;
        }
      },


      fetchHistory: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/users/history`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ history: response.data?.listeningHistory || [] });
        } catch (err) {
          console.error('Failed to fetch history:', err);
        }
      },

      addToHistory: async (songId) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const response = await axios.post(`${API_URL}/users/history/${songId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Update history state instantly with returned populated data
          set({ history: response.data?.listeningHistory || [] });
        } catch (err) {
          console.error('Failed to add to history:', err);
        }
      },
    }),

    {
      name: 'spotify-music-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields
      partialize: (state) => ({ 
        currentSong: state.currentSong, 
        currentTime: state.currentTime, 
        volume: state.volume,
        likedSongs: state.likedSongs
      }),
    }

  )
);
