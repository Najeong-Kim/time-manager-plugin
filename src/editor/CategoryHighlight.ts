import { ViewPlugin, DecorationSet, ViewUpdate, Decoration, EditorView } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { CategoryConfig } from "../types";

const CAT_RE = /@(work|personal|hobby|study)\b/g;
const TIME_RE = /^- \[[ x]\] (\d{2}:\d{2})/gm;
const DUR_RE = /^- \[[ x]\].*?\s(\d+h\d+m|\d+h|\d+m)[ \t]*$/gm;

const TIME_MARK = Decoration.mark({ attributes: { class: "tm-editor-time" } });
const DUR_MARK  = Decoration.mark({ attributes: { class: "tm-editor-dur" } });

function buildDecorations(view: EditorView, categories: CategoryConfig[]): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const text = view.state.doc.toString();
  const marks: { start: number; end: number; deco: Decoration }[] = [];

  TIME_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TIME_RE.exec(text)) !== null) {
    const start = m.index + m[0].length - m[1].length;
    marks.push({ start, end: start + m[1].length, deco: TIME_MARK });
  }

  DUR_RE.lastIndex = 0;
  while ((m = DUR_RE.exec(text)) !== null) {
    const start = m.index + m[0].length - m[1].length;
    marks.push({ start, end: start + m[1].length, deco: DUR_MARK });
  }

  CAT_RE.lastIndex = 0;
  while ((m = CAT_RE.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const catCfg = categories.find((c) => c.id === m![1]);
    if (catCfg) {
      marks.push({
        start,
        end,
        deco: Decoration.mark({ attributes: { style: `color: ${catCfg.color}; font-weight: 600;` } }),
      });
    }
  }

  marks.sort((a, b) => a.start - b.start);
  for (const { start, end, deco } of marks) {
    builder.add(start, end, deco);
  }

  return builder.finish();
}

export function categoryHighlightPlugin(categories: CategoryConfig[]) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, categories);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, categories);
        }
      }
    },
    { decorations: (v) => v.decorations }
  );
}
