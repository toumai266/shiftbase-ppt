# Shiftbase 상용 운영 구조 설계

작성일: 2026-06-07  
대상 프로젝트: `C:\Users\vulpe\Desktop\Business\00_AXworkshift`  
성격: 현재 구현 상태를 기준으로 한 상용 운영 구조 설계 문서  
범위: 콘텐츠 저작, 검수, 공개 패키지, 사용자 학습 기록, 결제/권한, 분석 운영  
제외 범위: 실제 DB 마이그레이션 구현, 결제사 선정, 개별 컨테이너 본문 개편

## 1. 결론

Shiftbase를 상용 서비스로 만들 때 핵심 운영 단위는 `container.json` 파일 자체가 아니라 **버전 있는 컨테이너 패키지**여야 한다.

현재 프로젝트는 다음에 가깝다.

```text
content/containers/{slug}/container.json
-> generated registry
-> published 컨테이너만 public learning surface에 노출
-> 학습자는 localStorage 기반으로 임시 진행 상태 저장
```

상용 운영 구조는 다음으로 바뀌어야 한다.

```text
Authoring Source
-> Review Gate
-> Published Container Package
-> Learner Runtime
-> Commerce / Progress / Output / Analytics
```

즉, 목표는 "DB를 붙인다"가 아니다. 목표는 **작성 중인 콘텐츠와 판매 가능한 공개본을 다른 운영 객체로 취급하는 것**이다.

## 2. 현재 상태 요약

### 2-1. 콘텐츠 상태

2026-06-07 현재 `content/containers` 기준 컨테이너는 20개다.

| 상태 | 개수 | 의미 |
| --- | ---: | --- |
| `published` | 2 | public learning surface에 노출되는 컨테이너 |
| `draft` | 18 | 작성/개편 대상 컨테이너 |

현재 `published` 컨테이너:

| slug | 제목 | 모듈 | 페이지 |
| --- | --- | ---: | ---: |
| `ai-literacy-starter` | 비전공자를 위한 AI 기본 지식 | 4 | 32 |
| `ai-personal-assistant-after-hours` | 퇴근 후 1시간, 나만의 AI 비서 만들기 | 6 | 22 |

현재 전략 문서와 마일스톤 문서 기준으로는 `ai-email-document-communication`, `ai-report-writing-dashboard`, `ai-personal-assistant-after-hours`가 상용 템플릿 후보로 반복 언급된다. 그러나 아직 어느 하나도 "상용 패키지"로 확정된 상태는 아니다.

### 2-2. 콘텐츠 모델

현재 핵심 콘텐츠 타입은 `ContainerSpec`이다.

```text
ContainerSpec
  modules[]
    lessons[]
      pages[]
        left
          bodyMarkdown / paragraphs / checkpoints
        workspace
          layout
          blocks[]
```

workspace block 타입은 다음을 포함한다.

```text
code-canvas
intro-summary
image-definition
block-board
state-summary
example-list
candidate-select
quiz
checklist
result-card
```

이 구조는 상용 서비스에서도 유지할 수 있다. 다만 `block`은 단순 UI 조각이 아니라, 나중에는 사용자 입력/완료/저장/평가와 연결되는 운영 계약이 되어야 한다.

### 2-3. 공개 학습 표면

현재 public learning surface는 `lib/content.ts`에서 `container.status === "published"`인 컨테이너만 `courses`로 만든다. `app/learning/[slug]/page.tsx`는 이 `courses`를 기준으로 정적 상세 페이지를 생성한다.

학습 상세 페이지는 `/learning/[slug]`, 실제 레슨 런타임은 `/learn/[courseSlug]/[lessonSlug]`다. 학습 플레이어는 `components/lesson/InteractiveLessonPlayer.tsx`에서 동작한다. 현재 학습 진행 상태는 브라우저 `localStorage`에 저장된다.

```text
shiftbase:lesson-session:{courseSlug}:{lessonSlug}
```

따라서 현재 구조에는 다음이 없다.

- 계정 기반 학습 진행률
- 서버 저장 산출물
- 구매자별 접근 권한
- 컨테이너 버전별 진행 상태
- 운영 분석 이벤트
- 세션/사용자 식별 경계 (현재는 브라우저 키 기반 임시 세션)

`InteractiveLessonPlayer`는 상태 저장 단위를 `courseSlug+lessonSlug+localStorage key`로 다룬다.

### 2-3-1. 운영 경계 관점에서의 현재 한계

- 학습 런타임은 사용자 인증/세션 없이 렌더링됨
- review 페이지(`/cms/containers/[slug]/review`)는 로컬 저작 소스 검사만 수행하고 승인 결과를 기록하지 않음
- 현재 기준으로는 `Authoring`과 `Learning`이 동일 신뢰 경계(local-file) 안에 묶임

운영 1차 목표: 학습 경로와 저작 경로의 신원/접근 경계를 분리해, 접근·진행·산출물의 감사 추적을 서버 기준으로 이동

### 2-4. 저작 백엔드

현재 실제 코드 기준 `containerService`는 `local-file` provider만 지원한다.

```text
SHIFTBASE_AUTHORING_BACKEND=local-file
content/containers/{slug}/container.json
content/.backups/containers/{slug}/{timestamp}.json
```

