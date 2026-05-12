import { App, ItemView, Modal, Notice, Setting, TFile, WorkspaceLeaf } from "obsidian";
import { Task, PluginSettings, Category } from "../types";
import { parseTasks, appendTask } from "../parser/DailyNoteParser";
import { calcDayStats } from "../stats/StatsCalculator";
import {
  formatDayLabel,
  formatDuration,
  addDays,
  parseMinutes,
  currentMinutes,
} from "../utils/DateUtils";
import { getDailyNoteFile, getOrCreateDailyNoteFile } from "../utils/ObsidianUtils";

export const TIME_MANAGER_VIEW_TYPE = "time-manager-timeline";

const PX_PER_MIN = 2;
const DAY_START_HOUR = 7;

export class TimelineView extends ItemView {
  private currentDate: Date;
  private tasks: Task[] = [];
  private currentFile: TFile | null = null;
  private nowLineInterval: number | null = null;

  constructor(leaf: WorkspaceLeaf, private settings: PluginSettings) {
    super(leaf);
    this.currentDate = new Date();
  }

  getViewType(): string { return TIME_MANAGER_VIEW_TYPE; }
  getDisplayText(): string { return "Time manager"; }
  getIcon(): string { return "clock"; }

  async onOpen(): Promise<void> {
    this.containerEl.addClass("time-manager-view");
    await this.render();

    this.nowLineInterval = window.setInterval(() => this.updateNowLine(), 60 * 1000);

    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file === this.currentFile) void this.reload();
      })
    );

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf === this.leaf) void this.render();
      })
    );
  }

  async onClose(): Promise<void> {
    if (this.nowLineInterval !== null) window.clearInterval(this.nowLineInterval);
  }

  private async reload(): Promise<void> {
    if (!this.currentFile) return;
    const content = await this.app.vault.read(this.currentFile);
    this.tasks = parseTasks(content, this.settings.plannerLabel);
    this.renderTaskBlocks();
    this.renderStats();
  }

  private async render(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();

    this.currentFile = getDailyNoteFile(
      this.app,
      this.currentDate,
      this.settings.dailyNoteFolder
    );

    if (this.currentFile) {
      const content = await this.app.vault.read(this.currentFile);
      this.tasks = parseTasks(content, this.settings.plannerLabel);
    } else {
      this.tasks = [];
    }

    this.renderHeader();
    this.contentEl.createDiv("tm-scroll-area", (el) => {
      this.renderTimeline(el);
    });
    this.renderStats();
  }

  private renderHeader(): void {
    const { contentEl } = this;
    const header = contentEl.createDiv("tm-header");

    const nav = header.createDiv("tm-nav");
    const prevBtn = nav.createEl("button", { text: "◀" });
    prevBtn.addEventListener("click", () => { void this.navigate(-1); });

    nav.createEl("span", { text: formatDayLabel(this.currentDate), cls: "tm-date-label" });

    const nextBtn = nav.createEl("button", { text: "▶" });
    nextBtn.addEventListener("click", () => { void this.navigate(1); });

    const addBtn = header.createEl("button", { text: "+ task", cls: "tm-add-btn" });
    addBtn.addEventListener("click", () => this.openAddTaskModal());
  }

  private renderTimeline(container: HTMLElement): void {
    const wrapper = container.createDiv("tm-timeline-wrapper");

    if (!this.currentFile && this.tasks.length === 0) {
      wrapper.createEl("p", { text: "No note found for this date.", cls: "tm-empty" });
      return;
    }

    const timeAxis = wrapper.createDiv("tm-time-axis");
    const taskLayer = wrapper.createDiv("tm-task-layer");
    taskLayer.id = "tm-task-layer";

    const dayStartMin = DAY_START_HOUR * 60;
    const lastTask = this.tasks[this.tasks.length - 1];
    const endMin = lastTask ? parseMinutes(lastTask.startTime) + 60 : 24 * 60;
    const totalMin = endMin - dayStartMin;
    const totalPx = totalMin * PX_PER_MIN;

    wrapper.style.height = `${totalPx + 40}px`;
    timeAxis.style.height = `${totalPx}px`;
    taskLayer.style.height = `${totalPx}px`;

    for (let h = DAY_START_HOUR; h <= Math.ceil(endMin / 60); h++) {
      const top = (h * 60 - dayStartMin) * PX_PER_MIN;
      const label = timeAxis.createDiv("tm-hour-label");
      label.style.top = `${top}px`;
      label.setText(`${String(h).padStart(2, "0")}:00`);
      const line = timeAxis.createDiv("tm-hour-line");
      line.style.top = `${top}px`;
    }

    this.renderNowLine(taskLayer, dayStartMin);
    this.renderTaskBlocks();
  }

  private renderTaskBlocks(): void {
    const taskLayer = this.contentEl.querySelector<HTMLElement>("#tm-task-layer");
    if (!taskLayer) return;

    taskLayer.querySelectorAll(".tm-task-block").forEach((el) => el.remove());

    const dayStartMin = DAY_START_HOUR * 60;

    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i];
      if (!task.title || task.title.toLowerCase() === "end") continue;

      const startMin = parseMinutes(task.startTime);
      let durMin = task.dur ?? 30;
      if (i + 1 < this.tasks.length) {
        const nextMin = parseMinutes(this.tasks[i + 1].startTime);
        const gap = nextMin - startMin;
        if (!task.dur && gap > 0) durMin = gap;
      }

      const top = (startMin - dayStartMin) * PX_PER_MIN;
      const height = Math.max(durMin * PX_PER_MIN, 28);

      const block = taskLayer.createDiv("tm-task-block");
      block.style.top = `${top}px`;
      block.style.height = `${height}px`;

      const catCfg = this.settings.categories.find((c) => c.id === task.cat);
      block.style.borderLeftColor = catCfg?.color ?? "#f48fb1";

      if (task.completed) block.addClass("tm-task-completed");

      const titleRow = block.createDiv("tm-task-title-row");
      titleRow.createEl("span", { text: task.startTime, cls: "tm-task-time" });
      titleRow.createEl("span", { text: task.title, cls: "tm-task-name" });

      const metaRow = block.createDiv("tm-task-meta");
      if (task.cat) {
        const catCfg = this.settings.categories.find((c) => c.id === task.cat);
        metaRow.createEl("span", { text: catCfg?.label ?? task.cat, cls: "tm-task-cat" });
      }

      if (task.dur) {
        metaRow.createEl("span", { text: formatDuration(task.dur), cls: "tm-task-time-info" });
      }
    }
  }

  private renderNowLine(container: HTMLElement, dayStartMin: number): void {
    const nowMin = currentMinutes();
    if (nowMin < dayStartMin) return;

    const existing = container.querySelector(".tm-now-line");
    if (existing) {
      (existing as HTMLElement).style.top = `${(nowMin - dayStartMin) * PX_PER_MIN}px`;
      return;
    }

    const line = container.createDiv("tm-now-line");
    line.style.top = `${(nowMin - dayStartMin) * PX_PER_MIN}px`;
  }

  private updateNowLine(): void {
    const taskLayer = this.contentEl.querySelector<HTMLElement>("#tm-task-layer");
    if (!taskLayer) return;
    this.renderNowLine(taskLayer, DAY_START_HOUR * 60);
  }

  private renderStats(): void {
    const existing = this.contentEl.querySelector(".tm-stats");
    if (existing) existing.remove();

    const stats = calcDayStats(this.tasks, this.settings.categories, this.settings.workingHoursLimit);
    const statsEl = this.contentEl.createDiv("tm-stats");

    if (stats.overScheduled) {
      statsEl.createEl("div", {
        text: `⚠ ${formatDuration(stats.totalDur)} scheduled (exceeds ${this.settings.workingHoursLimit}h limit)`,
        cls: "tm-over-warning",
      });
    }

    if (stats.categories.length === 0) return;

    const maxMinutes = Math.max(...stats.categories.map((c) => c.durMinutes));

    const barChart = statsEl.createDiv("tm-bar-chart");
    for (const cat of stats.categories) {
      const row = barChart.createDiv("tm-bar-row");

      const dot = row.createDiv("tm-cat-dot");
      dot.style.backgroundColor = cat.color;
      row.createEl("span", { text: cat.label, cls: "tm-bar-label" });

      const barWrap = row.createDiv("tm-bar-wrap");

      const barDur = barWrap.createDiv("tm-bar-fill tm-bar-dur");
      barDur.style.width = `${(cat.durMinutes / maxMinutes) * 100}%`;
      barDur.style.backgroundColor = cat.color;
      barDur.setCssProps({ opacity: "0.3" });

      const barDone = barWrap.createDiv("tm-bar-fill tm-bar-done");
      barDone.style.width = `${cat.durMinutes > 0 ? (cat.doneMinutes / cat.durMinutes) * (cat.durMinutes / maxMinutes) * 100 : 0}%`;
      barDone.style.backgroundColor = cat.color;

      const valueWrap = row.createDiv("tm-bar-value-wrap");
      valueWrap.createEl("span", { text: formatDuration(cat.doneMinutes), cls: "tm-bar-value tm-bar-value-done" });
      valueWrap.createEl("span", { text: ` / ${formatDuration(cat.durMinutes)}`, cls: "tm-bar-value tm-bar-value-dur" });
    }
  }

  private async navigate(delta: number): Promise<void> {
    this.currentDate = addDays(this.currentDate, delta);
    await this.render();
  }

  private openAddTaskModal(): void {
    new AddTaskModal(this.app, this.settings, async (line) => {
      const file = await getOrCreateDailyNoteFile(
        this.app,
        this.currentDate,
        this.settings.dailyNoteFolder,
        this.settings.plannerLabel
      );
      this.currentFile = file;
      await appendTask(this.app, file, line, this.settings.plannerLabel);
      await this.reload();
    }).open();
  }
}

