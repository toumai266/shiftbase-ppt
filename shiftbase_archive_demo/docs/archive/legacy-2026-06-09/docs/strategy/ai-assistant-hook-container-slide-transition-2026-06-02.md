# AI 비서 후킹 컨테이너 전환 계획

작성일: 2026-06-02  
대상 컨테이너: `ai-personal-assistant-after-hours`  
상태: 출시 초기 메인 후킹 컨테이너 전환 기준

## 1. 제품 결정

`퇴근 후 1시간, 나만의 AI 비서 만들기`를 출시 초기 메인 후킹 컨테이너로 둔다.

이 컨테이너의 역할은 단순 무료 맛보기가 아니다. 독자가 "AI 웹북은 그냥 전자책이 아니라 실제 업무 장면을 다루는 실습형 학습 제품"이라고 느끼게 만드는 첫 경험이다.

따라서 핵심 구매 이유는 다음으로 잡는다.

- AI 비서를 갖고 싶다는 욕망을 실제 설정과 운영 기준으로 바꾼다.
- Hermes와 OpenClaw를 모두 경험하게 한다.
- Telegram과 Discord 연결을 개발자 포털, 봇 생성, 토큰, 권한, 초대, pairing 또는 allowlist까지 실제 단계로 다룬다.
- 후반부에서는 이메일 보고, 일정 관리, 주간 회고, 메모·할 일 확장으로 이어지는 활용 루틴을 보여준다.
- 자동화 욕망을 자극하되, 첫 7일은 읽기, 요약, 초안, 확인 질문까지만 허용한다.

## 2. 기존 구조에서 바꿀 점

기존 학습 플레이어는 좌측 본문과 우측 workspace가 동시에 보이는 책형 구조다. 이 방식은 설명과 보조 자료를 나란히 보여줄 때는 안정적이지만, 실제 업무 공간을 재현하기에는 좁다.

이번 전환에서는 `page`를 사용자 경험의 단위로 부르지 않는다. 내부 JSON 호환을 위해 `pages` 필드는 유지하되, 학습자에게는 `slide`처럼 보이게 한다.

새 흐름:

```text
설명 슬라이드
-> 매뉴얼 슬라이드
-> 실습 슬라이드
-> 점검/결과 슬라이드
```

좌측 고정 본문은 AI 비서 컨테이너에서 우선 해제한다. 한 화면 안에 본문, 참고 자료, 체크리스트, 실습 캔버스를 배치하고, PowerPoint 슬라이드를 넘기듯 다음 화면으로 이동한다.

## 3. 학습 경험 원칙

모든 슬라이드가 인터랙티브일 필요는 없다.

형식 선택 기준:

| 슬라이드 역할 | 권장 형식 |
| --- | --- |
| 욕망과 문제 제기 | 짧은 본문, 사례, before/after |
| 기술 매뉴얼 | 단계별 설명, 체크리스트, 참고 이미지 |
| 설정 실습 | 큰 실습 화면, 설정 카드, 입력/선택 UI |
| 활용 확장 | 시나리오, 명령 예시, 운영 루틴 |
| 안전 점검 | 금지 행동, 권한 회수, troubleshooting |

인터랙티브는 독자가 실제로 선택, 입력, 분류, 수정, 저장해야 할 때만 사용한다.

## 4. 컨테이너 커리큘럼 구조

초기 출시용 AI 비서 컨테이너는 6개 모듈로 재편한다.

1. AI 비서로 무엇을 얻을 것인가
   - 봇이 아니라 개인 운영 능력을 얻는다는 관점
   - 맡길 일, 맡기면 안 되는 일, 첫 7일 금지선
   - 내 비서 역할 선언문

2. Hermes와 OpenClaw 준비하기
   - Hermes와 OpenClaw의 차이
   - 로컬, WSL, VPS, Node, 모델 provider, API key 준비
   - gateway, agent runtime, 권한 경계

3. Telegram으로 첫 AI 비서 연결하기
   - BotFather 사용법
   - bot username, token, token 보관과 재발급
   - Hermes gateway 연결
   - OpenClaw Telegram channel 연결
   - DM pairing, allowlist, privacy mode, 첫 응답 점검

4. Discord로 팀·커뮤니티 비서 연결하기
   - Discord Developer Portal 사용법
   - Application 생성, Application ID, bot token
   - Message Content Intent, OAuth2 install link, bot 초대 권한
   - 서버 채널과 DM의 차이
   - Hermes/OpenClaw Discord 연결과 troubleshooting

5. 이메일 보고와 일정 브리핑 붙이기
   - Gmail API 또는 도구 커넥터의 읽기 전용 연결
   - Google Cloud project, API enable, OAuth consent, Desktop app credential, `credentials.json`
   - Gmail `messages.list/get` 기준의 최소 요약
   - Google Calendar API, `events.list`, 오늘 일정 브리핑
   - Telegram/Discord로 원문이 아니라 요약 카드만 보내기