문서상 `docs/backend/authoring_backend_contract.md`와 `docs/backend/postgres_transition.md`는 `sqlite`와 `postgres` 전환 경로를 언급한다. 하지만 현재 `lib/backend/containerService.ts`의 provider switch는 `local-file`만 반환한다.

이 차이는 상용화 전 반드시 정리해야 한다.

현재 local-file 저장 의미도 분리해서 봐야 한다.

```text
현재 update 동작:
  raw spec 준비
  이전 container.json 백업
  container.json 원자 교체
  generated registry sync

현재 update에서 하지 않는 것:
  validateContainerSpec 기반 전체 검증
  source_version 증가
  review record 생성
  publish package 생성
```

따라서 이 문서에서 말하는 `source_version`과 `published package`는 현재 저장 동작이 아니라 **향후 publish/versioning 동작**이다. Phase 0에서 "저장 전 검증 없음"을 문서와 코드 중 어디에서 해결할지 먼저 결정해야 한다.

정리 방향은 둘 중 하나다.

| 선택 | 의미 |
| --- | --- |
| 문서를 현재 코드에 맞춘다 | 지금은 local-file만 공식 지원한다고 명시 |
| 코드를 문서 목표에 맞춘다 | sqlite/postgres provider를 실제로 추가 |

상용 운영 관점에서는 두 번째가 필요하지만, 첫 단계에서는 차이를 명확히 기록하는 것이 우선이다.

### 2-5. 검증과 생성

현재 검증 스크립트:

```text
npm run validate:content
```

실행 내용:

```text
scripts/generate-container-registry.mjs --check
scripts/validate-content.mjs
```

현재 AI 생성 경계:

```text
/api/local-cms/reading/generate
/api/local-cms/artifacts/generate
lib/backend/agentArtifactGenerator.ts
SHIFTBASE_OPENAI_OAUTH_URL 또는 OPENAI_OAUTH_URL
```

현재 asset 업로드 경계:

```text
/api/local-cms/assets
public/assets/cms/{slug}/{timestamp}-{file}
```

이 구조는 로컬/운영자 저작에는 충분하지만, 상용 운영에서는 asset storage provider와 asset metadata가 별도로 필요하다.

### 2-6. 평가 토론장

현재 평가 기능은 `EvaluationThread`, `EvaluationRun`, `EvaluationParticipant`, `EvaluationResult`, `EvaluationSynthesis` 구조를 갖고 있다.

평가 대상 범위:

```text
container
module
lesson
page
block
```

현재 평가 결과는 대화/리뷰 기록에 가깝다. 상용 publish gate에 들어가려면 평가 결과가 다음 형태의 품질 기록으로 정리되어야 한다.

```text
review_record
  target package/source
  issue
  participants
  findings
  required fixes
  approval decision
  approver
  approved_at
```

### 2-7. Review v0 통합 지점

`app/cms/containers/[slug]/review/page.tsx`는 현재 다음 항목을 경고 리스트로 노출한다.

- 로컬 저작 백엔드 경고(고정 경고)
- `published` 여부
- 페이지 수, 우측 워크스페이스 유무
- 이미지 경로 존재성 검사

현재는 단순 품질 점검 화면이라 `review_record`를 저장하지 않는다. 상용에서는 다음을 반영해야 한다.

- review 실행 결과 JSON을 보관
- approver 식별자, 승인/반려 시각, 사유를 `container_review_records`에 함께 기록
- Review v0 경고는 `blocking`, `environment`, `advisory`로 분류
- production package publish gate는 `blocking` 경고 0개일 때만 다음 단계 진행
- `environment` 경고는 local/staging에서는 허용될 수 있지만 production publish에서는 명시적 운영 예외가 필요

현재 Review v0에는 로컬 파일 authoring backend 경고가 항상 들어간다. 따라서 "경고 0개"를 그대로 publish 조건으로 쓰면 local 단계의 패키지 MVP도 통과할 수 없다. 첫 구현에서는 경고 총량보다 **경고 분류와 예외 승인 기록**을 기준으로 삼아야 한다.

## 3. 상용 운영 객체

상용 구조에서는 다음 객체들을 분리해야 한다.

### 3-1. Container Source

작성자가 편집하는 원본이다.

현재 대응물:

```text
content/containers/{slug}/container.json
```

상용 대응물:

```text
containers
  slug
  title
  authoring_status
  current_draft_spec_json
  saved_at
```

이 객체는 언제든 수정될 수 있다. 사용자가 직접 소비하는 상품이 아니다.

### 3-2. Container Version

원본이 저장될 때 남는 이력이다.

상용 대응물:

```text
container_versions
  id
  slug
  source_version
  spec_json
  reason
  created_at
```

현재 local-file provider는 update/delete 전에 backup 파일을 남긴다. 이 동작은 상용 DB에서는 `container_versions`로 옮겨야 한다.

### 3-3. Review Record

컨테이너가 상용 기준을 통과했는지 남기는 품질 기록이다.

상용 대응물:

```text
container_review_records
  id
  slug
  source_version
  scope
  status
  findings_json
  required_fixes_json
  approval_decision
  approved_by
  approved_at
```

상용 컨테이너는 단순히 `status: published`라서 공개되는 것이 아니라, Review Record가 통과되어야 공개된다.

