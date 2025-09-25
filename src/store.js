import { create } from 'zustand';

const usePhotoStore = create((set) => ({
  currentPhotoIndex: 0,
  photos: [],
  setPhotos: (newPhotos) => set({ photos: newPhotos }),
  setNextPhoto: () => set((state) => ({
    currentPhotoIndex: (state.currentPhotoIndex + 1) % state.photos.length,
  })),
  setPrevPhoto: () => set((state) => ({
    currentPhotoIndex: (state.currentPhotoIndex - 1 + state.photos.length) % state.photos.length,
  })),
}));

export default usePhotoStore;
