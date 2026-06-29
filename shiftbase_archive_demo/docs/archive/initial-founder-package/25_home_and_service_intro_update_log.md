# Home and Service Intro Update Log

Date: 2026-05-15

## Summary

오늘 작업은 Shiftbase의 기본 페이지 세팅을 마무리하는 방향으로 진행했다.

주요 범위는 다음과 같다.

- 메인 홈 구조 정리
- 서비스 소개 페이지 신설 및 히어로 개선
- 강의 컨테이너 카드 구조 개선
- 목업 강의 및 썸네일 자산 추가
- 헤더 메뉴 재정리
- 히어로 배너 전환 UI 개선
- 디자인 시스템 컬러 기준 반영

## Design System

현재 브랜딩 컬러 기준은 다음과 같다.

| Role | Name | Hex | Usage |
|---|---|---|---|
| Main | Indigo Shift | `#4F46E5` | 주요 버튼, 활성 상태, 브랜드 중심색 |
| Sub | Sky Wing | `#BAE6FD` | 밝은 배경, 보조 강조, 히어로 진행 게이지 |
| Accent | Electric Violet | `#8B5CF6` | AI/지능 관련 강조, 일부 메쉬 그라데이션 |
| Base | Soft Slate | `#F8FAFC` | 기본 페이지 배경, 학습 환경 톤 |

히어로 메쉬 배경에는 움직임 식별을 위해 앰버 계열 `#FBBF24`가 제한적으로 추가되었다.

## Header

헤더는 로그인 중심 구조로 단순화했다.

중앙 메뉴:

- 학습
- 코스
- 커뮤니티

우측 보조 메뉴:

- 서비스 소개
- for business
- 로그인

변경 사항:

- 기존 `Shiftbase` 메뉴명을 `서비스 소개`로 변경
- `시작하기` 버튼 제거
- 가격 안내, 고객지원 메뉴 제거

## Main Home

메인 홈은 학습 컨테이너 탐색 중심으로 재구성했다.

현재 섹션 흐름:

1. 히어로 배너
2. 무료로 시작하기
3. BEST
4. NEW

하단 배너 섹션은 제거했다.

### Hero Banner

히어로는 텍스트와 CTA를 DOM으로 올리는 방식에서 이미지 배너 중심으로 변경했다.

현재 방식:

- 배너 이미지 자체에 문구 포함
- 배너 전체가 링크 역할
- 텍스트 DOM과 CTA 버튼 제거
- 자동 크로스페이드 전환 유지

추가된 히어로 이미지:

- `/assets/hero/home-hero-workshift.svg`
- `/assets/hero/home-hero-workmap.svg`
- `/assets/hero/home-hero-output.svg`

전환 컨트롤:

- 숫자형 `< n / n >` 제거
- 작은 `<` / `>` 버튼과 dot 형태로 변경
- 활성 dot은 비활성 dot보다 약간 크게 표시
- 자동 전환 시간 게이지는 컨트롤과 분리하여 배너 하단 라인으로 표시
- 수동 전환 시 자동 전환 타이머가 다시 시작되도록 수정
- 어두운 배너에서는 `#BAE6FD`, 밝은 배너에서는 `#4F46E5` 게이지 사용
- 게이지 두께는 `2px`

### Free Start Section

BEST 위에 `무료로 시작하기` 섹션을 추가했다.

카테고리:

- 무료
- 얼리버드
- 왕초보

동작:

- 카테고리 클릭 시 섹션 제목과 카드 목록 전환
- 좌우 넘김 버튼은 UI만 추가, 실제 슬라이드 동작은 아직 미구현

카드 표시:

- 상단 썸네일
- 강의 제목
- 간단 설명
- 가격
- 별점
- 리뷰 수

뱃지 표시:

- 미니 카드에서는 `대표 강의`, `NEW`, `BEST` 같은 뱃지 표시를 제거했다.

### BEST and NEW Sections

BEST와 NEW 섹션은 동일한 카드 구조를 사용한다.

변경 사항:

- 필터 버튼을 제목 우측에서 제목 아래로 이동
- 기본 표시를 4x2 그리드로 변경
- 각 섹션 하단에 `전체 학습 컨테이너 확인하기` 버튼 추가
- BEST 카드의 `BEST 1`, `BEST 2` 랭크 뱃지 제거

카드 표시:

- 상단 썸네일
- 레벨
- 시간
- 모듈 수
- 제목
- 설명
- 가격
- 별점
- 리뷰 수

`바로 보기` CTA는 제거했다.

## Service Intro Page

서비스 소개 페이지는 `/shiftbase` 경로로 구성했다.

히어로:

- 기존 `video.mp4` 연결 제거
- CSS 기반 grainy mesh gradient 배경으로 대체
- 여러 개의 메쉬 블롭과 grain 텍스처가 움직이는 구조
- 보라, 하늘, 인디고 컬러에 앰버 포인트를 제한적으로 추가
- 텍스트는 다음과 같이 정리
  - `당신의 일에`
  - `AI라는 날개를 달아보세요`
  - `Shiftbase는 누구나 AI를 손쉽게 다루는 세상을 꿈꿉니다.`
