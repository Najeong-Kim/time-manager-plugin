import { Category, Task } from "../types";

const FIELD_RE = /\[(\w[\w-]*):: *([^\]]*)\]/g;
const HASHTAG_CAT_RE = /@(work|personal|hobby|study)\b/i;
// 단위 필수: 60m | 1h | 1h30m
const TRAILING_TIME_RE = /\s+(?:(\d+)h(\d+)m|(\d+)h|(\d+)m)\s*$/;

export function parseInlineFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let m: RegExpExecArray | null;
  FIELD_RE.lastIndex = 0;
  while ((m = FIELD_RE.exec(text)) !== null) {
    fields[m[1]] = m[2].trim();
  }
  return fields;
}

export function serializeField(key: string, value: string | number): string {
  return `[${key}:: ${value}]`;
}

export function removeField(raw: string, key: string): string {
  return raw.replace(new RegExp(`\\[${key}:: *[^\\]]*\\]`, "g"), "").replace(/ {2,}/g, " ").trim();
}

export function upsertField(raw: string, key: string, value: string | number): string {
  const pattern = new RegExp(`\\[${key}:: *[^\\]]*\\]`);
  const field = serializeField(key, value);
  if (pattern.test(raw)) {
    return raw.replace(pattern, field);
  }
  return raw + " " + field;
}

export function parseTaskLine(raw: string, lineIndex: number): Task | null {
  const lineMatch = /^- \[( |x)\] (\d{2}:\d{2}) (.*)$/.exec(raw.trim());
  if (!lineMatch) return null;

  const completed = lineMatch[1] === "x";
  const startTime = lineMatch[2];
  const rest = lineMatch[3];

  const fields = parseInlineFields(rest);

  const hashMatch = HASHTAG_CAT_RE.exec(rest);
  const cat = (fields.cat ?? (hashMatch ? hashMatch[1].toLowerCase() : undefined)) as Category | undefined;

  const stripped = rest.replace(FIELD_RE, "").replace(HASHTAG_CAT_RE, "");
  const timeMatch = TRAILING_TIME_RE.exec(stripped);
  let dur = fields.dur ? parseInt(fields.dur, 10) : undefined;
  if (!dur && timeMatch) {
    if (timeMatch[1] && timeMatch[2]) dur = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10); // 1h30m
    else if (timeMatch[3])            dur = parseInt(timeMatch[3], 10) * 60;                              // 1h
    else if (timeMatch[4])            dur = parseInt(timeMatch[4], 10);                                   // 60m
  }

  const title = stripped.replace(TRAILING_TIME_RE, "").trim();

  return { line: lineIndex, raw, startTime, title, completed, dur, cat };
}