class AddTaskModal extends Modal {
  private startTime = "";
  private title = "";
  private est = "";
  private cat: Category | "none" = "work";

  constructor(
    app: App,
    private settings: PluginSettings,
    private onSubmit: (line: string) => Promise<void>
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Add task" });

    new Setting(contentEl).setName("Start time (HH:MM)").addText((t) => {
      const now = new Date();
      t.setValue(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
      this.startTime = t.getValue();
      t.onChange((v) => (this.startTime = v));
    });

    new Setting(contentEl).setName("Task name").addText((t) => {
      t.onChange((v) => (this.title = v));
      t.inputEl.focus();
    });

    new Setting(contentEl).setName("Duration (minutes)").addText((t) => {
      t.setPlaceholder("30");
      t.onChange((v) => (this.est = v));
    });

    new Setting(contentEl).setName("Category").addDropdown((d) => {
      for (const c of this.settings.categories) {
        d.addOption(c.id, c.label);
      }
      d.addOption("none", "Etc");
      d.setValue("work");
      d.onChange((v) => (this.cat = v as Category | "none"));
    });

    new Setting(contentEl).addButton((b) => {
      b.setButtonText("Add").setCta().onClick(async () => {
        if (!this.startTime || !this.title) {
          new Notice("Start time and task name are required.");
          return;
        }
        let line = `- [ ] ${this.startTime} ${this.title}`;
        if (this.cat !== "none") line += ` @${this.cat}`;
        if (this.est) line += ` ${parseInt(this.est, 10)}m`;
        await this.onSubmit(line);
        this.close();
      });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
