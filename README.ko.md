# Time Manager

[English](README.md) · **[한국어](README.ko.md)**

Obsidian 사이드바에서 Daily Note의 할 일을 타임라인으로 시각화하고, 카테고리별 시간을 추적하세요.

![Demo GIF](assets/demo.gif)

---

## 설치

1. **설정 → 커뮤니티 플러그인 → 탐색** 열기
2. **Time Manager** 검색 후 **설치** 클릭
3. **활성화** 후 리본의 🕐 시계 아이콘 클릭

---

## 빠른 시작

오늘의 Daily Note에 `## Timeline` 섹션을 추가하고 아래를 붙여넣으세요:

```markdown
## Timeline

- [ ] 09:00 모닝 루틴 @personal 30m
- [ ] 09:30 집중 업무 @work 2h
- [ ] 12:00 점심 @personal 1h
- [ ] 13:00 회의 @work 1h30m
- [ ] 23:00 end
```

오른쪽 타임라인이 즉시 렌더링됩니다. 노트를 수정하면 실시간으로 업데이트됩니다.

---

## 주요 기능

### 타임라인 뷰

할 일이 세로 축에 시간 블록으로 표시됩니다. 빨간 선은 현재 시각을 나타냅니다.

![타임라인 스크린샷](assets/screenshot-timeline.png)

- **◀ / ▶** 클릭으로 날짜 이동
- 파일 탐색기에서 Daily Note 클릭 시 해당 날짜로 자동 전환
- **+ task** 클릭으로 모달을 통해 할 일 추가

![할 일 추가 스크린샷](assets/screenshot-add-task.png)

### 일별 통계

하단 바 차트에서 카테고리별 예정 시간과 완료 시간을 확인할 수 있습니다.

![통계 스크린샷](assets/screenshot-stats.png)

### 에디터 하이라이트

입력하는 동안 카테고리 태그와 duration이 강조 표시됩니다. `@`를 입력하면 자동완성이 활성화됩니다.

![에디터 스크린샷](assets/screenshot-editor.png)

---

## 할 일 형식

```
- [ ] HH:MM 할 일 이름 @카테고리 duration
```

| 필드 | 옵션 | 예시 |
|------|------|------|
| 상태 | `[ ]` 예정 · `[x]` 완료 | `[x]` |
| 시간 | `HH:MM` | `09:30` |
| 카테고리 | `@work` · `@study` · `@personal` · `@hobby` | `@work` |
| Duration | `30m` · `1h` · `1h30m` | `1h30m` |

> Duration을 입력하면 통계가 정확해집니다. 생략 시 다음 할 일까지의 간격이 사용됩니다.

---

## 설정

**설정 → Time Manager**

| 설정 | 기본값 | 설명 |
|------|--------|------|
| Daily Note 폴더 | `Daily Notes` | Daily Note가 저장된 폴더 |
| 섹션 제목 | `Timeline` | 타임라인으로 파싱할 `##` 제목 |
| 일일 작업 시간 한도 | `8h` | 초과 경고 기준 (4–16h) |

---

## 라이선스

MIT License — © 2026 Najeong Kim
