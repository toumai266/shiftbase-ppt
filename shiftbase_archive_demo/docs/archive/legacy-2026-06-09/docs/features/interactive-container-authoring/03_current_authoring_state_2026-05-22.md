# Current Authoring State - 2026-05-22

이 문서는 2026-05-22 기준 세부 모듈/페이지 저작 구조의 현재 결정을 기록합니다.

기존 `00_overview`, `01_page_and_workspace_spec`, `02_prd`는 초기 스펙 기반 블록 조합 방향을 담고 있습니다. 현재 구현 방향은 그보다 한 단계 바뀌었으므로, 실제 작업 기준은 이 문서를 우선합니다.

## 현재 결론

세부 페이지는 책처럼 좌우 2페이지 구조를 유지합니다.

```text
좌측: 학습 본문
우측: 실행형 artifact, 정적 참고 이미지, 매뉴얼 카드, 비교표, 예시, 결과 정리
```

우측은 더 이상 블록 프리셋을 기계적으로 조립하는 CMS가 아닙니다. 다만 우측이 항상 `code-canvas` 기반의 실행형 Agent Artifact Canvas일 필요도 없습니다. 콘텐츠 이해에 더 적합하다면 단순 매뉴얼, 참고 이미지, 예시 목록, 체크리스트, 결과 카드 같은 정적 구성을 사용합니다.

## 편집 원칙

- 편집 화면과 학습자 화면은 가능한 한 같은 구조를 보여야 합니다.
- 좌우 페이지 안에 카드 안 카드 구조를 만들지 않습니다.
- 좌측 본문과 우측 artifact는 큰 작업면 위에 직접 놓습니다.
- 보조 UI는 툴바, 1px 구분선, 입력 컨트롤 정도로 제한합니다.
- 설명용 라벨, 상태 연결, 블록 타입, 레이아웃 드롭다운 같은 내부 구현 표시는 기본 저작 화면에 노출하지 않습니다.
- 우측은 고정 컴포넌트/프리셋을 고르는 영역이 아니라, 페이지 이해를 돕는 작업면입니다. 실행 캔버스가 필요한 페이지도 있고, 정적 매뉴얼이나 참고 이미지가 더 좋은 페이지도 있습니다.
- 인터랙티브 수, code-canvas 수, 클릭 요소 수를 품질 근거로 삼지 않습니다.

## 좌측 본문

좌측은 `bodyMarkdown`을 저장 원본으로 사용합니다.

현재 호환을 위해 `paragraphs`, `checkpoints`, `footnote` 필드가 남아 있을 수 있지만, 저작 화면과 학습자 화면의 기준은 `bodyMarkdown`입니다.

현재 좌측 편집 UI:

- 페이지 제목
- 본문 제목
- WYSIWYG 스타일 본문 편집기
- 이미지 첨부
- 기본 서식 툴바
- 보기 모달

제거한 것:

- `읽으며 확인할 것`
- 각주 편집 영역
- 자동으로 붙는 교훈형/안내용 문구
- 체크리스트를 좌측 본문 기본 구조로 강제하는 방식

## 우측 Workspace와 Artifact

우측은 `code-canvas` 타입을 사용할 수 있지만, 제품 개념은 블록 수나 인터랙티브 수가 아니라 학습자가 이해하고 판단하게 만드는 보조 표면입니다.

우측 형식은 다음 중에서 페이지 목적에 맞게 고릅니다.

- 단순 매뉴얼: 준비물, 제약, 단계별 확인, 실패 시 조치
- 참고 이미지: 화면 구조, 설정 위치, 업무 흐름, 결과물 예시
- 비교표와 예시 목록: before/after, 허용/금지, 도구 선택 기준
- 체크리스트와 결과 카드: 누락 방지, 최종 기준 정리
- `code-canvas`: 사용자가 입력, 선택, 분류, 수정, 저장해야 하는 작은 도구

`code-canvas`는 복잡한 상호작용이 실제 학습 판단을 강화할 때만 선택합니다.

## code-canvas 저장 단위

저장 단위:

