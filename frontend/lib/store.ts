import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AuthUser, Tree } from "./api";

// ─── Auth slice ───────────────────────────────────────────────────────────────

interface AuthSlice {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

// ─── Trees slice ──────────────────────────────────────────────────────────────

interface TreesSlice {
  activeTree: Tree | null;
  setActiveTree: (tree: Tree | null) => void;
}

// ─── UI slice ─────────────────────────────────────────────────────────────────

interface UiSlice {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// ─── Combined store ───────────────────────────────────────────────────────────

type AppStore = AuthSlice & TreesSlice & UiSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }, false, "setUser"),

      // Trees
      activeTree: null,
      setActiveTree: (activeTree) => set({ activeTree }, false, "setActiveTree"),

      // UI
      sidebarOpen: true,
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "toggleSidebar"),
      setSidebarOpen: (sidebarOpen) =>
        set({ sidebarOpen }, false, "setSidebarOpen"),
    }),
    { name: "webtrees-store" },
  ),
);

// Convenience selectors
export const useUser = () => useAppStore((s) => s.user);
export const useActiveTree = () => useAppStore((s) => s.activeTree);
export const useSidebarOpen = () => useAppStore((s) => s.sidebarOpen);
