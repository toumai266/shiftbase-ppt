# Page And Workspace Spec

이 문서는 스펙 기반 컨테이너 저작을 위한 데이터 모델 초안을 정의합니다.

## 설계 원칙

1. 페이지는 고정 타입을 갖지 않습니다.
2. 모든 페이지는 좌측 서술 영역과 우측 워크스페이스를 갖습니다.
3. 우측 워크스페이스는 표준 블록을 자유롭게 조합합니다.
4. 페이지 간 상태를 공유할 수 있어야 합니다.
5. 스펙은 콘텐츠 저작자가 읽고 수정할 수 있을 만큼 명확해야 합니다.
6. 렌더러는 허용된 블록 타입만 처리합니다.

## 최상위 구조

```yaml
id: ai-new-hire-survival
slug: ai-new-hire-survival
title: 신입사원을 위한 AI 업무 생존법
summary: 애매한 업무 지시를 실행계획, 확인 질문, 보고 문장으로 바꾸는 입문 컨테이너
status: draft
access: free
hub: AI 업무 활용
tracks:
  - 신입사원
  - AI 입문
audience:
  - IT와 AI가 익숙하지 않은 신입사원
difficulty: beginner
duration: 60분
outcomes:
  - 애매한 지시를 할 일 목록으로 바꿀 수 있다.
  - 상사에게 확인할 질문을 정리할 수 있다.
  - 진행상황을 보고 가능한 문장으로 바꿀 수 있다.
outputs:
  - 업무 착수 체크리스트
  - 상사 확인 질문 리스트
  - 진행 보고 메시지
modules: []
```

## ContainerSpec

컨테이너 스펙은 카드 노출, 상세 페이지, 학습 플레이어 렌더링에 필요한 정보를 모두 포함합니다.

필수 필드:

- `id`
- `slug`
- `title`
- `summary`
- `status`
- `access`
- `hub`
- `tracks`
- `audience`
- `difficulty`
- `duration`
- `outcomes`
- `outputs`
- `modules`

선택 필드:

- `prerequisites`
- `resources`
- `coverImage`
- `tags`
- `cta`

## ModuleSpec

```yaml
id: module-01
title: 애매한 지시를 업무로 바꾸기
summary: 상사의 애매한 지시를 할 일, 기한, 확인 질문으로 나눕니다.
lessons:
  - id: lesson-01
    title: 지시를 바로 실행하지 말고 구조화하기
    pages: []
```

## LessonSpec

레슨은 페이지 묶음입니다.

```yaml
id: lesson-01
title: 지시를 바로 실행하지 말고 구조화하기
estimatedTime: 12분
pages:
  - id: page-01
    title: 애매한 지시는 왜 어려운가
```

## PageSpec

페이지는 좌측 서술과 우측 워크스페이스를 갖습니다.

```yaml
id: page-01
title: 애매한 지시는 왜 어려운가
left:
  eyebrow: 상황 이해
  title: 상사의 지시를 바로 실행하면 실수가 늘어납니다
  paragraphs:
    - 신입사원이 가장 자주 막히는 순간은 무엇을 어디까지 해야 하는지 모르는 상태입니다.
    - AI는 이 애매한 지시를 실행 가능한 항목으로 나누는 데 도움을 줄 수 있습니다.
  checkpoints:
    - 지시의 목적이 보이는가?
    - 기한과 결과물 형식이 보이는가?
    - 추가로 확인할 질문이 보이는가?
  footnote: 이 페이지에서는 지시를 실행하기 전에 구조화하는 습관을 익힙니다.
workspace:
  layout: stack
  blocks: []
```

## Left Pane

좌측 서술 영역은 학습자가 읽고 판단할 기준을 제공합니다.

필드:

- `eyebrow`: 작은 구분 라벨
- `title`: 페이지 제목
- `paragraphs`: 본문 문단
- `checkpoints`: 읽으며 확인할 항목
- `footnote`: 보조 안내

## Workspace

워크스페이스는 우측 조작 영역입니다.