### 3-4. Published Package

사용자가 보는 불변 공개본이다.

상용 대응물:

```text
published_container_packages
  id
  slug
  package_version
  source_version
  spec_json
  asset_manifest_json
  review_record_id
  access
  price_snapshot_json
  published_at
  retired_at
```

#### 패키지 manifest 계약(공개 노출 기준)

`published_container_packages`는 학습자가 실제 보는 계약 단위다.

```text
id                    # uuid (내부 식별자)
slug                  # 콘텐츠 slug
package_version       # 공개 버전 태그
source_version        # source 버전 참조
spec_json             # 렌더링용 정규화 spec
asset_manifest_json   # 패키지 자산 목록
review_record_id      # 승인 근거
access                # free | paid
price_snapshot_json   # 가격 스냅샷
published_at
retired_at(optional)
```

공개 노출은 항상 패키지 manifest 기준으로 처리한다. 같은 slug라도 package_version이 달라지면 이전 진행률/산출물은 별도 package 단위로 분리.

manifest는 최소한 다음 JSON 형태로 표현되어야 한다.

```json
{
  "packageId": "uuid",
  "slug": "ai-email-document-communication",
  "packageVersion": "1.0.0",
  "sourceVersion": 12,
  "status": "published",
  "access": "paid",
  "publishedAt": "2026-06-08T00:00:00.000Z",
  "spec": {},
  "assetManifest": [
    {
      "path": "/assets/cms/example/image.webp",
      "storageKey": "containers/example/image.webp",
      "mimeType": "image/webp",
      "checksum": "sha256:..."
    }
  ],
  "blockContracts": [
    {
      "blockId": "module-01-page-01-result",
      "type": "result-card",
      "reads": ["selectedCandidate"],
      "writes": ["finalOutput"],
      "requiredForCompletion": true,
      "outputSchemaVersion": 1
    }
  ],
  "reviewRecordId": 10,
  "priceSnapshot": {
    "currency": "KRW",
    "amount": 39000
  }
}
```

`spec`는 렌더링 가능한 정규화 컨테이너 스펙이다. `assetManifest`와 `blockContracts`는 publish 시점에 계산된 공개 계약이며, 런타임은 작성 중 source 파일을 다시 읽어 이 값을 추론하지 않는다.

중요한 점은 `published package`가 원본과 다르다는 것이다.

원본은 계속 바뀔 수 있다. 공개 패키지는 사용자의 진행률과 결제 기록이 붙는 기준점이므로 불변이어야 한다.

### 3-5. Asset Record

이미지, 첨부파일, artifact asset의 운영 기록이다.

상용 대응물:

```text
assets
  id
  container_slug
  storage_provider
  storage_key
  public_path
  mime_type
  byte_size
  checksum
  created_at
```

현재는 `public/assets/cms/{slug}`에 바로 파일을 쓴다. 상용에서는 S3/R2 같은 object storage로 옮기거나, 최소한 provider boundary를 둬야 한다.

### 3-6. Learner State

사용자 진행률과 저장 산출물이다.

상용 대응물:

```text
learner_progress
  user_id
  package_id
  lesson_id
  page_id
  status
  completed_at
  updated_at

learner_outputs
  id
  user_id
  package_id
  block_id
  output_json
  created_at
  updated_at
```

현재 `localStorage`에 있는 상태는 상용에서 서버 DB로 이동해야 한다.

### 3-7. Commerce Grant

사용자가 어떤 공개 패키지에 접근할 수 있는지 나타내는 권한이다.

상용 대응물:

```text
commerce_grants
  user_id
  package_id
  grant_type
  source
  starts_at
  ends_at
  created_at
```

초기에는 자동 결제 없이 수동 부여도 가능하다. 중요한 것은 학습 런타임이 `access` 문자열만 믿지 않고 권한 객체를 확인하는 것이다.

#### purchase/order와 commerce_grant 구분

- `purchase`/`order`는 결제 체결/금액/영수증 단위다.
- `commerce_grant`는 학습 접근권을 판단하는 실행 권한 단위다.
- 접근 판정은 주문 상태보다 `commerce_grant` 존재 여부를 우선한다.
- 주문이 있어도 grant 미생성 시 런타임 접근은 차단되어야 한다.
- 환불이나 기간 만료는 주문 기록을 지우는 것이 아니라 grant를 종료하거나 별도 revoke 기록을 남기는 방식으로 처리한다.

### 3-8. Analytics Event

제품 판단을 위한 사용 이벤트다.

상용 대응물:

```text
analytics_events
  id
  user_id nullable
  anonymous_id nullable
  package_id nullable
  event_name
  event_payload_json
  created_at
```

초기 필수 이벤트:

```text
container_viewed
lesson_started
page_viewed
block_interacted
output_saved
lesson_completed
container_completed
cta_clicked
purchase_intent_submitted
```

## 4. 상태 전이

현재 스펙의 `status`는 `draft | published`뿐이다. 상용 운영에는 부족하다.

권장 운영 상태:

```text
draft
-> candidate
-> in_review
-> approved
-> published
-> retired
```

각 상태의 의미:

| 상태 | 의미 | 사용자 노출 |
| --- | --- | --- |
| `draft` | 자유롭게 작성 중 | 노출 안 함 |
| `candidate` | 상용 후보로 고정 | 노출 안 함 |
| `in_review` | 평가/검수 중 | 노출 안 함 |
| `approved` | 공개 패키지 생성 가능 | 노출 안 함 |
| `published` | 패키지로 공개됨 | 노출 |
| `retired` | 신규 판매/노출 중단 | 기존 사용자만 접근 가능할 수 있음 |

구현 방식은 두 가지가 있다.

1. `ContainerSpec.status`를 확장한다.
2. `ContainerSpec`은 현재처럼 두고, 운영 상태를 별도 테이블/manifest에 둔다.

권장안은 2번이다. 이유는 `ContainerSpec`은 학습 콘텐츠 모델이고, 운영 상태는 판매/검수 모델이기 때문이다. 단기 구현에서는 스펙 확장을 최소화하는 편이 안전하다.

### 4-1. Identity/Auth/Session 경계

- Authoring 경계: `/cms/*`은 현재 `isLocalCmsEnabled()`와 `isAuthoringBackendEnabled()`에 의해 on/off가 정해지며, 실제 운영자 신원 확인은 없다.
- Learning 경계: `/learning/[slug]` 상세 페이지와 `/learn/[courseSlug]/[lessonSlug]` 레슨 런타임은 현재 인증/세션 없이 렌더링되고, 진행률은 `localStorage` 키로만 영속된다.
- Commerce 경계: 현재 구매자별 접근 권한 확인은 없다.
- 운영 권고: 접근·승인·학습을 분리한 3중 경계로 이동한다.

상용 최소 객체:

```text
users
  id
  email
  display_name
  created_at

operator_memberships
  user_id
  role
  created_at

auth_sessions
  id
  user_id
  expires_at
  created_at
```

`operator_memberships`는 CMS 접근과 approve 권한에만 쓰고, `commerce_grants`는 학습 접근권에만 쓴다. 같은 사용자가 운영자이면서 구매자일 수 있지만 두 권한은 섞지 않는다.

### 4-2. 환경 행렬 (local/staging/production)

현재 코드에서의 기준:

```text
local: NODE_ENV != production -> local-file 저작 활성화 (암시 허용)
staging/production: SHIFTBASE_AUTHORING_BACKEND=local-file -> 저작 UI 활성
production: SHIFTBASE_AUTHORING_BACKEND 미설정 -> 저작 비활성 (cms 404)
```

권고 운영 모드:

- Local: 개발/검증 편의 모드
- Staging: 승인된 운영자만 접근 가능한 검증 모드
- Production: 현재 코드상 `SHIFTBASE_AUTHORING_BACKEND=local-file`을 설정하면 저작 UI가 열릴 수 있지만, 운영 정책상 금지한다.

환경별 기준:

| 환경 | Authoring backend | CMS 접근 | Public learning | 사용자 상태 |
| --- | --- | --- | --- | --- |
| Local | `local-file` 허용 | 로컬 운영자만 | draft preview 허용 | `localStorage` 허용 |
| Staging | `postgres` 목표, 임시 `local-file` 가능 | 인증된 운영자만 | package 후보 검증 | 테스트 DB |
| Production | authoring 비활성 또는 별도 관리자 앱 | 공개 서버에서 `/cms/*` 비노출 | published package만 | 서버 DB |

Production에서 저작이 필요하면 공개 학습 런타임과 분리된 관리자 배포로 열어야 한다. public runtime 서버에서 local-file CMS를 여는 것은 임시 편의가 아니라 배포 사고로 취급한다.

## 5. Publish Pipeline

상용 서비스에서 publish는 단순한 상태 변경이 아니라 **compile 작업**이어야 한다.

첫 MVP에서 명명할 실제 구현 표면은 다음 중 하나로 고정해야 한다.

| 표면 | 설명 | 전환 대상 |
| --- | --- | --- |
| `lib/generated/publishedPackageRegistry.ts` | build-time generated package registry | `lib/content.ts`, `/learning/[slug]`, `/learn/[courseSlug]/[lessonSlug]` |
| `/api/public/packages/{slug}` | runtime package read API | public learning detail/player data loader |
| `content/published-packages/{slug}/{version}/manifest.json` | file-based package snapshot | generated registry 또는 package reader |

초기 권장은 `content/published-packages` + `lib/generated/publishedPackageRegistry.ts`다. 이유는 현재 public learning이 generated registry를 이미 사용하고 있고, authoring DB를 public runtime에 직접 연결하지 않아도 되기 때문이다.

권장 흐름:

```text
1. source spec 선택
2. schema validation
3. content quality validation
4. asset validation
5. artifact validation
6. review record 확인
7. package version 생성
8. public registry/index 갱신
9. deployment 또는 cache purge
10. release note 기록
```

### 5-1. Schema Validation

현재 `validateContainerSpec`와 `scripts/validate-content.mjs`가 담당하는 영역이다.

자동화 상태: `existing automated` 일부, `missing automation` 일부.

확인 항목:

- 필수 필드 존재
- slug 형식
- id 중복
- block type 등록 여부
- code-canvas runtime
- props schema
- state binding

### 5-2. Content Quality Validation

상용 컨테이너에는 다음 체크가 필요하다.

자동화 상태: `manual` 또는 `missing automation`.

