import { App, TFile, normalizePath } from "obsidian";
import { formatDate } from "./DateUtils";

export async function getDailyNoteFile(
  app: App,
  date: Date,
  folder: string
): Promise<TFile | null> {
  const dateStr = formatDate(date);
  const path = normalizePath(`${folder}/${dateStr}.md`);
  const file = app.vault.getAbstractFileByPath(path);
  return file instanceof TFile ? file : null;
}

export async function getOrCreateDailyNoteFile(
  app: App,
  date: Date,
  folder: string,
  plannerLabel: string
): Promise<TFile> {
  const existing = await getDailyNoteFile(app, date, folder);
  if (existing) return existing;

  const dateStr = formatDate(date);
  const path = normalizePath(`${folder}/${dateStr}.md`);
  const content = `## ${plannerLabel}\n- [ ] 23:00 end\n`;
  return app.vault.create(path, content);
}
