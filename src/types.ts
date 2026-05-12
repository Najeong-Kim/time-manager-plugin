export type Category = "work" | "personal" | "hobby" | "study";

export interface Task {
  line: number;
  raw: string;
  startTime: string; // "HH:MM"
  title: string;
  completed: boolean;
  dur?: number;       // minutes
  cat?: Category;
}

export interface PluginSettings {
  dailyNoteFolder: string;
  dailyNoteDateFormat: string;
  plannerLabel: string;
  workingHoursLimit: number; // hours, default 8
  categories: CategoryConfig[];
}

export interface CategoryConfig {
  id: string;
  label: string;
  color: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  dailyNoteFolder: "Daily Notes",
  dailyNoteDateFormat: "YYYY-MM-DD",
  plannerLabel: "Timeline",
  workingHoursLimit: 8,
  categories: [
    { id: "work",     label: "Work",     color: "#4a9eff" },
    { id: "study",    label: "Study",    color: "#8bc34a" },
    { id: "personal", label: "Personal", color: "#f9a825" },
    { id: "hobby",    label: "Hobby",    color: "#ce93d8" },
  ],
};
