import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from "obsidian";
import { CategoryConfig, PluginSettings } from "../types";

export class CategorySuggest extends EditorSuggest<CategoryConfig> {
  constructor(app: App, private settings: PluginSettings) {
    super(app);
  }

  onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile | null): EditorSuggestTriggerInfo | null {
    const line = editor.getLine(cursor.line);
    if (!/^- \[[ x]\]/.test(line)) return null;

    const sub = line.substring(0, cursor.ch);
    const match = /@(\w*)$/.exec(sub);
    if (!match) return null;

    return {
      start: { line: cursor.line, ch: cursor.ch - match[0].length },
      end: cursor,
      query: match[1],
    };
  }

  getSuggestions(context: EditorSuggestContext): CategoryConfig[] {
    const q = context.query.toLowerCase();
    return this.settings.categories.filter(
      (c) => c.id.startsWith(q) || c.label.toLowerCase().startsWith(q)
    );
  }

  renderSuggestion(item: CategoryConfig, el: HTMLElement): void {
    el.addClass("tm-suggest-item");
    const dot = el.createDiv("tm-suggest-dot");
    dot.style.backgroundColor = item.color;
    el.createSpan({ text: item.label });
  }

  selectSuggestion(item: CategoryConfig): void {
    if (!this.context) return;
    const { editor, start, end } = this.context;
    editor.replaceRange(`@${item.id}`, start, end);
  }
}
