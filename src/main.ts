import { Plugin, WorkspaceLeaf } from "obsidian";
import { PluginSettings, DEFAULT_SETTINGS } from "./types";
import { TimelineView, TIME_MANAGER_VIEW_TYPE } from "./views/TimelineView";
import { TimeManagerSettingTab } from "./settings";
import { CategorySuggest } from "./editor/CategorySuggest";
import { categoryHighlightPlugin } from "./editor/CategoryHighlight";

export default class TimeManagerPlugin extends Plugin {
  settings!: PluginSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      TIME_MANAGER_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new TimelineView(leaf, this.settings)
    );

    this.addRibbonIcon("clock", "Open time manager timeline", () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open-timeline",
      name: "Open timeline",
      callback: () => { void this.activateView(); },
    });

    this.registerEditorSuggest(new CategorySuggest(this.app, this.settings));
    this.registerEditorExtension(categoryHighlightPlugin(this.settings.categories));

    this.addSettingTab(new TimeManagerSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.settings.categories = DEFAULT_SETTINGS.categories;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async activateView(): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(TIME_MANAGER_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf(true);
      await leaf.setViewState({ type: TIME_MANAGER_VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
}
