import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../types';

interface ChildState {
  children: ChildProfile[];
  selectedChildId: string | null;
  selectedChild: ChildProfile | null;

  setChildren: (children: ChildProfile[]) => void;
  addChild: (child: ChildProfile) => void;
  updateChild: (id: string, updates: Partial<ChildProfile>) => void;
  selectChild: (id: string) => void;
  clearSelected: () => void;
  clearAll: () => void;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      children: [],
      selectedChildId: null,
      selectedChild: null,

      setChildren: (children) => {
        set((state) => {
          const match = state.selectedChildId
            ? children.find((c) => c.id === state.selectedChildId)
            : null;
          // Fall back to first child if saved ID belongs to a different account
          const resolved = match ?? children[0] ?? null;
          return {
            children,
            selectedChild: resolved,
            selectedChildId: resolved?.id ?? null,
          };
        });
      },

      addChild: (child) => {
        set((state) => ({
          children: [...state.children, child],
          selectedChild: state.selectedChild ?? child,
          selectedChildId: state.selectedChildId ?? child.id,
        }));
      },

      updateChild: (id, updates) => {
        set((state) => ({
          children: state.children.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          selectedChild:
            state.selectedChildId === id
              ? { ...state.selectedChild!, ...updates }
              : state.selectedChild,
        }));
      },

      selectChild: (id) => {
        const child = get().children.find((c) => c.id === id);
        set({ selectedChildId: id, selectedChild: child ?? null });
      },

      clearSelected: () => {
        set({ selectedChildId: null, selectedChild: null });
      },

      clearAll: () => {
        set({ children: [], selectedChildId: null, selectedChild: null });
      },
    }),
    {
      name: 'ausome-children',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
