import { Task, CategoryConfig } from "../types";

export interface CategoryStat {
  id: string;
  label: string;
  color: string;
  durMinutes: number;
  doneMinutes: number;
}

export interface DayStats {
  totalDur: number;
  totalDone: number;
  categories: CategoryStat[];
  overScheduled: boolean;
  limitMinutes: number;
}

export function calcDayStats(tasks: Task[], categories: CategoryConfig[], limitHours: number): DayStats {
  const limitMinutes = limitHours * 60;
  const catMap = new Map<string, CategoryStat>();

  for (const cfg of categories) {
    catMap.set(cfg.id, { id: cfg.id, label: cfg.label, color: cfg.color, durMinutes: 0, doneMinutes: 0 });
  }
  catMap.set("none", { id: "none", label: "Etc", color: "#f48fb1", durMinutes: 0, doneMinutes: 0 });

  let totalDur = 0;
  let totalDone = 0;

  for (const task of tasks) {
    if (!task.title || task.title.toLowerCase() === "end") continue;
    if (!task.dur) continue;

    totalDur += task.dur;
    const entry = catMap.get(task.cat ?? "none")!;
    entry.durMinutes += task.dur;

    if (task.completed) {
      totalDone += task.dur;
      entry.doneMinutes += task.dur;
    }
  }

  return {
    totalDur,
    totalDone,
    categories: Array.from(catMap.values()).filter((c) => c.durMinutes > 0),
    overScheduled: totalDur > limitMinutes,
    limitMinutes,
  };
}
