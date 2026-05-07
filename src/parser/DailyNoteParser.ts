import { App, TFile } from "obsidian";
import { Task } from "../types";
import { parseTaskLine, upsertField } from "./InlineFieldParser";

export function parseTasks(content: string, plannerLabel: string): Task[] {
  const lines = content.split("\n");
  let inPlannerSection = false;
  const tasks: Task[] = [];
  const labelPattern = new RegExp(plannerLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^## /.test(line)) {
      inPlannerSection = labelPattern.test(line);
      continue;
    }

    if (!inPlannerSection) continue;

    const task = parseTaskLine(line, i);
    if (task) tasks.push(task);
  }

  return tasks;
}

export async function updateTaskField(
  app: App,
  file: TFile,
  lineIndex: number,
  key: string,
  value: string | number
): Promise<void> {
  const content = await app.vault.read(file);
  const lines = content.split("\n");

  if (lineIndex < 0 || lineIndex >= lines.length) return;

  lines[lineIndex] = upsertField(lines[lineIndex], key, value);
  await app.vault.modify(file, lines.join("\n"));
}

export async function setTaskCompleted(
  app: App,
  file: TFile,
  lineIndex: number,
  completed: boolean
): Promise<void> {
  const content = await app.vault.read(file);
  const lines = content.split("\n");

  if (lineIndex < 0 || lineIndex >= lines.length) return;

  lines[lineIndex] = lines[lineIndex].replace(
    /^(- \[)[ x](\])/,
    `$1${completed ? "x" : " "}$2`
  );
  await app.vault.modify(file, lines.join("\n"));
}

// Append a new task line into the planner section, sorted by time
export async function appendTask(
  app: App,
  file: TFile,
  newLine: string,
  plannerLabel: string
): Promise<void> {
  const content = await app.vault.read(file);
  const lines = content.split("\n");

  // Find the planner section heading
  const sectionIdx = lines.findIndex((l) => new RegExp(`## ${plannerLabel}`, "i").test(l));
  if (sectionIdx === -1) {
    // Append section at end
    const appended = content.trim() + `\n\n## ${plannerLabel}\n${newLine}\n`;
    await app.vault.modify(file, appended);
    return;
  }

  // Collect existing task lines in the section
  const taskPattern = /^- \[[ x]\] (\d{2}:\d{2})/;
  const newTimeMatch = taskPattern.exec(newLine);
  const newTime = newTimeMatch ? newTimeMatch[1] : "99:99";

  // Insert before the first task line with a later start time
  let insertIdx = -1;
  for (let i = sectionIdx + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) break; // next section
    const m = taskPattern.exec(lines[i]);
    if (m && m[1] > newTime) {
      insertIdx = i;
      break;
    }
  }

  if (insertIdx === -1) {
    // Find end of section (next heading or EOF)
    let endIdx = lines.length;
    for (let i = sectionIdx + 1; i < lines.length; i++) {
      if (/^## /.test(lines[i])) { endIdx = i; break; }
    }
    lines.splice(endIdx, 0, newLine);
  } else {
    lines.splice(insertIdx, 0, newLine);
  }

  await app.vault.modify(file, lines.join("\n"));
}
