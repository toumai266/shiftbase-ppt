# 기술 아키텍처

## 기술 선택 원칙

Shiftbase는 일반 LMS가 아니라 인터랙티브 학습 제품입니다. 따라서 기술 선택은 영상 재생보다 실습 인터페이스, 상태 저장, 시나리오 렌더링, AI 보조 기능에 맞춰야 합니다.

## 권장 스택

### 웹 프론트엔드

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts

### 상태 관리

- Zustand
- 복잡한 실습 흐름에는 XState 선택 도입

### 백엔드와 데이터

- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Next.js Route Handlers
- Next.js Server Actions

### AI 서비스

- FastAPI
- LiteLLM
- 모델 제공자는 필요에 따라 선택
- Redis는 필요 시 캐시와 작업 큐에 사용

### 결제

- Toss Payments

### 분석

- PostHog
- Vercel Analytics 선택

### 배포

- Vercel
- Supabase Cloud
- FastAPI는 Railway, Fly.io, Render 중 선택

## 초기 아키텍처

```text
사용자 브라우저
  -> Next.js 웹 앱
  -> Supabase Auth
  -> Supabase Postgres
  -> Supabase Storage
  -> FastAPI AI Service
  -> 외부 AI 모델
```

## Next.js 역할

Next.js는 다음을 담당합니다.

- 랜딩 페이지
- 카테고리 페이지
- 모듈 상세 페이지
- 실습실 UI
- 나의 학습 대시보드
- API 라우트
- 서버 액션
- SEO 페이지
- 관리자 기초 화면

## Supabase 역할

Supabase는 다음을 담당합니다.

- 사용자 인증
- 프로필
- 강의와 모듈 데이터
- 실습 진행 상태
- 실습 결과
- 템플릿 파일
- 수강권
- 조직과 구성원

## FastAPI 역할

FastAPI는 AI 관련 기능을 분리 처리합니다.

- 문의 분류
- 답변 초안 생성
- 실습 결과 평가
- 힌트 생성
- 리포트 요약
- 프롬프트 버전 관리
- AI 호출 로그 저장

초기에는 FastAPI 없이 Next.js에서 AI 호출을 처리할 수 있습니다. 그러나 AI 기능이 늘어나면 FastAPI를 분리하는 것이 좋습니다.

## 실습 엔진 아키텍처

```text
SimulationShell
  -> StepNavigator
  -> StepRenderer
  -> ActionPanel
  -> ValidationPanel
  -> HintBox
  -> ResultReport
  -> Persistence Adapter
  -> AI Assist Adapter
```

## 폴더 구조 예시

```text
app
  page.tsx
  categories
  modules
  lab
  dashboard
  admin
components
  ui
  layout
  course
  simulation
  dashboard
lib
  supabase
  auth
  simulation
  ai
  payments
content
  categories
  modules
  simulations
  templates
server
  actions
  validators
  reports
```

## 시나리오 관리 방식

초기에는 시나리오를 YAML 또는 TypeScript 객체로 관리합니다.

장점:

- 빠르게 수정 가능
- 버전 관리 쉬움
- 관리자 페이지 없이 시작 가능

추후에는 DB 기반 저작 도구를 만듭니다.

## AI 기능 도입 순서

1. AI 없이 정적 실습 구현
2. 예시 결과 제공
3. 문의 분류 API 추가
4. 답변 초안 API 추가
5. 응답 품질 평가 API 추가
6. 사용자별 피드백 API 추가
7. AI 비용과 품질 모니터링 추가

## 인증과 권한

권한 유형:

- guest
- free_user
- paid_user
- org_user
- org_admin
- admin

접근 제어:

- 무료 실습은 guest 또는 free_user 접근
- 유료 모듈은 paid_user 접근
- 기업 모듈은 org_user 접근
- 조직 리포트는 org_admin 접근
- 전체 관리는 admin 접근

## 성능 전략

- 랜딩과 카테고리는 정적 렌더링 우선
- 실습실은 클라이언트 상태 중심
- 서버 저장은 단계 완료 시 또는 자동 저장 주기 사용
- 이미지와 템플릿은 Storage와 CDN 사용
- AI 응답은 비동기 처리와 실패 대체값 제공

## 장애 대응

AI 호출 실패:

- 내장 예시 결과 사용
- 사용자에게 AI 응답을 다시 요청할 수 있게 제공

DB 저장 실패:

- 로컬 임시 저장
- 재시도 버튼 제공

결제 실패:

- 주문 상태를 pending으로 유지
- 웹훅 재처리 가능하게 설계

## 최종 판단

가장 현실적인 초기 조합은 Next.js, Supabase, Zustand입니다. AI 기능이 검증되면 FastAPI와 LiteLLM을 추가합니다.
