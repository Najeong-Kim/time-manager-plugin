# Time Manager — Obsidian Plugin

> Daily Note에 작성한 태스크를 시각적 타임라인으로 정리하고, 카테고리별 완료 현황을 통해 하루 계획을 한눈에 파악하는 Obsidian 플러그인

**개발자:** Najeong Kim

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 시각적 타임라인 | 하루 태스크를 시간 축 위의 블록으로 시각화 |
| 시간 기록 | 태스크별 소요 시간 기록 및 카테고리 분류 |
| 카테고리 분류 | Work · Study · Personal · Hobby로 시간 분류 |
| 일별 통계 | 카테고리별 시간 막대 그래프 + 과부하 경고 |
| 에디터 자동완성 | `@` 입력 시 카테고리 자동완성 제안 |
| 카테고리 하이라이트 | 에디터에서 `@태그` 색상 강조 표시 |

---

## 설치

1. Obsidian 설정 → **커뮤니티 플러그인** → 안전 모드 해제
2. `time-manager` 폴더를 `.obsidian/plugins/` 에 복사
3. 커뮤니티 플러그인 목록에서 **Time Manager** 토글 활성화
4. 왼쪽 리본의 시계(🕐) 아이콘을 클릭해 타임라인 열기

---

## 마크다운 형식

```markdown
## Timeline

- [ ] 09:00 팀 스탠드업 @work 30m
- [x] 10:00 기능 개발 @work 2h
- [ ] 13:00 운동 @personal 1h
- [ ] 14:30 알고리즘 공부 @study 1h30m
- [ ] 23:00 end
```

### 인라인 필드

| 형식 | 의미 | 예시 |
|------|------|------|
| `@work` / `@personal` / `@study` / `@hobby` | 카테고리 | `@work` |
| 끝의 시간 표기 | 소요 시간 (단위 필수) | `30m` · `1h` · `1h30m` |
| `[cat:: X]` | 카테고리 (전체 형식) | `[cat:: work]` |
| `[dur:: N]` | 소요 시간 분 (전체 형식) | `[dur:: 60]` |

### 카테고리

| ID | 이름 | 색상 |
|----|------|------|
| `work` | Work | 파란색 (`#4a9eff`) |
| `study` | Study | 연두색 (`#8bc34a`) |
| `personal` | Personal | 노란색 (`#f9a825`) |
| `hobby` | Hobby | 보라색 (`#ce93d8`) |
| (없음) | Etc | 분홍색 (`#f48fb1`) |

---

## 사용법

### 타임라인 열기

- 리본 아이콘(🕐) 클릭
- 또는 커맨드 팔레트(`Cmd+P`) → `타임라인 열기`

### 태스크 추가

두 가지 방법으로 태스크를 추가할 수 있습니다.

#### 방법 1: 모달 사용

타임라인 상단의 `+ 태스크` 버튼을 클릭하면 모달이 열립니다.

| 입력 항목 | 설명 |
|-----------|------|
| 시작 시간 | HH:MM 형식 (현재 시각 기본값) |
| 태스크 이름 | 할 일 내용 |
| 예상 시간 | 분 단위 숫자 입력 (선택) |
| 카테고리 | 드롭다운 선택 (Work / Study / Personal / Hobby / Etc) |

입력 후 자동으로 Daily Note의 `## Timeline` 섹션에 시간 순으로 삽입됩니다.

#### 방법 2: 파일 직접 편집

Daily Note 파일을 열어 `## Timeline` 섹션에 아래 형식으로 직접 입력합니다.

```
- [ ] HH:MM 태스크 이름 @카테고리 소요시간
```

에디터에서 `@`를 입력하면 카테고리 자동완성이 제안됩니다. 태스크를 완료하면 `[ ]`를 `[x]`로 바꾸면 통계에 반영됩니다.

### 날짜 이동

타임라인 상단의 `◀` / `▶` 버튼으로 다른 날짜를 탐색할 수 있습니다.

---

## 설정

Obsidian 설정 → **Time Manager** 에서 변경 가능합니다.

| 설정 항목 | 기본값 | 설명 |
|-----------|--------|------|
| Daily Note 폴더 | `오늘의 일일 노트` | Daily Note가 저장된 폴더 (드롭다운으로 선택) |
| 섹션 제목 | `Timeline` | 파싱할 마크다운 `##` 섹션 이름 |
| 하루 작업 시간 한도 | `8시간` | 초과 시 타임라인 하단에 경고 표시 (4~16h 슬라이더) |

---

## 개발

```bash
# 개발 모드 (파일 변경 감지)
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run typecheck
```

### 파일 구조

```
src/
├── main.ts                  플러그인 진입점
├── settings.ts              설정 탭
├── types.ts                 공통 타입 정의
├── parser/
│   ├── DailyNoteParser.ts   마크다운 파일 읽기/쓰기
│   └── InlineFieldParser.ts @태그 · [key:: value] 파싱
├── editor/
│   ├── CategorySuggest.ts   @ 입력 시 카테고리 자동완성
│   └── CategoryHighlight.ts 에디터 @태그 색상 하이라이트
├── views/
│   └── TimelineView.ts      사이드바 타임라인 뷰
├── stats/
│   └── StatsCalculator.ts   일별 통계 계산
└── utils/
    ├── DateUtils.ts         날짜/시간 유틸리티
    └── ObsidianUtils.ts     Vault 파일 접근 헬퍼
```

---

## 라이선스

MIT License — © 2026 Najeong Kim
