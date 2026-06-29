# 샘플 실습 시나리오

## 시나리오명

고객 문의 워크플로우 실습실

## 설명

소규모 업체에 들어온 고객 문의를 확인하고, 유형을 분류하고, AI 답변 초안을 검토한 뒤 상담 기록으로 저장하는 실습입니다.

## 시나리오 데이터 예시

```yaml
simulation_id: customer_inquiry_workflow
category: 소규모 업체를 위한 AX
course: 고객문의 자동응답과 상담 분류
title: 고객 문의 워크플로우 실습실
subtitle: 문의 접수부터 답변 초안, 검토와 발송까지 직접 따라하는 시뮬레이션 실습
difficulty: 초급에서 중급
estimated_minutes: 45
progress_goal: 100

business_context:
  business_type: 미용실
  team_size: 3
  channels:
    - 카카오톡
    - 인스타그램 DM
    - 홈페이지 문의
    - 전화 메모

steps:
  - step_key: check_inquiry
    order: 1
    title: 문의 확인
    instruction: 여러 채널에서 들어온 문의를 확인하고 하나를 선택하세요
    step_type: inspect
    required_actions:
      - select_inquiry
    completion_condition: selected_inquiry_exists
    hint: 새 문의 배지가 있는 항목부터 확인해보세요

  - step_key: classify_type
    order: 2
    title: 유형 분류
    instruction: 선택한 문의의 유형을 분류하세요
    step_type: classify
    options:
      - 예약
      - 가격 문의
      - 운영 안내
      - 불만
      - 기타
    validation_rule: category_match
    hint: 날짜와 인원 정보가 있으면 예약 문의일 가능성이 높습니다

  - step_key: enrich_info
    order: 3
    title: 정보 보강
    instruction: 답변에 필요한 정보를 확인하세요
    step_type: select_required_info
    options:
      - 날짜
      - 인원
      - 서비스 종류
      - 가격표
      - 방문 경로
    validation_rule: required_info_match
    hint: 답변을 확정하려면 고객이 원하는 서비스 종류가 필요할 수 있습니다

  - step_key: draft_response
    order: 4
    title: 답변 초안
    instruction: 추천 답변 초안을 검토하고 수정하세요
    step_type: draft
    ai_assist: true
    validation_rule: response_quality_checklist
    hint: 가격을 단정하지 말고 확인이 필요한 부분을 자연스럽게 안내하세요

  - step_key: review_response
    order: 5
    title: 검토
    instruction: 발송 전 체크리스트를 확인하세요
    step_type: checklist
    checklist:
      - 친절한 톤
      - 핵심 정보 포함
      - 민감정보 제외
      - 다음 행동 제시
    validation_rule: all_required_checks_passed
    hint: 고객이 다음에 무엇을 하면 되는지 안내했는지 확인하세요

  - step_key: save_record
    order: 6
    title: 기록 저장
    instruction: 상담 기록을 저장하고 결과 리포트를 확인하세요
    step_type: report
    required_actions:
      - save_result
    completion_condition: result_saved
```

## 샘플 문의 데이터

```yaml
inquiries:
  - inquiry_id: inquiry_001
    channel: 카카오톡
    received_at: 2025-05-14 14:34
    message: 안녕하세요. 이번 주 토요일 2시에 2명 예약 가능한가요? 가격도 궁금합니다.
    expected_categories:
      - 예약
      - 가격 문의
    priority: 보통
    required_info:
      - 날짜
      - 인원
      - 서비스 종류
    sample_draft: 안녕하세요. 문의 주셔서 감사합니다. 이번 주 토요일 2시 2명 예약 가능 여부를 확인해드릴게요. 원하시는 서비스 종류에 따라 가격이 달라질 수 있어 메뉴와 예상 금액을 함께 안내드리겠습니다.

  - inquiry_id: inquiry_002
    channel: 인스타그램 DM
    received_at: 2025-05-14 13:48
    message: 펌 시술 가격이 어떻게 되나요? 그리고 예약은 어떻게 하나요?
    expected_categories:
      - 가격 문의
      - 예약
    priority: 보통
    required_info:
      - 서비스 종류
      - 희망 일정
    sample_draft: 안녕하세요. 펌 시술은 종류와 모발 상태에 따라 가격이 달라질 수 있습니다. 원하시는 스타일과 희망 일정을 알려주시면 예약 가능 시간과 예상 금액을 안내드리겠습니다.

  - inquiry_id: inquiry_003
    channel: 홈페이지 문의
    received_at: 2025-05-14 11:22
    message: 주차는 가능한가요? 주차 시간 제한이 있나요?
    expected_categories:
      - 운영 안내
    priority: 낮음
    required_info:
      - 주차 가능 여부
      - 주차 시간
    sample_draft: 안녕하세요. 주차 가능 여부와 이용 시간을 안내드리겠습니다. 방문 예정 시간을 알려주시면 더 정확히 확인해드릴 수 있습니다.
```

## 체크리스트 예시

```yaml
response_checklist:
  - key: friendly_tone
    label: 친절한 톤
    required: true
  - key: core_info
    label: 핵심 정보 포함
    required: true
  - key: no_sensitive_info
    label: 민감정보 제외
    required: true
  - key: next_action
    label: 다음 행동 제시
    required: true
  - key: no_overclaim
    label: 확정되지 않은 내용 단정 금지
    required: true
```

## 결과 리포트 예시

```yaml
result_report:
  title: 고객문의 자동응답 실습 결과
  score: 88
  completed_steps:
    - 문의 확인
    - 유형 분류
    - 정보 보강
    - 답변 초안
    - 검토
    - 기록 저장
  strengths:
    - 문의 유형을 정확히 분류했습니다
    - 친절한 답변 톤을 유지했습니다
  improvements:
    - 가격 안내 기준을 더 명확히 작성하면 좋습니다
    - 서비스 종류 확인 문구를 추가하면 좋습니다
  recommended_assets:
    - 문의 유형 기준표
    - 예약 확인 메시지 템플릿
    - 상담 기록 양식
```