```ts
{
  kind: "html" | "react" | "canvas" | "image" | "mixed",
  artifactId: string,
  prompt: string,
  promptHistory: Array<{ role: "user" | "assistant"; text: string; createdAt: string }>,
  entry: "index.html",
  files: Record<string, string>,
  assets: Array<{ path: string; mime: string; role?: string }>,
  runtime: "sandboxed-iframe",
  version: number,
  status: "draft" | "generating" | "generated" | "verified" | "failed",
  notes?: string,
  generatedAt?: string,
  model?: string,
  lastError?: string
}
```

렌더링:

- `CodeCanvasFrame`이 `files[entry]`를 sandbox iframe으로 표시합니다.
- 학습자 화면도 동일하게 `files[entry]`를 우선 사용합니다.
- iframe은 부모 React 트리에 생성 코드를 직접 실행하지 않습니다.

## Agent 생성 흐름

현재 생성 흐름:

```text
저작자 자연어 입력
-> /api/local-cms/artifacts/generate
-> openai-oauth 프록시
-> /v1/responses
-> kind/entry/files/notes 반환
-> 우측 iframe 프리뷰 반영
-> 페이지 저장
```

프록시가 떠 있지 않으면 생성 버튼은 비활성 또는 실패 상태가 됩니다. 더미 성공이나 가짜 artifact를 반환하지 않습니다.

로컬 OAuth 프록시 실행:

```powershell
npx -y openai-oauth --port 10531
```

상태 확인:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/local-cms/artifacts/generate" -UseBasicParsing
```

정상 응답 예:

```json
{
  "ok": true,
  "available": true,
  "oauthUrl": "http://127.0.0.1:10531",
  "model": "gpt-5.5"
}
```

## 로컬 백엔드

현재 저작 백엔드는 로컬 환경에서만 사용합니다.

권장 로컬 설정:

```text
SHIFTBASE_AUTHORING_BACKEND=sqlite
SHIFTBASE_LOCAL_DB_PATH=.shiftbase/authoring.sqlite
SHIFTBASE_OPENAI_OAUTH_URL=http://127.0.0.1:10531
```

현재 저장 경로:

- 컨테이너 스펙: SQLite 또는 local-file provider
- 이미지 자산: `public/assets/cms/{slug}/`
- artifact 코드: 컨테이너 스펙 내부 `workspace.blocks[].props.files`

PostgreSQL 전환 시에는 컨테이너 JSON, 버전 이력, artifact 파일 묶음, 자산 메타데이터를 분리할 수 있어야 합니다.

## 현재 주요 파일

- `components/cms/AuthoringWorkflow.tsx`
- `components/lesson/InteractiveLessonPlayer.tsx`
- `components/lesson/CodeCanvasFrame.tsx`
- `lib/containerSpec.ts`
- `lib/backend/agentArtifactGenerator.ts`
- `app/api/local-cms/artifacts/generate/route.ts`
- `lib/backend/sqliteContainerRepository.ts`
- `lib/backend/containerService.ts`

## 현재 남은 리스크

- `code-canvas`라는 타입명은 기존 블록 구조와 호환하기 위해 남아 있지만, 제품 개념은 artifact입니다. 이후 명칭 정리가 필요할 수 있습니다.
- artifact를 스펙 JSON 내부에 저장하는 방식은 MVP에는 단순하지만, artifact가 커지면 별도 테이블/파일 저장소가 필요합니다.
- OAuth 프록시는 Next 서버와 별개 프로세스입니다. 꺼지면 생성이 되지 않습니다.
- AI 생성 코드는 sandbox iframe에서 실행되지만, 허용 범위와 CSP 정책은 계속 점검해야 합니다.
- 오래된 문서에는 블록 조합형 CMS 방향이 남아 있습니다. 신규 작업자는 이 문서를 우선 읽어야 합니다.

## 다음 작업 후보

1. 좌우 편집 화면의 시각 밀도를 더 낮추고 실제 책 페이지처럼 정리합니다.
2. artifact 생성 결과의 저장/버전 비교 UI를 추가합니다.
3. `code-canvas` 내부 명칭을 artifact 중심으로 정리합니다.
4. PostgreSQL 전환 문서를 별도로 작성합니다.
5. 실제 콘텐츠 제작을 시작하면서 좌측 본문과 우측 artifact의 반복 패턴을 확정합니다.
