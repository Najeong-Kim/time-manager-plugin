import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import type TimeManagerPlugin from "./main";

export class TimeManagerSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: TimeManagerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const folders = this.app.vault.getAllFolders()
      .map((f: TFolder) => f.path)
      .sort();

    new Setting(containerEl)
      .setName("Daily note folder")
      .setDesc("Folder where your daily notes are stored")
      .addDropdown((d) => {
        for (const folder of folders) {
          d.addOption(folder, folder || "(root)");
        }
        d.setValue(this.plugin.settings.dailyNoteFolder);
        d.onChange(async (v) => {
          this.plugin.settings.dailyNoteFolder = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Section heading")
      .setDesc("The ## section name in your daily note to parse as the timeline")
      .addText((t) =>
        t
          .setValue(this.plugin.settings.plannerLabel)
          .onChange(async (v) => {
            this.plugin.settings.plannerLabel = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Daily work hour limit")
      .setDesc("Show an overload warning when scheduled time exceeds this limit")
      .addSlider((s) =>
        s
          .setLimits(4, 16, 1)
          .setValue(this.plugin.settings.workingHoursLimit)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.workingHoursLimit = v;
            await this.plugin.saveSettings();
          })
      );
  }
}
