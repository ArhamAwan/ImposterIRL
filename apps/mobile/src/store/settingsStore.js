import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticsEnabled: true,
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptics: () =>
        set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