```text
실제 업무 원문이 있는가
AI 초안이 있는가
AI가 틀리는 장면이 있는가
사람이 멈추고 판단하는 장면이 있는가
전후 비교가 있는가
사용자가 자기 업무에 적용하는 단계가 있는가
최종 산출물이 있는가
```

이 7단계는 현재 마일스톤 문서에서 반복 정리된 "컨테이너 문법"이다.

### 5-3. Asset Validation

자동화 상태: `manual` 일부, `missing automation` 일부. 현재 CMS review page는 asset path 존재성 일부를 확인하지만 `npm run validate:content`는 asset 파일 존재를 검증하지 않는다.

확인 항목:

- 모든 `coverImage`, `recommendationCards.image`, `image-definition.props.image`가 실제 존재하는가
- public path가 허용된 asset root 아래인가
- 외부 이미지 의존이 의도된 것인가
- mime type과 확장자가 일치하는가

### 5-4. Artifact Validation

자동화 상태: `existing automated` 일부, `missing automation` 일부. 현재 validator는 `files/entry`, runtime, status 구조를 확인하지만 iframe 렌더링, blank screen, CSP 위반, 외부 호출 여부까지 검증하지 않는다.

확인 항목:

- `code-canvas.props.files[entry]`가 존재하는가
- iframe에서 빈 화면이 아닌가
- CSP를 위반하지 않는가
- 외부 API 호출이 없는가
- artifact status가 `verified` 또는 허용된 공개 상태인가

현재 `CodeCanvasFrame`은 sandbox iframe과 CSP를 사용한다. 상용 publish gate에서는 실제 렌더링 스모크 테스트가 필요하다.

### 5-5. Review Record 확인

평가 토론장은 publish gate의 입력이어야 한다.

상용 공개 전 최소 조건:

```text
critical finding 0개
high finding 0개 또는 명시적 승인 예외
P0 improvement 0개
approver 명시
approval timestamp 존재
```

### 5-6. Evaluation -> Review Record -> Approval 규칙

- EvaluationThread/Result 집계 항목
  - critical finding count
  - high finding count
  - p0 improvement count
  - required fixes
- 리뷰 기록 결합 필드
  - approval decision
  - approver
  - approved_at
  - approval_reason
- 판정 규칙
  - critical > 0: `blocked`
  - high > 0: `blocked` 또는 approver 예외 승인
  - p0_improvement > 0: `blocked` 또는 approver 예외 승인
  - approver/approved_at 누락 시 `blocked`
- Review page v0 warning은 `review_record`의 필수 입력 중 하나로 유지

예외 승인은 "나중에 고침"이라는 메모가 아니다. 예외를 승인하려면 남은 위험, 허용 이유, 보완 예정일, 책임자를 `approval_reason` 또는 별도 exception record에 남긴다.

### 5-7. Rollback / Retire / Republish 규칙

- rollback: 결함 패키지는 즉시 `retired`로 전환하고 이전 안정 버전으로 노출 전환
- retire: 운영상 신규 노출 중단, 기존 패키지 학습 이력 보존
- republish: source 수정 후 새 `source_version` + 새 `package_version` 발행
- 기존 사용자 진행률/산출물은 기존 package_id 기준으로 보존; 이동은 별도 마이그레이션 규칙으로 결정

## 6. DB 구조 권장안

이 절은 개념 DDL이다. 실행 가능한 migration-ready DDL은 아직 별도.

구분:

- 개념 DDL: 객체 및 컬럼 목적, 관계, 상태 전이만 정의
- migration-ready DDL: 타입, 제약, FK, 인덱스, default, rollback 순서를 포함

`docs/backend/postgres_transition.md`의 기존 우선순위(`containers`, `container_versions`)를 먼저 그대로 지키고, 그 다음 단계에서 상용 운영 테이블을 migration-ready로 확장한다.

초기 상용 구조는 "모든 것을 잘게 정규화"하지 않는다. 콘텐츠 본문은 JSONB로 유지하고, 운영에 필요한 조회 필드만 컬럼으로 둔다.

Postgres 작업은 두 단계로 분리한다.

| 단계 | 목적 | 포함 | 제외 |
| --- | --- | --- | --- |
| Adapter minimum | `ContainerRepository` provider 교체 | `containers`, `container_versions`, provider switch, 계약 테스트 | auth, analytics, payments, public learner progress |
| Commercial schema | 상용 운영 확장 | review, package, identity, progress, commerce, analytics | 첫 adapter 교체의 필수 조건 아님 |

Phase 2는 Adapter minimum까지만 한다. Commercial schema는 Phase 3 이후에 붙인다.

### 6-0. Identity DB

```sql
create table users (
  id uuid primary key,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table operator_memberships (
  user_id uuid not null,
  role text not null,
  created_at timestamptz not null default now(),
  primary key(user_id, role)
);

create table auth_sessions (
  id uuid primary key,
  user_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
```

이 테이블은 개념안이다. 실제 구현에서는 사용하는 auth provider에 따라 `users`와 `auth_sessions`의 소유권이 외부 서비스로 이동할 수 있다.

### 6-1. Authoring DB