```yaml
workspace:
  layout: stack
  blocks:
    - type: image-viewer
      id: instruction-map
      props: {}
    - type: quiz
      id: instruction-risk-quiz
      props: {}
```

지원할 레이아웃 후보:

- `stack`: 세로 배치
- `grid`: 카드형 격자
- `split`: 우측 안에서 2열 분할
- `focus`: 하나의 블록을 크게 표시

## Workspace Block

워크스페이스 블록은 `type`, `id`, `props`를 기본으로 갖습니다.

```yaml
type: checklist
id: instruction-checklist
props:
  title: 지시에서 확인할 항목
  items:
    - 목적
    - 기한
    - 결과물 형식
    - 공유 대상
```

초기 블록 타입 후보:

- `image-viewer`
- `diagram`
- `quiz`
- `card-sort`
- `block-board`
- `checklist`
- `text-input`
- `prompt-builder`
- `before-after`
- `table`
- `result-card`
- `state-summary`

## State Binding

페이지 간 연결을 위해 상태 키를 사용합니다.

예시:

```yaml
workspace:
  blocks:
    - type: block-board
      id: work-timeline-board
      writes:
        key: workTimeline
      props:
        title: 내 하루 업무 타임라인
```

다른 페이지에서 같은 상태를 읽습니다.

```yaml
workspace:
  blocks:
    - type: state-summary
      id: work-timeline-summary
      reads:
        key: workTimeline
      props:
        title: 내가 배치한 업무 흐름
```

상태는 단순 저장값이 아니라 학습 흐름의 연결 장치입니다.

## Example Page

```yaml
id: page-03
title: 애매한 지시를 실행계획으로 바꾸기
left:
  eyebrow: 실습
  title: 대충 받은 지시를 할 일 목록으로 나눕니다
  paragraphs:
    - 아래 예시 지시를 보고 실제로 무엇을 해야 하는지 분해해봅니다.
    - 먼저 AI에게 줄 수 있는 상황 설명을 만들고, 확인 질문을 뽑습니다.
  checkpoints:
    - 할 일과 질문을 구분했는가?
    - 기한과 결과물 형식을 확인했는가?
    - 상사에게 물어볼 표현이 무례하지 않은가?
  footnote: 완벽한 계획보다 시작 가능한 계획을 만드는 것이 목표입니다.
workspace:
  layout: stack
  blocks:
    - type: text-input
      id: raw-instruction
      writes:
        key: rawInstruction
      props:
        label: 받은 지시를 그대로 적어보세요
        placeholder: 다음 주 거래처 미팅 준비하라고 하셨고...
    - type: prompt-builder
      id: instruction-prompt-builder
      reads:
        key: rawInstruction
      writes:
        key: instructionPrompt
      props:
        title: AI에게 보낼 요청 만들기
        template:
          - 상황
          - 목표
          - 원하는 결과 형식
          - 확인 질문
    - type: result-card
      id: instruction-output
      reads:
        key: instructionPrompt
      props:
        title: 이번 페이지의 산출물
```

## Validation Rules

스펙 검증은 최소한 다음을 확인해야 합니다.

- 모든 `id`는 컨테이너 안에서 고유해야 합니다.
- `slug`는 URL에 사용할 수 있는 형태여야 합니다.
- 모든 페이지는 `left`와 `workspace`를 가져야 합니다.
- 모든 워크스페이스 블록은 등록된 `type`만 사용해야 합니다.
- `reads.key`는 이전 페이지 또는 동일 페이지에서 생성 가능한 상태여야 합니다.
- `outputs`에 선언된 산출물은 최소 하나 이상의 페이지에서 생성 또는 요약되어야 합니다.

## Open Questions

- 스펙 파일 형식은 YAML, JSON, MDX 중 무엇으로 시작할 것인가?
- 좌측 본문에 제한된 Markdown을 허용할 것인가?
- 학습자 상태를 브라우저 로컬 상태로 둘 것인가, 계정 기반으로 저장할 것인가?
- 블록별 props 검증은 Zod 같은 런타임 스키마로 할 것인가?
- 파일 기반 스펙의 프리뷰 도구를 언제 만들 것인가?
