import { getDatabase } from './database';
import { FullRoadmap, Milestone, Roadmap, Task } from './types';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export function fetchRoadmaps(): Roadmap[] {
  const db = getDatabase();
  const rows = db.getAllSync<{
    id: string;
    title: string;
    created_at: number;
    milestones_count: number;
    tasks_count: number;
  }>(`
    SELECT 
      r.id, 
      r.title, 
      r.created_at,
      (SELECT COUNT(*) FROM milestones m WHERE m.roadmap_id = r.id) as milestones_count,
      (SELECT COUNT(*) FROM tasks t JOIN milestones m ON t.milestone_id = m.id WHERE m.roadmap_id = r.id) as tasks_count
    FROM roadmaps r
    ORDER BY r.created_at DESC;
  `);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    created_at: row.created_at,
    milestones_count: row.milestones_count,
    tasks_count: row.tasks_count,
  }));
}

export function insertRoadmap(title: string): Roadmap {
  const db = getDatabase();
  const id = generateId();
  const createdAt = Date.now();

  db.runSync(
    'INSERT INTO roadmaps (id, title, created_at) VALUES (?, ?, ?);',
    [id, title.trim(), createdAt]
  );

  return {
    id,
    title: title.trim(),
    created_at: createdAt,
    milestones_count: 0,
    tasks_count: 0,
  };
}

export function deleteRoadmapById(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM roadmaps WHERE id = ?;', [id]);
}

export function fetchFullRoadmap(roadmapId: string): FullRoadmap | null {
  const db = getDatabase();
  const roadmap = db.getFirstSync<{ id: string; title: string; created_at: number }>(
    'SELECT id, title, created_at FROM roadmaps WHERE id = ?;',
    [roadmapId]
  );

  if (!roadmap) {
    return null;
  }

  const milestones = db.getAllSync<{
    id: string;
    roadmap_id: string;
    title: string;
    order_index: number;
    created_at: number;
  }>(
    'SELECT id, roadmap_id, title, order_index, created_at FROM milestones WHERE roadmap_id = ? ORDER BY order_index ASC, created_at ASC;',
    [roadmapId]
  );

  const rawTasks = db.getAllSync<{
    id: string;
    milestone_id: string;
    title: string;
    is_completed: number;
    order_index: number;
    created_at: number;
  }>(
    `SELECT t.id, t.milestone_id, t.title, t.is_completed, t.order_index, t.created_at 
     FROM tasks t 
     JOIN milestones m ON t.milestone_id = m.id 
     WHERE m.roadmap_id = ? 
     ORDER BY t.order_index ASC, t.created_at ASC;`,
    [roadmapId]
  );

  const tasksByMilestone: Record<string, Task[]> = {};
  for (const t of rawTasks) {
    if (!tasksByMilestone[t.milestone_id]) {
      tasksByMilestone[t.milestone_id] = [];
    }
    tasksByMilestone[t.milestone_id].push({
      id: t.id,
      milestone_id: t.milestone_id,
      title: t.title,
      is_completed: Boolean(t.is_completed),
      order_index: t.order_index,
      created_at: t.created_at,
    });
  }

  const nestedMilestones = milestones.map((m) => ({
    id: m.id,
    roadmap_id: m.roadmap_id,
    title: m.title,
    order_index: m.order_index,
    created_at: m.created_at,
    tasks: tasksByMilestone[m.id] || [],
  }));

  return {
    id: roadmap.id,
    title: roadmap.title,
    created_at: roadmap.created_at,
    milestones: nestedMilestones,
  };
}

export function insertMilestone(roadmapId: string, title: string): Milestone {
  const db = getDatabase();
  const id = generateId();
  const createdAt = Date.now();

  const orderRow = db.getFirstSync<{ next_order: number }>(
    'SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM milestones WHERE roadmap_id = ?;',
    [roadmapId]
  );
  const orderIndex = orderRow?.next_order ?? 0;

  db.runSync(
    'INSERT INTO milestones (id, roadmap_id, title, order_index, created_at) VALUES (?, ?, ?, ?, ?);',
    [id, roadmapId, title.trim(), orderIndex, createdAt]
  );

  return {
    id,
    roadmap_id: roadmapId,
    title: title.trim(),
    order_index: orderIndex,
    created_at: createdAt,
    tasks: [],
  };
}

export function deleteMilestoneById(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM milestones WHERE id = ?;', [id]);
}

export function insertTask(milestoneId: string, title: string): Task {
  const db = getDatabase();
  const id = generateId();
  const createdAt = Date.now();

  const orderRow = db.getFirstSync<{ next_order: number }>(
    'SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM tasks WHERE milestone_id = ?;',
    [milestoneId]
  );
  const orderIndex = orderRow?.next_order ?? 0;

  db.runSync(
    'INSERT INTO tasks (id, milestone_id, title, is_completed, order_index, created_at) VALUES (?, ?, ?, 0, ?, ?);',
    [id, milestoneId, title.trim(), orderIndex, createdAt]
  );

  return {
    id,
    milestone_id: milestoneId,
    title: title.trim(),
    is_completed: false,
    order_index: orderIndex,
    created_at: createdAt,
  };
}

export function toggleTaskStatus(taskId: string, isCompleted: boolean): void {
  const db = getDatabase();
  db.runSync('UPDATE tasks SET is_completed = ? WHERE id = ?;', [isCompleted ? 1 : 0, taskId]);
}

export function deleteTaskById(taskId: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM tasks WHERE id = ?;', [taskId]);
}
