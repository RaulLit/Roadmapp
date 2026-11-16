export interface Task {
  id: string;
  milestone_id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
  created_at: number;
}

export interface Milestone {
  id: string;
  roadmap_id: string;
  title: string;
  order_index: number;
  created_at: number;
  tasks?: Task[];
}

export interface Roadmap {
  id: string;
  title: string;
  created_at: number;
  milestones_count?: number;
  tasks_count?: number;
}

export interface FullRoadmap extends Roadmap {
  milestones: (Milestone & { tasks: Task[] })[];
}
