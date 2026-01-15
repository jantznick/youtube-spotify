import { create } from 'zustand';

export const playerStore = create((set, get) => ({
  currentSong: null,
  currentPlaylist: null,
  currentIndex: 0,
  isPlaying: false,
  queue: [],

  setCurrentSong: (song, playlist = null, index = 0) => {
    set({
      currentSong: song,
      currentPlaylist: playlist,
      currentIndex: index,
      queue: playlist?.playlistSongs?.map((ps) => ps.song) || [song],
    });
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

  stop: () => set({
    currentSong: null,
    currentPlaylist: null,
    currentIndex: 0,
    isPlaying: false,
    queue: [],
  }),
}));

const usePlayerStore = playerStore;
export default usePlayerStore;
