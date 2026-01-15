import { create } from 'zustand';

export const playerStore = create((set, get) => ({
  currentSong: null,
  currentPlaylist: null,
  currentIndex: 0,
  isPlaying: false,
  queue: [],

  setCurrentSong: (song, playlist = null, index = 0, preserveQueue = false) => {
    if (preserveQueue) {
      // When playing from queue, just update the current song and index
      set({
        currentSong: song,
        currentPlaylist: playlist,
        currentIndex: index,
        isPlaying: true,
      });
    } else {
      // When playing from playlist or elsewhere, set the queue
      set({
        currentSong: song,
        currentPlaylist: playlist,
        currentIndex: index,
        queue: playlist?.playlistSongs?.map((ps) => ps.song) || [song],
        isPlaying: true, // Autoplay when setting a new song
      });
    }
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextSong: () => {
    const { currentIndex, queue } = get();
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      set({
        currentIndex: nextIndex,
        currentSong: queue[nextIndex],
        isPlaying: true,
      });
    }
  },

  previousSong: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      set({
        currentIndex: prevIndex,
        currentSong: get().queue[prevIndex],
        isPlaying: true,
      });
    }
  },

  setQueue: (songs) => set({ queue: songs }),

  playNext: (song) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    // Insert song right after current song
    newQueue.splice(currentIndex + 1, 0, song);
    set({ queue: newQueue });
  },

  addToQueue: (song) => {
    const { queue, currentIndex, currentSong } = get();
    const newQueue = [...queue];
    // Add to end of queue if there's a current song, otherwise add as first item and start playing
    if (currentSong) {
      newQueue.push(song);
      set({ queue: newQueue });
    } else {
      // If no current song, set this as the current song and start playing
      set({
        currentSong: song,
        currentIndex: 0,
        queue: [song],
        isPlaying: true,
      });
    }
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    if (index <= currentIndex) {
      // If removing current or before current, adjust currentIndex
      const newQueue = queue.filter((_, i) => i !== index);
      const newCurrentIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
      set({
        queue: newQueue,
        currentIndex: Math.min(newCurrentIndex, newQueue.length - 1),
        currentSong: newQueue[Math.min(newCurrentIndex, newQueue.length - 1)] || null,
      });
    } else {
      // Removing after current, just remove from queue
      const newQueue = queue.filter((_, i) => i !== index);
      set({ queue: newQueue });
    }
  },

  reorderQueue: (newOrder) => {
    const { currentIndex, currentSong } = get();
    // Find the new index of the current song
    const newCurrentIndex = newOrder.findIndex(song => song.id === currentSong?.id);
    set({
      queue: newOrder,
      currentIndex: newCurrentIndex !== -1 ? newCurrentIndex : 0,
      currentSong: newCurrentIndex !== -1 ? newOrder[newCurrentIndex] : newOrder[0] || null,
    });
  },

  showQueue: false,
  setShowQueue: (show) => set({ showQueue: show }),

  stop: () => set({
    currentSong: null,
    currentPlaylist: null,
    currentIndex: 0,
    isPlaying: false,
    queue: [],
    showQueue: false,
  }),
}));

const usePlayerStore = playerStore;
export default usePlayerStore;
