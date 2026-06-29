# 데이터베이스 스키마 초안

## 설계 원칙

Shiftbase는 일반 강의 플랫폼보다 실습 상태와 결과 저장이 중요합니다. 따라서 course, lesson만으로는 부족합니다.

핵심 엔티티:

- 사용자
- 강의 또는 모듈
- 실습 시나리오
- 실습 단계
- 사용자 진행 상태
- 사용자 제출 결과
- 템플릿 자료
- 수강권
- 조직

## profiles

사용자 프로필입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | auth user id |
| email | text | 이메일 |
| name | text | 이름 |
| role | text | guest, free_user, paid_user, org_user, org_admin, admin |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

## categories

카테고리입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 카테고리 id |
| slug | text | URL 식별자 |
| title | text | 카테고리명 |
| description | text | 설명 |
| target_audience | text | 대상 |
| order_index | int | 정렬 순서 |
| is_published | boolean | 공개 여부 |
| created_at | timestamp | 생성일 |

## courses

학습 모듈 또는 과정입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 과정 id |
| category_id | uuid | 카테고리 id |
| slug | text | URL 식별자 |
| title | text | 과정명 |
| subtitle | text | 부제 |
| description | text | 설명 |
| difficulty | text | 입문, 초급, 중급, 고급 |
| estimated_minutes | int | 예상 학습 시간 |
| status | text | draft, published, archived |
| is_free | boolean | 무료 여부 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

## course_modules

과정 내부 단원입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 단원 id |
| course_id | uuid | 과정 id |
| title | text | 단원명 |
| description | text | 설명 |
| order_index | int | 정렬 순서 |
| estimated_minutes | int | 예상 시간 |

## lessons

개념 설명 또는 짧은 학습 단위입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 레슨 id |
| module_id | uuid | 단원 id |
| title | text | 제목 |
| content_mdx | text | MDX 내용 |
| lesson_type | text | reading, concept, quiz, practice_intro |
| order_index | int | 정렬 순서 |
| estimated_minutes | int | 예상 시간 |

## simulations

실습 시나리오입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 실습 id |
| course_id | uuid | 과정 id |
| module_id | uuid | 단원 id |
| slug | text | URL 식별자 |
| title | text | 실습명 |
| description | text | 설명 |
| difficulty | text | 난이도 |
| estimated_minutes | int | 예상 시간 |
| scenario_data | jsonb | 시나리오 구조 데이터 |
| status | text | draft, published |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

## simulation_steps

실습 단계입니다. 초기에는 scenario_data 안에 포함해도 되지만, 관리자 도구를 만들려면 별도 테이블이 유리합니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 단계 id |
| simulation_id | uuid | 실습 id |
| step_key | text | 단계 키 |
| title | text | 단계 제목 |
| step_type | text | inspect, classify, draft, checklist, report |
| order_index | int | 정렬 순서 |
| instruction | text | 사용자 안내 |
| config | jsonb | UI와 검증 설정 |
| created_at | timestamp | 생성일 |

## enrollments

수강 등록입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 등록 id |
| user_id | uuid | 사용자 id |
| course_id | uuid | 과정 id |
| access_type | text | free, paid, org |
| status | text | active, completed, cancelled |
| started_at | timestamp | 시작일 |
| completed_at | timestamp | 완료일 |

## progress_records

사용자 진행 상태입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 진행 id |
| user_id | uuid | 사용자 id |
| course_id | uuid | 과정 id |
| module_id | uuid | 단원 id |
| lesson_id | uuid | 레슨 id |
| simulation_id | uuid | 실습 id |
| current_step_key | text | 현재 단계 |
| progress_percent | int | 진행률 |
| status | text | not_started, in_progress, completed |
| last_state | jsonb | 마지막 실습 상태 |
| updated_at | timestamp | 수정일 |

## practice_submissions

실습 제출 결과입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 제출 id |
| user_id | uuid | 사용자 id |
| simulation_id | uuid | 실습 id |
| step_key | text | 단계 키 |
| submission_data | jsonb | 제출 내용 |
| validation_result | jsonb | 검증 결과 |
| score | int | 점수 |
| created_at | timestamp | 제출일 |

## result_reports

실습 결과 리포트입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 리포트 id |
| user_id | uuid | 사용자 id |
| simulation_id | uuid | 실습 id |
| title | text | 리포트 제목 |
| summary | text | 요약 |
| report_data | jsonb | 상세 데이터 |
| created_at | timestamp | 생성일 |

## template_assets

자료와 템플릿입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 자료 id |
| course_id | uuid | 과정 id |
| simulation_id | uuid | 실습 id |
| title | text | 자료명 |
| asset_type | text | pdf, xlsx, doc, zip, md |
| storage_path | text | 저장 경로 |
| is_free | boolean | 무료 여부 |
| created_at | timestamp | 생성일 |

## downloads

다운로드 이력입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 다운로드 id |
| user_id | uuid | 사용자 id |
| asset_id | uuid | 자료 id |
| downloaded_at | timestamp | 다운로드 시각 |

## organizations

기업교육 조직입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 조직 id |
| name | text | 조직명 |
| plan | text | pilot, team, enterprise |
| created_at | timestamp | 생성일 |

## organization_members

조직 구성원입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 구성원 id |
| organization_id | uuid | 조직 id |
| user_id | uuid | 사용자 id |
| org_role | text | member, manager, admin |
| created_at | timestamp | 생성일 |

## payments

결제 내역입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 결제 id |
| user_id | uuid | 사용자 id |
| course_id | uuid | 과정 id |
| order_id | text | 주문 id |
| amount | int | 금액 |
| status | text | pending, paid, failed, refunded |
| provider | text | toss |
| paid_at | timestamp | 결제 완료일 |
| created_at | timestamp | 생성일 |

## certificates

수료증 또는 수료 배지입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 수료 id |
| user_id | uuid | 사용자 id |
| course_id | uuid | 과정 id |
| certificate_type | text | badge, certificate |
| issued_at | timestamp | 발급일 |
| metadata | jsonb | 추가 정보 |

## ai_logs

AI 호출 로그입니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid | 로그 id |
| user_id | uuid | 사용자 id |
| simulation_id | uuid | 실습 id |
| action_type | text | classify, draft, evaluate, hint |
| model_name | text | 모델명 |
| input_summary | text | 입력 요약 |
| output_summary | text | 출력 요약 |
| token_count | int | 토큰 수 |
| cost_estimate | numeric | 예상 비용 |
| created_at | timestamp | 생성일 |

## RLS 원칙

- 사용자는 자신의 progress_records만 읽고 수정 가능
- 사용자는 자신의 practice_submissions만 읽고 수정 가능
- 사용자는 자신의 result_reports만 읽기 가능
- 공개된 courses, categories, simulations만 읽기 가능
- 조직 관리자는 자신의 조직 구성원 데이터만 읽기 가능
- admin만 전체 데이터 관리 가능

## 초기 구현 팁

MVP에서는 simulations.scenario_data에 실습 단계 전체를 담아 시작할 수 있습니다. 이후 관리자 도구가 필요해지면 simulation_steps 테이블로 분리합니다.