- 히어로 버튼 제거

섹션 변경:

- `왜 Shiftbase인가?`를 `Shiftbase로 AI를 배워보세요.`로 변경
- 설명을 `우리의 삶은 AI로 변화할 것입니다. AI를 잘 다루게 도와드릴게요.`로 변경
- `이런 분께 추천합니다`를 `이런 분들을 위해 준비했어요`로 변경
- `이렇게 학습합니다` 섹션 제거
- `이런 것을 배울 수 있어요` 섹션 제거
- FAQ는 유지

추천 대상 카드:

- 4개 항목에 플랫 2D 캐릭터 일러스트 추가
- 일러스트는 4분할 생성 이미지에서 분리 저장

추가된 자산:

- `/assets/audiences/ai-beginner.png`
- `/assets/audiences/automation-worker.png`
- `/assets/audiences/team-leader.png`
- `/assets/audiences/result-learner.png`

## Course Content

기존 강의 외에 목업 강의를 추가해 홈 카드 구성을 채웠다.

현재 주요 강의:

- 내 업무를 AI로 전환하기
- AI 리서치 실무
- AI 보고서 작성
- 사내 Q&A 봇 만들기
- ChatGPT 업무 입문
- 프롬프트 템플릿 실습
- AI 엑셀 자동화
- AI 회의록 정리

새 목업 강의는 상세 페이지가 깨지지 않도록 기존 `Course` 타입 구조를 모두 채웠다.

카드용 표시 메타:

- 가격
- 별점
- 리뷰 수

위 값은 `lib/courseDisplay.ts`에서 관리한다.

## Assets Added

Course thumbnails:

- `/assets/courses/ai-research.png`
- `/assets/courses/ai-report-writing.png`
- `/assets/courses/internal-qa-bot.png`
- `/assets/courses/chatgpt-workflow.png`
- `/assets/courses/prompt-template.png`
- `/assets/courses/ai-excel-automation.png`
- `/assets/courses/ai-meeting-notes.png`

Audience illustrations:

- `/assets/audiences/ai-beginner.png`
- `/assets/audiences/automation-worker.png`
- `/assets/audiences/team-leader.png`
- `/assets/audiences/result-learner.png`

Hero banners:

- `/assets/hero/home-hero-workshift.svg`
- `/assets/hero/home-hero-workmap.svg`
- `/assets/hero/home-hero-output.svg`

## Files Changed

Main files:

- `app/page.tsx`
- `app/shiftbase/page.tsx`
- `app/globals.css`
- `components/SiteShell.tsx`
- `components/home/HomeHero.tsx`
- `components/home/FreeStartSection.tsx`
- `lib/content.ts`
- `lib/courseDisplay.ts`

## Verification

요청에 따라 후반 작업부터 브라우저 렌더링 테스트는 수행하지 않았다.

수행한 검증:

- `npm run typecheck`

현재 마지막 타입 체크는 통과했다.

## Remaining Notes

추후 결정이 필요한 항목:

- `무료로 시작하기` 좌우 버튼의 실제 슬라이드 동작
- 카테고리별 코스 분류 규칙의 실제 운영 기준
- 히어로 배너 이미지를 최종 브랜드 비주얼로 다시 제작할지 여부
- 별점/리뷰 수를 실제 데이터 모델로 옮길지 여부

## Follow-up Update

오늘 추가 작업은 홈 히어로와 브랜드 표시를 최종 시안에 맞추는 방향으로 진행했다.

### Hero Banner Update

히어로 배너 이미지를 기존 SVG 중심 구성에서 WebP 이미지 중심으로 교체했다.

현재 홈 히어로 이미지:

- `/assets/hero/launching.webp`
- `/assets/hero/banner1.webp`
- `/assets/hero/banner2.webp`

배너 영역은 생성 이미지 기준에 맞춰 조정했다.

- 최종 표시 기준: `1600 x 408`
- 적용 비율: `aspect-[200/51]`
- 수정 파일: `components/home/HomeHero.tsx`

### Logo Update

루트에 있던 `logo.png`를 웹에서 사용할 수 있도록 `public/assets/logo.png`로 복사했다.

헤더와 푸터의 기존 텍스트형 로고는 이미지 로고로 교체했다.

- 수정 파일: `components/SiteShell.tsx`
- 사용 이미지: `/assets/logo.png`

### Brand Rename

프로젝트 표시명을 `AX Workshift`에서 `Shiftbase`로 변경했다.

반영 범위:

- 브랜드 상수
- 페이지 메타 타이틀
- 홈 히어로 문구
- 푸터 저작권 문구
- 문서 내 브랜드명

후속 작업에서 서비스 소개 라우트는 `/shiftbase` 경로로 변경했다.

### Verification

이번 추가 작업은 요청에 따라 재빌드와 브라우저 테스트를 수행하지 않았다.
