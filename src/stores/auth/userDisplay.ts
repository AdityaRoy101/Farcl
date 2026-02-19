// src/stores/userDisplay.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserDisplayState = {
  displayName: string | null;
  setDisplayName: (name: string) => void;
};

export const useUserDisplayStore = create<UserDisplayState>()(
  persist(
    (set) => ({
      displayName: null,
      setDisplayName: (name: string) => set({ displayName: name }),
    }),
    {
      name: "user-display",
      storage: createJSONStorage(() => localStorage),
    }
  )
);