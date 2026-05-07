import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import type TimeManagerPlugin from "./main";

export class TimeManagerSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: TimeManagerPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Time Manager 설정" });

    const folders = this.app.vault.getAllFolders()
      .map((f: TFolder) => f.path)
      .sort();

    new Setting(containerEl)
      .setName("Daily Note 폴더")
      .setDesc("Daily Note가 저장되는 폴더 경로")
      .addDropdown((d) => {
        for (const folder of folders) {
          d.addOption(folder, folder || "(루트)");
        }
        d.setValue(this.plugin.settings.dailyNoteFolder);
        d.onChange(async (v) => {
          this.plugin.settings.dailyNoteFolder = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("섹션 제목")
      .setDesc("타임라인으로 파싱할 마크다운 ## 섹션 이름")
      .addText((t) =>
        t
          .setValue(this.plugin.settings.plannerLabel)
          .onChange(async (v) => {
            this.plugin.settings.plannerLabel = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("하루 작업 시간 한도 (시간)")
      .setDesc("이 시간 초과 시 과부하 경고 표시")
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
