# Technical Operations

## 현재 구현 상태

현재 Shiftbase는 파일 기반 컨테이너 스펙을 읽어 학습 화면을 만든다.

주요 경로:

```text
content/containers/{slug}/container.json
lib/generated/containerRegistry.ts
lib/containerSpec.ts
lib/content.ts
components/lesson/ShiftPlayer.tsx
```

현재 검증 가능한 컨테이너는 20개다.

```text
published: 2
draft: 18
```

현재 공개 컨테이너:

- `ai-literacy-starter`
- `ai-personal-assistant-after-hours`

`content/containers/ai-personal-assistant-after-work`는 `container.json`이 없는 잔여 디렉터리다. 현재 registry/validation 기준 컨테이너로 보지 않는다.

## 현재 데이터 모델

핵심 타입은 `ContainerSpec`이다.

```text
ContainerSpec
  modules[]
    lessons[]
      pages[]
        left
        workspace
          blocks[]
```

현재 public learning surface는 `lib/content.ts`에서 `status === "published"`인 컨테이너만 노출한다.

레슨 런타임 경로:

```text
/learn/{courseSlug}/{lessonSlug}
```

학습 상세 경로:

```text
/learning/{slug}
```

현재 진행 상태는 브라우저 `localStorage`에 저장된다.

```text
shiftbase:lesson-session:{courseSlug}:{lessonSlug}
```

현재 학습 런타임의 메인 컴포넌트는 `components/lesson/ShiftPlayer.tsx`다. `ShiftPlayer`는 페이지 내용에 따라 풀 폭 슬라이드 화면 또는 30:70 실습 화면으로 렌더링한다. 내부 구조 이름은 코드와 문서에서만 쓰고 사용자 화면에는 직접 노출하지 않는다.

현재 학습 런타임은 데스크톱 우선이다. 최소 viewport는 `1280 x 800`으로 두고, 그보다 작은 화면에서는 경고 화면을 먼저 띄운다.

아직 없는 것:

- 계정 기반 저장
- 서버 기반 진행 상태
- 구매자별 접근 권한
- 공개 패키지 버전
- 승인 기록
- 운영 분석 이벤트

## 현재 저작 백엔드

현재 구현된 authoring provider는 `local-file`뿐이다.

```text
SHIFTBASE_AUTHORING_BACKEND=local-file
```

비 production 환경에서는 provider를 지정하지 않아도 `local-file`이 기본으로 열린다.

현재 local-file update는 다음을 한다.

- route slug 보존
- `updatedAt` 갱신
- 기존 `container.json` 백업
- 새 파일로 원자 교체
- generated registry 동기화

현재 local-file update가 하지 않는 것:

- 전체 `validateContainerSpec` 기반 pre-write 검증
- source version 증가
- review record 생성
- published package 생성

따라서 local-file authoring은 저작 편의 기능이지 상용 publish gate가 아니다.

## 운영 구조

상용 구조는 source와 public runtime을 분리해야 한다.

```text
Authoring Source
-> Review Gate
-> Published Package
-> Learner Runtime
-> Progress / Access / Analytics
```

각 객체의 의미:

- `Authoring Source`: 작성 중인 원본. 계속 바뀔 수 있다.
- `Review Gate`: 공개 전에 사람이 확인하는 품질 기록.
- `Published Package`: 사용자가 보는 고정 버전.
- `Learner Runtime`: 사용자가 단계형 화면에서 직접 수행하는 영역.
- `Progress / Access / Analytics`: 진행 상태, 권한, 사용 기록.

첫 구현에서는 DB 전환보다 package 분리가 먼저다.

## 다음 구현 순서

1. 첫 기준 코스 1개 선택
2. Review Gate 체크리스트 작성
3. `content/published-packages/{slug}/{version}/manifest.json` 추가
4. generated package registry 추가
5. public learning이 source가 아니라 package를 읽는 경로 추가
6. package version을 진행 상태 키에 포함
7. 이후 Postgres authoring repository 검토

Postgres는 먼저 `ContainerRepository` provider 교체 범위로만 다룬다. 결제, 분석, 계정, 진행 상태까지 한 번에 붙이지 않는다.

## 검증 명령

콘텐츠 검증:

```bash
npm run validate:content
```

백엔드 계약 테스트:

```bash
npm run test:backend
```

타입 검사:

```bash
npm run typecheck
```

현재 `validate:content`는 schema와 registry 중심 검증이다. 이미지 파일 존재, iframe 렌더링, 승인 기록, 결제 권한은 아직 검증하지 않는다.
