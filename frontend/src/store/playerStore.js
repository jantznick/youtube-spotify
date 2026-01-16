import { create } from 'zustand';

export const playerStore = create((set, get) => ({
  currentSong: null,
  currentPlaylist: null,
  currentIndex: 0,
  isPlaying: false,
  queue: [],

  setCurrentSong: (song, playlist = null, index = 0, preserveQueue = false) => {
    const currentState = get();
    console.log('[playerStore setCurrentSong] Called with:', {
      songTitle: song?.title,
      preserveQueue,
      currentQueueLength: currentState.queue.length,
      currentSong: currentState.currentSong?.title || 'none',
      playlist: playlist?.name || 'none',
      index,
    });
    
    // Only autoplay if song has a YouTube ID
    const hasYouTubeId = !!song?.youtubeId;
    
    if (preserveQueue) {
      // When playing from queue, just update the current song and index
      const { queue } = get();
      const validIndex = Math.max(0, Math.min(index, queue.length - 1));
      console.log('[playerStore setCurrentSong] preserveQueue=true, updating song/index, keeping queue length:', queue.length);
      set({
        currentSong: song,
        currentPlaylist: playlist,
        currentIndex: validIndex,
        isPlaying: hasYouTubeId, // Only autoplay if has YouTube ID
      });
    } else {
      // When playing from playlist or elsewhere, set the queue
      const newQueue = playlist?.playlistSongs?.map((ps) => ps.song) || [song];
      const validIndex = Math.max(0, Math.min(index, newQueue.length - 1));
      console.log('[playerStore setCurrentSong] preserveQueue=false, REPLACING queue with length:', newQueue.length);
      set({
        currentSong: song,
        currentPlaylist: playlist,
        currentIndex: validIndex,
        queue: newQueue,
        isPlaying: hasYouTubeId, // Only autoplay if has YouTube ID
      });
    }
    
    // Log state after update
    setTimeout(() => {
      const afterState = get();
      console.log('[playerStore setCurrentSong] After update:', {
        queueLength: afterState.queue.length,
        currentSong: afterState.currentSong?.title || 'none',
      });
    }, 50);
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextSong: () => {
    const { currentIndex, queue } = get();
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = queue[nextIndex];
      set({
        currentIndex: nextIndex,
        currentSong: nextSong,
        isPlaying: !!nextSong?.youtubeId, // Only autoplay if next song has YouTube ID
      });
    }
  },

  previousSong: () => {
    const { currentIndex, queue } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = queue[prevIndex];
      set({
        currentIndex: prevIndex,
        currentSong: prevSong,
        isPlaying: !!prevSong?.youtubeId, // Only autoplay if previous song has YouTube ID
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
      // If no current song, set this as the current song and start playing (only if has YouTube ID)
      set({
        currentSong: song,
        currentIndex: 0,
        queue: [song],
        isPlaying: !!song?.youtubeId, // Only autoplay if has YouTube ID
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
    const validIndex = newCurrentIndex !== -1 
      ? Math.max(0, Math.min(newCurrentIndex, newOrder.length - 1))
      : 0;
    set({
      queue: newOrder,
      currentIndex: validIndex,
      currentSong: newCurrentIndex !== -1 ? newOrder[validIndex] : newOrder[0] || null,
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