```sql
create table containers (
  slug text primary key,
  title text not null,
  authoring_status text not null,
  current_spec_json jsonb not null,
  created_at timestamptz not null default now(),
  saved_at timestamptz not null default now()
);

create table container_versions (
  id bigint generated always as identity primary key,
  slug text not null references containers(slug),
  source_version integer not null,
  reason text not null,
  spec_json jsonb not null,
  created_at timestamptz not null default now(),
  unique(slug, source_version)
);

create table container_review_records (
  id bigint generated always as identity primary key,
  slug text not null,
  source_version integer not null,
  status text not null,
  findings_json jsonb not null,
  required_fixes_json jsonb not null,
  approval_decision text,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
```

### 6-2. Published Package DB

```sql
create table published_container_packages (
  id uuid primary key,
  slug text not null,
  package_version text not null,
  source_version integer not null,
  spec_json jsonb not null,
  asset_manifest_json jsonb not null,
  review_record_id bigint,
  access text not null,
  price_snapshot_json jsonb,
  published_at timestamptz not null default now(),
  retired_at timestamptz,
  unique(slug, package_version)
);
```

### 6-3. Learner Runtime DB

```sql
create table learner_progress (
  user_id uuid not null,
  package_id uuid not null,
  lesson_id text not null,
  page_id text not null,
  status text not null,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(user_id, package_id, page_id)
);

create table learner_outputs (
  id uuid primary key,
  user_id uuid not null,
  package_id uuid not null,
  block_id text not null,
  output_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 6-4. Commerce DB

```sql
create table purchase_orders (
  id uuid primary key,
  user_id uuid not null,
  package_id uuid not null,
  status text not null,
  currency text not null,
  amount integer not null,
  provider text not null,
  provider_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz
);

