# CLAUDE.md

## Git

- 커밋 메시지에 `Co-Authored-By` 트레일러 절대 금지
- 커밋은 명확한 한 줄 제목 + 필요 시 본문

## Build & deploy

- 빌드: `npm run build`
- 로컬 테스트: 빌드 후 아래 경로에 복사
  ```
  /Users/najeong/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins/time-manager/
  ```
  복사 파일: `dist/main.js`, `manifest.json`, `src/styles.css`
- 복사 후 Obsidian에서 플러그인 토글 OFF → ON으로 리로드

## Obsidian plugin review (ObsidianReviewBot)

자세한 내용은 `.claude/REVIEW_GUIDELINES.md` 참고.

- 미처리 async 호출에는 `void` 접두사 필수
- 이벤트 등록은 반드시 `this.registerEvent(...)` 사용
- UI 문자열은 sentence case (예: `"Open timeline"` ✓, `"Open Timeline"` ✗)
- CSS는 가능한 한 Obsidian CSS 변수 사용 (`var(--text-muted)` 등)
- DOM 조작은 Obsidian API 헬퍼 사용 (`createEl`, `createDiv` 등), `innerHTML` 금지

## Vault info

- Vault 경로: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents`
- Daily Notes 폴더: `Daily Notes/`
- 파일명 형식: `YYYY-MM-DD.md`
