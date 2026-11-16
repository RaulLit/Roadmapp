import { create } from 'zustand';
import { FullRoadmap, Roadmap } from '../db/types';
import * as queries from '../db/queries';

interface RoadmapState {
  roadmaps: Roadmap[];
  currentRoadmap: FullRoadmap | null;
  isLoading: boolean;
  error: string | null;

  loadRoadmaps: () => void;
  loadRoadmap: (id: string) => void;
  addRoadmap: (title: string) => Roadmap | null;
  renameRoadmap: (id: string, newTitle: string) => void;
  removeRoadmap: (id: string) => void;

  addMilestone: (roadmapId: string, title: string) => void;
  removeMilestone: (roadmapId: string, milestoneId: string) => void;

  addTask: (roadmapId: string, milestoneId: string, title: string) => void;
  toggleTask: (roadmapId: string, taskId: string, currentStatus: boolean) => void;
  removeTask: (roadmapId: string, taskId: string) => void;
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  roadmaps: [],
  currentRoadmap: null,
  isLoading: false,
  error: null,

  loadRoadmaps: () => {
    try {
      set({ isLoading: true, error: null });
      const roadmaps = queries.fetchRoadmaps();
      set({ roadmaps, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  loadRoadmap: (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const currentRoadmap = queries.fetchFullRoadmap(id);
      set({ currentRoadmap, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addRoadmap: (title: string) => {
    try {
      const newRoadmap = queries.insertRoadmap(title);
      set((state) => ({
        roadmaps: [newRoadmap, ...state.roadmaps],
      }));
      return newRoadmap;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  renameRoadmap: (id: string, newTitle: string) => {
    try {
      queries.updateRoadmapTitle(id, newTitle);
      const updated = queries.fetchFullRoadmap(id);
      const roadmaps = queries.fetchRoadmaps();
      set({ currentRoadmap: updated, roadmaps });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  removeRoadmap: (id: string) => {
    try {
      queries.deleteRoadmapById(id);
      set((state) => ({
        roadmaps: state.roadmaps.filter((r) => r.id !== id),
        currentRoadmap: state.currentRoadmap?.id === id ? null : state.currentRoadmap,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addMilestone: (roadmapId: string, title: string) => {
    try {
      queries.insertMilestone(roadmapId, title);
      const updated = queries.fetchFullRoadmap(roadmapId);
      const roadmaps = queries.fetchRoadmaps();
      set({ currentRoadmap: updated, roadmaps });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  removeMilestone: (roadmapId: string, milestoneId: string) => {
    try {
      queries.deleteMilestoneById(milestoneId);
      const updated = queries.fetchFullRoadmap(roadmapId);
      const roadmaps = queries.fetchRoadmaps();
      set({ currentRoadmap: updated, roadmaps });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addTask: (roadmapId: string, milestoneId: string, title: string) => {
    try {
      queries.insertTask(milestoneId, title);
      const updated = queries.fetchFullRoadmap(roadmapId);
      const roadmaps = queries.fetchRoadmaps();
      set({ currentRoadmap: updated, roadmaps });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  toggleTask: (roadmapId: string, taskId: string, currentStatus: boolean) => {
    try {
      queries.toggleTaskStatus(taskId, !currentStatus);
      const updated = queries.fetchFullRoadmap(roadmapId);
      set({ currentRoadmap: updated });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  removeTask: (roadmapId: string, taskId: string) => {
    try {
      queries.deleteTaskById(taskId);
      const updated = queries.fetchFullRoadmap(roadmapId);
      const roadmaps = queries.fetchRoadmaps();
      set({ currentRoadmap: updated, roadmaps });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
