# Slide + Workbench Transition

작성일: 2026-06-02  
상태: `ai-personal-assistant-after-hours` 우선 적용 기준

## 1. 변경 배경

2026-05-22 기준 문서는 좌우 2페이지형 학습 구조를 현재 결론으로 삼았다. 하지만 AI 비서 컨테이너를 출시 초기 메인 후킹 컨테이너로 삼으려면, 좌측 본문을 고정하고 우측에 작은 workspace를 붙이는 구조만으로는 부족하다.

특히 Telegram, Discord, Gmail, Google Calendar 연결 매뉴얼과 가상 업무 공간 실습은 한쪽 패널에 들어가면 답답해진다.

따라서 AI 비서 컨테이너부터 학습자 경험을 `slide + practice/workbench` 방식으로 전환한다.

## 2. 호환 원칙

내부 데이터 구조의 `pages`는 당장 제거하지 않는다.

이유:

- `lib/containerSpec.ts` 검증기가 `modules > lessons > pages`를 기준으로 동작한다.
- CMS가 페이지 단위 편집을 전제로 한다.
- `getInteractiveLesson`과 라우팅이 lesson/page 구조를 사용한다.

대신 사용자 경험의 명칭과 렌더링 방식을 바꾼다.

```text
기존 내부 필드: pages[]
새 사용자 경험: slides[]
```

즉, `page`는 저장 단위이고 `slide`는 학습 경험 단위다.

## 3. 신규 컨테이너 옵션

컨테이너 스펙에 선택적 필드를 추가한다.

```ts
learningExperience?: {
  mode: "split" | "slide";
  primaryHook?: boolean;
  practicePattern?: "slide-practice" | "side-workspace";
  description?: string;
}
```

의미:

- `split`: 기존 좌우 분할 플레이어
- `slide`: 한 화면에 본문과 자료/실습을 배치하고 슬라이드처럼 넘기는 플레이어
- `primaryHook`: 출시 초기 메인 유입 컨테이너 여부
- `practicePattern`: 설명 슬라이드와 실습 슬라이드를 번갈아 배치하는지 여부

## 4. Slide Mode 렌더링 원칙

`slide` 모드에서는 다음 규칙을 적용한다.

- 좌측 고정 본문을 사용하지 않는다.
- 한 슬라이드 안에서 제목, 본문, 참고 자료, 실습 블록을 세로 흐름으로 배치한다.
- workspace는 오른쪽 보조 영역이 아니라 슬라이드 안의 작업 영역이다.
- `code-canvas`가 있으면 큰 실습 화면으로 보여준다.
- 정적 매뉴얼, 체크리스트, 예시 목록도 슬라이드 안에서 충분히 큰 자료로 보여준다.

## 5. Slide 역할 분류

각 slide는 아래 중 하나의 역할을 갖는다고 간주한다. 현재 스키마에는 별도 필드가 없으므로 제목과 콘텐츠 설계로 구분한다.

| 역할 | 목적 | 예시 |
| --- | --- | --- |
| hook | 욕망과 문제를 잡는다 | "내가 원하는 것은 봇이 아니라 매일 정리되는 하루" |
| manual | 실제 설정 단계를 설명한다 | BotFather, Developer Portal, OAuth credential |
| practice | 가상 업무 공간에서 선택·입력·분류한다 | Gmail/Calendar 브리핑 설계 |
| check | 연결 상태와 실패 원인을 점검한다 | token, gateway, pairing, intent |
| result | 운영 규칙과 산출물을 남긴다 | AI 비서 운영 규칙 |

## 6. Workbench 확장 방향

초기에는 기존 `code-canvas`를 사용해 실습 화면을 만든다. 이후 다음 블록 타입을 별도 설계한다.

```ts
"workbench": {
  scenarioTitle: string;
  panes: Array<{
    id: string;
    title: string;
    kind: "inbox" | "calendar" | "chat" | "settings" | "briefing" | "document";
    items: unknown[];
  }>;
  tasks: string[];
}
```

단, `workbench` 도입은 AI 비서 컨테이너의 slide mode 검증 이후 진행한다.

## 7. AI 비서 컨테이너 우선 적용 범위

이번 전환에서 먼저 적용할 범위:

- `ContainerSpec.learningExperience` 타입 추가
- `getInteractiveLesson`이 `learningExperience`를 전달
- `InteractiveLessonPlayer`가 `mode: "slide"`를 감지해 slide layout 렌더링
- `ai-personal-assistant-after-hours/container.json`에 `learningExperience` 추가
- AI 비서 컨테이너 콘텐츠를 6모듈 흐름으로 재편

이번 전환에서 아직 하지 않는 것:

- 전체 컨테이너 일괄 전환
- `pages` 필드 제거
- CMS 전체 UI 개편
- 새 `workbench` 블록 타입 도입
- 외부 API 실제 호출 실습

## 8. 검증 기준

- 기존 컨테이너는 split mode로 계속 렌더링된다.
- AI 비서 컨테이너만 slide mode로 렌더링된다.
- JSON 검증이 통과한다.
- slide mode에서도 기존 workspace block이 렌더링된다.
- 학습자는 한 화면을 넘기는 느낌으로 읽고 실습한다.