create table commerce_grants (
  id uuid primary key,
  user_id uuid not null,
  package_id uuid not null,
  grant_type text not null,
  source text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, package_id, grant_type)
);
```

`purchase_orders.status`는 결제 원장에 가깝고, `commerce_grants`는 런타임 접근 판정에 가깝다. 결제 성공 후 grant 생성이 실패할 수 있으므로 둘을 하나의 테이블로 합치지 않는다.

### 6-5. Analytics DB

```sql
create table analytics_events (
  id uuid primary key,
  user_id uuid,
  anonymous_id text,
  package_id uuid,
  event_name text not null,
  event_payload_json jsonb not null,
  created_at timestamptz not null default now()
);
```

초기에는 analytics event를 Postgres에 바로 쌓아도 된다. 이벤트가 많아진 뒤 warehouse나 queue를 붙이면 된다.

## 7. 운영 흐름

### 7-1. 컨테이너 제작

```text
1. draft source 생성
2. 본문/bodyMarkdown 작성
3. workspace block 구성
4. asset 업로드
5. artifact 생성/수정
6. 현재는 container.json 저장과 backup 생성
7. 향후에는 저장 시 source version 생성
```

현재 구현의 `AuthoringWorkflow`와 `ContainerRepository`가 이 흐름의 기반이다. 다만 현재 local-file update는 완전 스펙 검증이나 source version 생성을 하지 않는다. 이 기능은 publish pipeline 또는 Postgres adapter 단계에서 추가해야 한다.

### 7-2. 상용 후보 고정

```text
1. 특정 source version을 candidate로 지정
2. 이후 큰 구조 변경 제한
3. 품질 평가 이슈 생성
4. 평가 토론장 실행
```

이 단계에서 "무엇을 팔 것인가"가 고정되어야 한다.

### 7-3. 검수와 승인

```text
1. schema validation
2. asset validation
3. artifact validation
4. content quality validation
5. evaluation synthesis 확인
6. approver가 승인 또는 반려
```

승인 없이 `published`로 넘어가면 안 된다.

### 7-4. 공개 패키지 생성

```text
1. approved source version 선택
2. package version 부여
3. spec_json snapshot 저장
4. asset manifest 저장
5. price/access snapshot 저장
6. public registry 갱신
```

이때부터 사용자는 source가 아니라 package를 본다.

첫 구현에서 전환해야 할 실제 consumer:

- `lib/content.ts`: `containerSpecs` 대신 published package source를 읽도록 분리
- `app/learning/[slug]/page.tsx`: 상세 페이지가 package manifest 기준으로 metadata/가격/권한을 표시
- `app/learn/[courseSlug]/[lessonSlug]/page.tsx`: 레슨 플레이어가 package id/version 기준으로 progress key를 구성

이 consumer 전환 없이는 `published_container_packages` 테이블이나 manifest가 있어도 public runtime은 계속 raw container source를 읽게 된다.

### 7-5. 사용자 학습

```text
1. package 접근 권한 확인
2. page view 기록
3. block interaction 기록
4. output 저장
5. completion 계산
```

현재 localStorage 저장은 이 단계의 임시 구현이다. 상용에서는 DB 저장으로 바뀌어야 한다.

### 7-6. 개선과 재출판

```text
1. analytics / feedback 확인
2. source 수정
3. 새 source version 생성
4. review gate 재통과
5. 새 package version publish
```

기존 사용자의 진행률은 기존 package version 기준으로 남긴다. 새 버전으로 이동시킬 필요가 있다면 별도 migration rule을 둔다.

### Source/Package 버전 정책

- Source는 저장 단위, Package는 공개 단위다.
- Source version은 `container_versions`에서 계속 증가 가능
- Package version은 Review 통과 후 고정 발행
- 하나의 source version에서 여러 package version 발행은 허용되나, 운영 기본은 1:1 매핑 권장
- package는 retire만 가능하며 삭제 금지

권장 version 증가 규칙:

| 변경 | 예시 | package version |
| --- | --- | --- |
| 오탈자, 문장 다듬기, 이미지 alt 수정 | 학습 상태와 산출물 schema 불변 | patch 증가 |
| 페이지/블록 추가, 설명 순서 변경 | 기존 진행률은 유지 가능하나 새 경험 추가 | minor 증가 |
| block id 변경, output schema 변경, 완료 조건 변경 | 기존 진행률/산출물 migration 필요 | major 증가 |

`block_id`, `page_id`, `lesson_id`는 사용자 진행률과 산출물의 외래 기준이다. 공개 후 이 값들을 바꾸면 major 변경으로 본다.

### 블록 런타임 계약

- `InteractiveLessonPlayer`와 `workspace`가 요구하는 최소 계약
  - reads/writes 키 순서를 준수해 상태를 읽고 써야 함
  - `code-canvas.runtime = sandboxed-iframe`
  - `files`/`entry` 정합성
  - `code-canvas.status`는 generated/verified 경로만 운영 승인 검토 대상
  - `candidate-select`는 reads+writes 둘 다 요구
  - `state-summary`는 reads 필수
- 패키지 배포 시 block contract hash 또는 runtime 조건을 manifest에 남기면 rollback/reproducibility 추적에 유리

상용 block contract 최소 필드:

```text
block_id
type
reads[]
writes[]
required_for_completion
output_schema_version
server_persisted
client_restore_strategy
```

현재 `result-card`는 `reads`를 통해 선택 결과를 보여주는 정적 결과 카드에 가깝다. 상용 산출물로 쓰려면 `writes` 또는 별도 저장 액션을 추가해 `learner_outputs`에 저장되는 경로를 가져야 한다.

## 8. 단계별 구현 순서

### Phase 0. 현재 구현과 문서 정렬

목표: 실제 코드와 문서의 불일치를 없앤다.

작업:

- `containerService`의 provider 지원 범위를 문서와 맞춘다.
- sqlite가 실제로 없는 상태라면 문서에서 "계획"으로 낮춘다.
- artifact generate route, reading generate route, asset route를 최신 문서에 정확히 반영한다.
- 현재 공개 컨테이너 2개와 draft 18개 현황을 release 기준 문서에 기록한다.

완료 기준:

- `docs/README.md`에서 이 문서 링크가 유지된다.
- `lib/backend/containerService.ts`와 `docs/backend/authoring_backend_contract.md`의 provider 설명이 일치한다.
- `tests/backend/localFileContainerRepository.test.ts`의 "saves updates without running container spec validation" 기대가 유지된다면, 이 문서와 backend 계약 문서에 그 제한이 명시된다.
- `npm run validate:content`가 현재 자동 검증 범위만 보장한다는 점이 publish gate 문서에 분리되어 있다.

### Phase 1. 첫 상용 컨테이너 패키지 MVP

목표: DB 전환 전에라도 하나의 컨테이너를 공개 패키지처럼 운영한다.

작업:

- 첫 후보 컨테이너 1개 고정
- 7단계 컨테이너 문법 체크리스트 작성
- 수동 review record 문서 작성
- publish package manifest 작성
- package version 부여
- published surface가 해당 package를 기준으로 노출되도록 정리

완료 기준:

- `content/published-packages/{slug}/{version}/manifest.json` 또는 동등한 package manifest가 존재한다.
- manifest에 `packageId`, `slug`, `packageVersion`, `sourceVersion`, `spec`, `assetManifest`, `blockContracts`, `reviewRecordId`가 들어 있다.
- `npm run validate:content`가 통과한다.
- `/preview/containers/{slug}` 또는 `/learn/{slug}/{lessonSlug}`에서 선택한 후보 컨테이너가 깨지지 않고 열린다.
- draft source를 수정해도 manifest의 package version이 자동으로 바뀌지 않는다.

### Phase 2. Postgres Authoring Repository

목표: local-file을 상용 저작 저장소로 대체하기 위한 adapter minimum을 구현한다. 이 단계는 auth, analytics, payments, public learner progress를 포함하지 않는다.

작업:

- `PostgresContainerRepository` 구현
- `SHIFTBASE_AUTHORING_BACKEND=postgres`
- `DATABASE_URL` 또는 `SHIFTBASE_AUTHORING_DATABASE_URL`
- `containers`, `container_versions` migration. commercial schema는 제외
- local-file repository tests와 동일한 계약 테스트

완료 기준:

- `SHIFTBASE_AUTHORING_BACKEND=postgres` 환경에서 `/api/health`가 성공한다.
- `/api/local-cms/containers` list/create/read/update/delete가 local-file과 같은 structured error contract를 반환한다.
- repository 계약 테스트가 postgres provider에도 적용된다.
- CMS UI와 `/api/local-cms/*` route 호출부를 바꾸지 않고 provider만 전환된다.

### Phase 3. Published Package와 사용자 런타임

목표: 사용자에게 source가 아니라 package를 제공한다.

작업:

- `published_container_packages` 추가
- package read API 또는 generated package registry 추가
- user/auth 경계 추가
- learner_progress, learner_outputs 추가
- localStorage는 비로그인 임시 세션으로만 제한

완료 기준:

- `lib/content.ts` 또는 별도 package reader가 raw `containerSpecs` 대신 published package source를 읽는 경로를 갖는다.
- `/learning/[slug]` 상세 페이지가 package manifest 기준의 title/price/access를 표시한다.
- `/learn/[courseSlug]/[lessonSlug]` 런타임이 `package_id` 또는 `packageVersion`을 progress key에 포함한다.
- 로그인 사용자의 `learner_progress`와 `learner_outputs`가 서버에 저장된다.
- source 수정 후에도 기존 package id의 진행률 조회가 같은 값을 반환한다.

### Phase 4. 결제/권한과 분석

목표: 상용 운영 의사결정을 할 수 있는 데이터를 만든다.

작업:

- commerce_grants 추가
- 수동 결제/베타 권한 부여부터 시작
- CTA, page view, completion, output save 이벤트 기록
- 운영 대시보드 또는 일별 리포트 작성

완료 기준:

- 결제 또는 수동 베타 부여가 `purchase_orders`와 `commerce_grants` 중 어느 객체를 만들었는지 구분된다.
- 런타임 접근 판정은 `commerce_grants` 기준으로 수행된다.
- `container_viewed`, `page_viewed`, `block_interacted`, `output_saved`, `cta_clicked` 이벤트가 저장된다.
- 특정 package id 기준으로 페이지 이탈과 output 저장 수를 조회할 수 있다.

## 9. 첫 상용 컨테이너 Go/No-Go 체크리스트

첫 상용 컨테이너는 아래를 통과해야 한다.

### 콘텐츠

- 실제 업무 원문 하나가 있다.
- AI 초안이 있다.
- AI가 그럴듯하게 틀리는 장면이 있다.
- 사람이 멈춰야 하는 이유가 명확하다.
- 전후 비교가 있다.
- 사용자가 자기 업무에 적용하는 단계가 있다.
- 최종 산출물이 있다.

### 학습 경험

- 첫 페이지가 실제 업무 장면으로 시작한다.
- 설명보다 사용자의 판단 행동이 먼저 보인다.
- workspace block이 본문 이해를 돕는다.
- `result-card`가 빈 장식이 아니라 저장 가능한 결과물로 이어진다.
- `code-canvas`는 실제 판단/입력/비교에 필요할 때만 사용한다.

### 기술

- `npm run validate:content` 통과. 현재 자동 검증 범위는 schema 중심이다.
- Review v0 또는 별도 스크립트로 모든 asset path 존재 확인.
- validator 또는 별도 스크립트로 모든 `code-canvas.files[entry]` 존재 확인.
- 수동 또는 자동 smoke로 code-canvas iframe이 blank screen이 아님을 확인.
- published package manifest 존재.
- source version과 package version 연결.
- review record 존재.

### 운영

- 가격 또는 베타 접근 조건 명확.
- 환불/문의/AI 책임 안내 문구 존재.
- 사용자 진행률 저장 방식 확정.
- 최소 이벤트 로깅 존재.
- release note 존재.

## 10. 지금 당장 하지 말아야 할 것

다음 작업은 상용화처럼 보이지만 현재 순서에서는 위험하다.

- 20개 컨테이너 전체를 한 번에 DB 마이그레이션한다.
- public runtime을 authoring source DB에 직접 연결한다.
- review gate 없이 `status: published`만 믿고 판매한다.
- 사용자 진행률을 컨테이너 JSON 내부에 넣는다.
- artifact 코드를 검증 없이 공개한다.
- 결제 자동화를 콘텐츠 완성보다 먼저 만든다.
- 코세라식 대규모 microservice 구조를 초기 단계에서 모방한다.

## 11. 의사결정이 필요한 사항

다음 결정은 구현 전에 확정해야 한다.

| 질문 | 권장 방향 |
| --- | --- |
| 첫 상용 패키지 후보는 무엇인가 | `ai-email-document-communication` 또는 `ai-report-writing-dashboard` 중 하나를 우선 고정 |
| `ContainerSpec.status`를 확장할 것인가 | 운영 상태는 별도 객체로 분리 |
| public runtime은 DB를 직접 읽을 것인가 | 초기에는 published package snapshot 또는 generated registry 유지 |
| 결제는 바로 자동화할 것인가 | 첫 유료 검증은 수동 결제/권한 부여 가능 |
| asset storage는 언제 옮길 것인가 | Postgres authoring 이후, publish package 이전에 provider boundary 추가 |
| evaluation thread는 사용자에게 보여줄 것인가 | 초기에는 내부 검수 기록으로만 사용 |

## 12. 운영 구조 한 줄 정의

Shiftbase의 상용 운영 구조는 **컨테이너 원본을 자유롭게 만들고, 검수된 버전만 패키지로 공개하며, 사용자의 진행률과 산출물은 패키지 버전에 묶어 저장하는 구조**다.

이 구조가 잡혀야 하나의 컨테이너가 단순한 글 묶음이 아니라 판매, 학습, 개선, 재출판이 가능한 상용 제품 단위가 된다.