6. 첫 14일 운영과 확장
   - 아침 브리핑, 퇴근 정리, 주간 회고
   - 메모, 할 일, Drive, Notion, Slack 같은 확장 후보
   - 자동 발송, 삭제, 결제, 예약 금지
   - token 회수, OAuth 권한 철회, 로그 확인
   - AI 비서 운영 규칙 완성

## 5. 실습 환경 방향

AI 비서 컨테이너의 실습은 작은 체크박스가 아니라 가상 업무 공간이어야 한다.

우선 구현할 실습:

1. 비서 역할 선언 실습
   - 욕망, 입력 자료, 보고 시간, 금지 행동을 선택해 선언문을 만든다.

2. Telegram 설정 점검 실습
   - BotFather token, gateway 상태, pairing, allowlist를 순서대로 점검한다.

3. Discord 설정 점검 실습
   - Application ID, bot token, intents, invite permissions, server channel을 확인한다.

4. Gmail·Calendar 브리핑 설계 실습
   - 읽지 않은 메일 3개, 오늘 일정 3개, 확인 필요 항목을 브리핑 카드로 만든다.

5. 운영 규칙 실습
   - 허용 행동, 금지 행동, 사람 승인 조건, token 회수 방법을 한 장으로 남긴다.

## 6. 구현 단계

### 1단계: 호환형 slide mode

- `ContainerSpec`에 선택적 `learningExperience.mode`를 추가한다.
- 값이 `slide`인 컨테이너는 기존 좌우 분할 대신 슬라이드형 플레이어로 렌더링한다.
- 내부 데이터는 기존 `pages`를 유지한다.
- AI 비서 컨테이너에 먼저 적용한다.

### 2단계: AI 비서 콘텐츠 재편

- 현재 4모듈 16페이지 구조를 6모듈 슬라이드 흐름으로 바꾼다.
- Hermes/OpenClaw, Telegram/Discord, Gmail/Calendar 매뉴얼을 별도 모듈로 분리한다.
- "1시간 안에 모든 연동 완료"처럼 과장될 수 있는 문장은 "1시간 안에 첫 안전 브리핑 구조와 첫 채널 연결을 만든다"로 조정한다.

### 3단계: 업무 공간형 실습 블록 확장

- 기존 `code-canvas`를 당장 버리지 않는다.
- AI 비서 컨테이너에서는 먼저 HTML 기반 실습 캔버스를 넣어 가상 inbox/calendar/channel 경험을 만든다.
- 이후 별도 `workbench` 블록 타입을 설계한다.

### 4단계: 다른 컨테이너 전환 판단

- AI 비서 컨테이너의 학습 경험이 통과되기 전까지 다른 컨테이너 전체 구조를 일괄 전환하지 않는다.
- 메일, 회의, 보고서, 스프레드시트, CS, 리스크 컨테이너는 각 1개 대표 workbench를 기준으로 전환한다.

## 7. 품질 통과 조건

AI 비서 후킹 컨테이너는 다음 조건을 통과해야 한다.

- 초보자가 무엇을 만들 수 있는지 첫 3분 안에 이해한다.
- Hermes와 OpenClaw가 이름만 언급되지 않고 실제 연결 흐름으로 다뤄진다.
- Telegram과 Discord가 단순 채널 소개가 아니라 봇 생성, token, 권한, 초대, pairing까지 설명된다.
- Gmail과 Google Calendar는 읽기 전용, 최소 권한, 원문 미전송 원칙을 포함한다.
- 후반부는 도구 연결이 아니라 실제 생활·업무 루틴으로 확장된다.
- 슬라이드형 경험이 기존 좌우 페이지보다 덜 답답해야 한다.
- 인터랙티브 수가 아니라 독자의 판단과 운영 규칙이 남아야 한다.

## 8. 참고 공식 문서

- Hermes Agent: https://github.com/nousresearch/hermes-agent
- OpenClaw Docs: https://docs.openclaw.ai/
- OpenClaw Telegram channel: https://docs.openclaw.ai/channels/telegram
- OpenClaw Discord channel: https://docs.openclaw.ai/channels/discord
- Telegram Bot features: https://core.telegram.org/bots/features
- Discord Developer Quick Start: https://docs.discord.com/developers/quick-start/getting-started
- Discord OAuth2 and permissions: https://docs.discord.com/developers/platform/oauth2-and-permissions
- Gmail API Node.js Quickstart: https://developers.google.com/workspace/gmail/api/quickstart/nodejs
- Google Calendar API Node.js Quickstart: https://developers.google.com/workspace/calendar/api/quickstart/nodejs
