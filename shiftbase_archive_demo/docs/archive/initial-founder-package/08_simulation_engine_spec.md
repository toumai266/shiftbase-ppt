# 실습 엔진 설계

## 목적

실습 엔진은 Shiftbase의 핵심입니다. 강의 영상을 재생하는 대신, 사용자가 업무 상황을 웹 인터페이스로 조작하며 학습하도록 합니다.

## 엔진 구성

### Scenario Engine

업무 상황과 학습 목표를 정의합니다.

예시:

- 고객 문의가 여러 채널에서 들어옴
- 사용자는 문의를 분류해야 함
- AI가 추천한 답변을 검토해야 함

### Step Engine

실습 단계를 순서대로 진행합니다.

예시 단계:

1. 문의 확인
2. 유형 분류
3. 정보 보강
4. 답변 초안
5. 검토
6. 발송
7. 기록 저장

### UI Simulation Engine

가상 업무 화면을 렌더링합니다.

예시 UI:

- 문의함
- 예약 화면
- 문서 편집기
- 체크리스트
- 보고서 화면
- AI 분석 패널

### Action Engine

사용자 액션을 처리합니다.

액션 유형:

- click
- select
- type
- drag
- confirm
- download
- submit
- save

### Validation Engine

사용자의 액션이 적절한지 판단합니다.

검증 유형:

- 정답 일치
- 부분 일치
- 필수 항목 포함
- 금지 항목 제외
- 순서 검증
- 체크리스트 통과
- AI 평가 점수

### Hint Engine

사용자가 막혔을 때 힌트를 제공합니다.

힌트 유형:

- 개념 힌트
- 다음 행동 힌트
- 예시 보기
- 정답 근처 안내
- 실무 팁

### Scoring Engine

실습 결과를 점수화하거나 완료 여부를 산정합니다.

점수 요소:

- 정확도
- 완성도
- 검토 품질
- 소요 시간
- 힌트 사용량
- 체크리스트 통과 여부

### Persistence Layer

사용자 진행 상태를 저장합니다.

저장 대상:

- 현재 단계
- 입력값
- 선택값
- 완료한 단계
- 생성한 결과물
- 다운로드 이력
- 점수와 평가 결과

### AI Assist Layer

필요한 부분에 AI 기능을 제공합니다.

AI 기능:

- 분류 추천
- 초안 생성
- 품질 평가
- 누락 정보 감지
- 맞춤 힌트
- 결과 리포트 요약

## 실습 단계 데이터 모델

권장 필드:

```yaml
simulation_id: customer_inquiry_workflow
title: 고객 문의 워크플로우 실습실
category: 소규모 업체를 위한 AX
difficulty: 초급에서 중급
estimated_minutes: 45
steps:
  - step_id: inquiry_check
    order: 1
    title: 문의 확인
    step_type: inspect
    goal: 여러 채널의 문의를 확인한다
    required_actions:
      - select_inquiry
    completion_rule: selected_inquiry_count_greater_than_0
  - step_id: classify_inquiry
    order: 2
    title: 유형 분류
    step_type: classify
    goal: 문의 유형을 선택한다
    required_actions:
      - select_category
    validation_rule: category_partial_match
  - step_id: draft_response
    order: 3
    title: 답변 초안
    step_type: draft
    goal: 상황에 맞는 답변 초안을 만든다
    required_actions:
      - generate_or_write_draft
      - review_checklist
    validation_rule: response_quality_checklist
```

## 액션 데이터 모델

```yaml
action_id: select_category
action_type: select
label: 문의 유형 선택
allowed_values:
  - 예약
  - 가격 문의
  - 운영 안내
  - 불만
  - 기타
required: true
```

## 검증 규칙 예시

```yaml
validation_id: category_partial_match
validation_type: match
expected_values:
  - 예약
  - 가격 문의
passing_score: 80
partial_credit: true
feedback:
  success: 문의 유형을 잘 분류했습니다
  partial: 주요 유형은 맞았지만 보조 유형을 더 확인해보세요
  fail: 문의 내용에서 시간, 인원, 가격 정보를 다시 확인해보세요
```

## 결과 리포트 구조

```yaml
report:
  simulation_id: customer_inquiry_workflow
  user_id: current_user
  completed_steps: 6
  total_steps: 6
  score: 88
  strengths:
    - 문의 유형 분류가 정확함
    - 답변 톤이 친절함
  improvements:
    - 가격 조건 안내를 더 명확히 작성 필요
    - 다음 행동 안내가 부족함
  downloadable_assets:
    - 문의 유형 기준표
    - 답변 템플릿
    - 상담 기록 양식
```

## 상태 관리 전략

초기에는 Zustand로 실습 상태를 관리합니다.

관리할 상태:

- currentStep
- selectedInquiry
- selectedCategories
- draftResponse
- checklistState
- hintsOpened
- validationResults
- savedResultId

복잡한 분기형 실습이 늘어나면 XState를 도입합니다.

XState가 필요한 경우:

- 단계 간 조건부 분기
- 실패 후 재시도 경로
- 사용자 선택에 따라 다른 화면 표시
- 복수 정답과 부분 통과
- 중간 저장 후 재개

## 실습 엔진 구현 순서

1. 정적 시나리오 렌더링
2. 단계 이동 구현
3. 액션 입력 처리
4. 검증 결과 표시
5. 진도 저장
6. 결과 리포트 생성
7. AI 보조 기능 연결
8. 관리자용 시나리오 편집 도구 구축

## 실습 엔진 성공 기준

- 하나의 엔진으로 여러 업무 시나리오를 만들 수 있어야 함
- 실습 시나리오는 코드 수정 없이 데이터로 상당 부분 변경 가능해야 함
- 사용자 입력과 결과를 저장할 수 있어야 함
- AI 기능이 꺼져도 실습이 계속 진행되어야 함

## 핵심 판단

Shiftbase의 장기 경쟁력은 콘텐츠 수보다 실습 엔진의 재사용성입니다. 고객문의 모듈에서 만든 엔진은 예약, 리뷰, 보고서, 창업 문서, AI 보안 실습까지 확장 가능해야 합니다.
