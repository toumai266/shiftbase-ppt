import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content", "containers");
const visualRoot = path.join(root, "public", "assets", "ai-webbook");
const updatedAt = "2026-05-31";
const premiumBitmapCover = "/assets/ai-webbook/ai-webbook-premium-cover.png";

const sourceReferences = [
  {
    label: "OpenAI prompt engineering best practices",
    url: "https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices"
  },
  {
    label: "Google Workspace Gemini prompting guide",
    url: "https://support.google.com/a/users/answer/14590328?hl=en"
  },
  {
    label: "Microsoft 365 Copilot prompting guide",
    url: "https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-writing-prompts-in-microsoft-365-copilot"
  },
  {
    label: "Anthropic context engineering notes",
    url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"
  }
];

const contexts = {
  "ai-youtube-to-workbook-system": {
    scene: "점심시간에 저장해 둔 유튜브 AI 강의 세 편을 오후 팀 교육 자료로 바꿔야 하는 상황",
    lens: "한국 조직에서는 '좋은 팁'보다 '우리 팀 업무에 바로 적용 가능한 절차'가 더 설득력이 있습니다.",
    sample: "영상 제목, 핵심 장면 타임스탬프, 댓글에서 반복되는 질문, 우리 팀 업무 예시",
    sensitive: "강의자 표현을 그대로 베끼지 않고 출처와 변형 범위를 남깁니다.",
    reader: "팀장, 사내 교육 담당자, 신규 입사자",
    visual: "유튜브 강의 조각이 업무 웹북 카드로 재배열되는 편집 보드"
  },
  "ai-prompt-operating-system": {
    scene: "매번 다른 표현으로 AI에게 부탁하다가 결과 품질이 들쑥날쑥해진 팀의 공통 프롬프트 정비 시간",
    lens: "상사에게 공유할 결과물은 '빠르게'보다 '검토 가능한 형식'과 '책임 표현'이 먼저입니다.",
    sample: "업무 목적, 대상 독자, 참고 자료, 원하는 말투, 금지 표현",
    sensitive: "실명, 내부 숫자, 고객 정보는 예시 값으로 치환한 뒤 입력합니다.",
    reader: "사무직 실무자, 팀 리더, 업무 자동화 담당자",
    visual: "목표, 맥락, 자료, 출력 형식이 조립되는 프롬프트 콘솔"
  },
  "ai-research-source-synthesis": {
    scene: "월요일 오전 회의 전에 시장 자료와 경쟁사 글을 근거 있는 한 장 브리프로 줄여야 하는 상황",
    lens: "한국식 보고에서는 결론만큼 '어디서 확인했는가'와 '그래서 우리에게 무슨 의미인가'가 중요합니다.",
    sample: "기사 링크, 공식 문서, 영상 요약, 경쟁사 페이지, 내부 질문",
    sensitive: "출처가 불명확한 수치와 오래된 자료는 결론이 아니라 확인 필요 항목으로 둡니다.",
    reader: "기획자, PM, 시장조사 담당자",
    visual: "흩어진 출처가 주장-근거 매트릭스로 정렬되는 리서치 데스크"
  },
  "ai-email-document-communication": {
    scene: "오전 메일함에 쌓인 요청, 공지, 회신 초안을 점심 전까지 정리해야 하는 상황",
    lens: "한국 업무 메일은 내용만 맞아도 부족합니다. 예의, 책임 범위, 회신 기한 표현이 같이 맞아야 합니다.",
    sample: "메일 원문, 상대 직책, 이전 합의, 요청 기한, 회신 목적",
    sensitive: "상대방의 의도를 단정하거나 회사 입장을 확정하는 표현은 사람이 최종 확인합니다.",
    reader: "사무직 실무자, 비서/총무 담당자, 고객 접점 담당자",
    visual: "메일 스레드가 요청, 확인 질문, 답장 초안으로 나뉘는 커뮤니케이션 보드"
  },
  "ai-meeting-action-system": {
    scene: "회의는 끝났지만 결정사항, 담당자, 다음 일정이 뒤섞여 회의록 작성이 밀린 상황",
    lens: "회의록은 기록물이면서 약속 문서입니다. 누가 무엇을 언제까지 할지 불편하지 않게 분명해야 합니다.",
    sample: "회의 안건, 발언 메모, 결정된 항목, 미결 질문, 참석자 역할",
    sensitive: "확정되지 않은 의견을 결정사항처럼 쓰지 않도록 상태를 구분합니다.",
    reader: "프로젝트 운영자, 팀장, 회의록 담당자",
    visual: "회의 대화가 결정, 할 일, 리스크 카드로 분류되는 액션 보드"
  },
  "ai-spreadsheet-analysis-automation": {
    scene: "월말 엑셀 파일에서 누락, 중복, 이상값을 찾고 보고 문장까지 만들어야 하는 상황",
    lens: "숫자 업무는 빠른 요약보다 재현 가능한 절차와 원본 대조가 우선입니다.",
    sample: "열 이름, 샘플 행, 집계 목적, 제외 기준, 보고 대상",
    sensitive: "개인 식별 정보와 원본 금액은 필요한 범위만 익명화해서 사용합니다.",
    reader: "재무/운영/영업지원 실무자, 데이터 초보자",
    visual: "엑셀 표가 오류 점검, 집계, 보고 문장으로 변환되는 분석 패널"
  },
  "ai-report-writing-dashboard": {
    scene: "자료는 충분하지만 보고서의 첫 장, 목차, 결론 문장이 잡히지 않는 상황",
    lens: "한국식 보고서는 독자가 궁금해하는 결론, 근거, 요청사항이 앞에서 보여야 읽힙니다.",
    sample: "보고 목적, 독자 직책, 핵심 자료, 필요한 의사결정, 제외할 내용",
    sensitive: "AI가 만든 과장된 성과 표현과 확정되지 않은 전망은 제거합니다.",
    reader: "기획자, 실무 리더, 보고서 초안 작성자",
    visual: "흩어진 자료가 결론-근거-요청 구조로 정리되는 보고서 대시보드"
  },
  "ai-slide-presentation-builder": {
    scene: "발표 시간이 짧아 슬라이드마다 한 메시지만 남겨야 하는 상황",
    lens: "발표자료는 예쁜 장표보다 '상사가 바로 질문할 지점'을 먼저 막아야 합니다.",
    sample: "발표 목적, 청중, 제한 시간, 핵심 근거, 예상 질문",
    sensitive: "디자인 장식으로 핵심 수치와 의사결정 요청이 흐려지지 않게 합니다.",
    reader: "기획자, 영업지원, 교육 담당자",
    visual: "슬라이드 카드가 문제, 근거, 제안, 다음 행동 순서로 놓이는 스토리보드"
  },
  "ai-customer-support-playbook": {
    scene: "반복 문의가 몰려 같은 답변을 여러 번 쓰지만 고객마다 상황은 조금씩 다른 상황",
    lens: "고객 응대에서는 속도와 함께 사과, 확인, 안내, 책임 범위의 순서가 중요합니다.",
    sample: "문의 원문, 고객 상태, 주문/계약 정보 범주, 정책 문서, 금지 답변",
    sensitive: "보상, 환불, 법적 책임은 AI가 확정하지 않고 승인 기준으로 넘깁니다.",
    reader: "고객지원 담당자, 운영 매니저, CS 리더",
    visual: "고객 문의가 유형, 긴급도, 확인 질문, 답변 초안으로 흐르는 상담 플레이북"
  },
  "ai-hr-onboarding-recruiting": {
    scene: "채용 공고, 후보자 요약, 입사 안내문을 동시에 정리해야 하는 HR 운영 주간",
    lens: "HR 문서는 친절해야 하지만 평가와 개인정보를 다루므로 근거와 표현의 경계가 엄격해야 합니다.",
    sample: "직무 요구사항, 후보자 공개 이력, 온보딩 일정, 회사 안내 문서",
    sensitive: "나이, 성별, 가족, 건강 등 직무와 무관한 민감 요소는 제외합니다.",
    reader: "HR 담당자, 채용 매니저, 온보딩 운영자",
    visual: "채용과 온보딩 자료가 공정성 필터를 거쳐 운영 패키지로 묶이는 HR 보드"
  },
  "ai-marketing-content-engine": {
    scene: "캠페인 일정은 다가오는데 메시지, 소재, 채널별 문안이 동시에 필요한 상황",
    lens: "한국 시장 문안은 과장보다 공감, 혜택보다 상황 이해, 유행어보다 브랜드 신뢰가 오래갑니다.",
    sample: "타깃 고객, 캠페인 목표, 제품 장점, 금지 주장, 채널 목록",
    sensitive: "검증되지 않은 효능, 비교 광고, 저작권이 있는 표현을 피합니다.",
    reader: "마케터, 콘텐츠 담당자, 브랜드 매니저",
    visual: "캠페인 브리프가 채널별 카피와 이미지 프롬프트로 확장되는 콘텐츠 엔진"
  },
  "ai-sales-proposal-followup": {
    scene: "고객 미팅 직후 제안서 방향, 내부 요청, 팔로업 메일을 빠르게 정리해야 하는 상황",
    lens: "영업 문서는 적극적이어야 하지만 가격, 일정, 보장 표현은 회사가 책임질 수 있는 선 안에 있어야 합니다.",
    sample: "고객 요구, 미팅 메모, 제안 범위, 내부 가능 일정, 경쟁 상황",
    sensitive: "확정 전 가격, 납기, 성과 보장을 단정하지 않습니다.",
    reader: "영업지원, 세일즈 매니저, 사업개발 담당자",
    visual: "고객 요구가 제안 논리, 견적 설명, 후속 메일로 나뉘는 영업 파이프라인"
  },
  "ai-finance-closing-review": {
    scene: "마감 전 증빙 누락, 비용 분류, 예외 설명을 빠르게 정리해야 하는 월말",
    lens: "재무 업무에서 AI는 판단자가 아니라 누락을 줄이는 보조자입니다. 최종 책임은 검토자에게 남습니다.",
    sample: "정산 항목, 증빙 상태, 비용 계정 후보, 내부 규정, 예외 사유",
    sensitive: "실제 계좌, 주민번호, 급여, 카드번호는 입력하지 않습니다.",
    reader: "재무/회계 담당자, 정산 운영자, 관리자",
    visual: "정산 데이터가 증빙, 분류, 예외, 승인 체크로 흐르는 마감 검토판"
  },
  "ai-admin-operations-automation": {
    scene: "행사 신청, 비품 요청, 업체 연락, 공지를 한 사람이 동시에 처리해야 하는 운영 주간",
    lens: "총무 업무는 작아 보여도 누락되면 바로 불편이 생깁니다. AI는 반복 안내와 취합에서 힘을 냅니다.",
    sample: "공지 목적, 신청 항목, 대상자, 마감일, 예외 처리 기준",
    sensitive: "개인 연락처와 참석 불가 사유는 최소한만 다룹니다.",
    reader: "총무 담당자, 운영 매니저, 사무 지원 인력",
    visual: "공지, 신청, 취합, 리마인드가 자동화 후보로 정리되는 운영 콘솔"
  },
  "ai-agent-workflow-orchestration": {
    scene: "AI 에이전트를 붙이고 싶지만 어디까지 자동화하고 어디서 사람이 승인해야 할지 불분명한 상황",
    lens: "한국 조직에서는 완전 자동화보다 승인선, 로그, 예외 보고가 설득의 핵심입니다.",
    sample: "업무 목표, 사용 도구, 입력 자료, 실패 시 처리, 승인자",
    sensitive: "외부 발송, 결제, 인사 평가, 법무 판단은 사람 승인 없이 실행하지 않습니다.",
    reader: "운영 리더, 자동화 담당자, AI 도입 PM",
    visual: "AI 에이전트가 도구를 호출하고 사람 승인 지점을 통과하는 업무 흐름도"
  },
  "ai-knowledge-base-notebook": {
    scene: "사내 문서와 공개 자료가 흩어져 같은 질문에 매번 다른 답을 찾는 상황",
    lens: "지식베이스는 많이 넣는 것보다 최신 자료, 공식 자료, 실제 쓰는 질문을 남기는 것이 중요합니다.",
    sample: "사내 문서, 공식 링크, 교육 영상 요약, 자주 묻는 질문, 폐기할 문서",
    sensitive: "비공개 문서와 공개 자료를 섞을 때 접근 권한을 분리합니다.",
    reader: "교육 담당자, PM, 사내 지식관리 담당자",
    visual: "자료 폴더가 출처 기반 질문 노트와 답변 카드로 연결되는 지식베이스"
  },
  "ai-risk-privacy-governance": {
    scene: "팀원들이 AI를 쓰기 시작했지만 무엇을 입력해도 되는지 기준이 아직 없는 상황",
    lens: "AI 사용 기준은 금지 목록만으로 작동하지 않습니다. 허용 예시, 승인 예외, 책임자를 같이 정해야 합니다.",
    sample: "업무 유형, 입력 자료 예시, 공개 범위, 승인자, 외부 공유 여부",
    sensitive: "개인정보, 영업비밀, 미공개 실적, 계약 조건은 입력 금지 또는 비식별 처리 대상으로 둡니다.",
    reader: "팀 리더, 보안/개인정보 담당자, AI 운영자",
    visual: "AI 입력물이 민감정보, 저작권, 환각, 승인 기준 필터를 통과하는 거버넌스 게이트"
  }
};

const fallbackContext = {
  scene: "반복 업무를 AI로 줄이고 싶지만 어디서부터 시작해야 할지 정리되지 않은 상황",
  lens: "한국 업무 환경에서는 결과물의 완성도뿐 아니라 공유 방식, 승인선, 책임 표현이 함께 중요합니다.",
  sample: "업무 목적, 참고 자료, 대상 독자, 마감 시간, 검토 기준",
  sensitive: "민감정보는 제거하고 확정되지 않은 판단은 확인 필요 항목으로 남깁니다.",
  reader: "사무직 실무자와 팀 리더",
  visual: "업무 자료가 AI 보조 흐름을 거쳐 검토 가능한 산출물로 바뀌는 보드"
};

const pagePlans = [
  {
    suffix: "학습 목표와 산출물 정하기",
    kind: "intro-summary",
    note: "상용 도서의 첫 장처럼 독자, 문제, 완성물을 한 번에 잡습니다."
  },
  {
    suffix: "공개 자료를 업무 장면으로 옮기기",
    kind: "image-definition",
    note: "유튜브, 블로그, 공식 문서의 조언을 우리 회사 업무 장면과 산출물로 번역합니다."
  },
  {
    suffix: "AI에게 줄 자료와 빼야 할 자료 정하기",
    kind: "checklist",
    note: "자료 범위를 정하는 일은 보안 절차이면서 동시에 답변 품질을 높이는 편집 과정입니다."
  },
  {
    suffix: "프롬프트를 조립하고 바로 비교하기",
    kind: "prompt-lab",
    note: "목표, 맥락, 출력 형식, 검토 기준을 조합해 바로 쓸 수 있는 요청문을 만듭니다."
  },
  {
    suffix: "초안을 비교할 기준 세우기",
    kind: "example-list",
    note: "문장이 자연스러운지보다 근거, 표현 수위, 승인 가능성이 더 중요할 때가 많습니다."
  },
  {
    suffix: "이미지 생성 브리프까지 설계하기",
    kind: "image-brief",
    note: "그림도 목적, 독자, 배경, 거리감, 금지 조건을 먼저 정해야 업무 자료가 됩니다."
  },
  {
    suffix: "위험 신호와 승인선을 분리하기",
    kind: "quality-gate",
    note: "AI를 잘 쓰는 팀은 더 많이 맡기는 팀이 아니라 멈춰야 할 지점을 분명히 아는 팀입니다."
  },
  {
    suffix: "한국식 협업 문장으로 다듬기",
    kind: "example-list",
    note: "같은 내용도 직책, 관계, 회의 맥락에 따라 표현 수위가 달라집니다."
  },
  {
    suffix: "웹북 산출물로 패키징하기",
    kind: "result-card",
    note: "마지막 페이지는 다음 업무에서 다시 꺼내 쓸 템플릿의 시작입니다."
  }
];

function compact(value, limit = 80) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
}

function hasFinalConsonant(value) {
  const text = String(value ?? "").trim();
  if (!text) return false;
  const code = text.charCodeAt(text.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function objectPhrase(value) {
  return `${value}${hasFinalConsonant(value) ? "을" : "를"}`;
}

function topicPhrase(value) {
  return `${value}${hasFinalConsonant(value) ? "은" : "는"}`;
}

function draftGoal(value) {
  const text = String(value ?? "업무 산출물").trim();
  if (text.endsWith("초안")) return `${text}을 검토 가능한 작성본으로 다듬는다`;
  if (text.endsWith("템플릿")) return `${text}을 실제 업무 예시로 채운다`;
  if (text.endsWith("체크리스트")) return `${text}를 실행 순서대로 정리한다`;
  return `${objectPhrase(text)} 초안으로 만든다`;
}

function outputActionPhrase(value) {
  const text = String(value ?? "업무 산출물").trim();
  if (text.endsWith("초안")) return `${text}을 검토 가능한 작성본으로 다듬기 위해`;
  if (text.endsWith("템플릿")) return `${text} 작성을 위해`;
  if (text.endsWith("체크리스트")) return `${text} 구성을 위해`;
  return `${objectPhrase(text)} 만들기 위해`;
}

function stripModulePrefix(title) {
  return String(title ?? "").replace(/^모듈\s*\d+\.\s*/, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function slugContext(container) {
  return contexts[container.slug] ?? fallbackContext;
}

function palette(seedText, salt = 0) {
  const palettes = [
    ["#1d4ed8", "#dbeafe", "#0f172a"],
    ["#0f766e", "#ccfbf1", "#102a27"],
    ["#7c2d12", "#ffedd5", "#23140b"],
    ["#7e22ce", "#f3e8ff", "#21112e"],
    ["#be123c", "#ffe4e6", "#2b1018"],
    ["#15803d", "#dcfce7", "#0f2415"]
  ];
  const score = [...String(seedText)].reduce((sum, char) => sum + char.charCodeAt(0), salt);
  return palettes[score % palettes.length];
}

function canvasShell({ title, subtitle, accent, soft, ink, body }) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}html,body{height:100%;margin:0}body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:${ink};background:#f8fafc}.stage{min-height:100vh;display:grid;grid-template-rows:auto 1fr}.hero{border-bottom:1px solid #dbe3ef;background:linear-gradient(135deg,#fff 0%,${soft} 100%);padding:24px 28px}.eyebrow{font-size:11px;font-weight:900;letter-spacing:.12em;color:${accent};text-transform:uppercase}.hero h1{margin:7px 0 0;font-size:24px;line-height:1.2;letter-spacing:0}.hero p{max-width:860px;margin:10px 0 0;color:#475569;line-height:1.65;font-size:14px}.work{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:0}.panel{border-right:1px solid #dbe3ef;background:#fff;padding:18px;display:grid;align-content:start;gap:10px}.btn{font:inherit;border:1px solid #dbe3ef;background:#fff;color:#172033;padding:11px 12px;text-align:left;font-weight:850;cursor:pointer}.btn:hover,.btn.active{border-color:${accent};background:${soft}}.hint{margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.55}.board{padding:22px;overflow:auto}.card{border:1px solid #dbe3ef;background:#fff;padding:16px;box-shadow:0 18px 42px -32px rgba(15,23,42,.35)}.grid{display:grid;gap:14px}.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.tag{display:inline-flex;align-items:center;border-left:4px solid ${accent};background:${soft};padding:5px 8px;font-size:12px;font-weight:900;color:${ink}}.small{font-size:13px;line-height:1.65;color:#64748b}.strong{font-weight:900;color:${ink}}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.svgbox{border:1px solid #e2e8f0;background:#fff}.output{white-space:pre-wrap;border-left:4px solid ${accent};background:#f8fafc;padding:14px;line-height:1.65;font-size:13px}.row{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #e2e8f0;padding:9px 0}.row:last-child{border-bottom:0}.score{font-weight:900;color:${accent}}select,input{font:inherit}@media(max-width:760px){.work{grid-template-columns:1fr}.panel{border-right:0;border-bottom:1px solid #dbe3ef}.cols{grid-template-columns:1fr}.hero{padding:20px}.board{padding:16px}}</style></head><body><main class="stage"><header class="hero"><span class="eyebrow">Interactive Webbook</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></header>${body}</main></body></html>`;
}

function codeBlock(id, title, code) {
  return {
    id,
    type: "code-canvas",
    props: {
      kind: "html",
      artifactId: `artifact-${id}`,
      prompt: `${title} 인터랙티브 웹북 캔버스`,
      promptHistory: [],
      code,
      entry: "index.html",
      files: { "index.html": code },
      assets: [],
      runtime: "sandboxed-iframe",
      version: 2,
      status: "generated",
      notes: "브리프: 이 캔버스는 AI 활용법을 목표, 맥락, 출력 형식, 검토 기준으로 나누어 조작하도록 설계했습니다. 학습자는 결과 화면과 함께 요청 구조를 읽고 자신의 업무 기준으로 바꿉니다."
    }
  };
}

function visualPath(container, moduleIndex) {
  return `/assets/ai-webbook/${container.slug}-m${String(moduleIndex + 1).padStart(2, "0")}.svg`;
}

function writeVisual(container, module, moduleIndex, ctx) {
  const [accent, soft, ink] = palette(container.slug, moduleIndex);
  const moduleTitle = stripModulePrefix(module.title);
  const output = container.outputs[moduleIndex % container.outputs.length] ?? "업무 산출물";
  const filePath = path.join(visualRoot, `${container.slug}-m${String(moduleIndex + 1).padStart(2, "0")}.svg`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="520" viewBox="0 0 960 520" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(container.title)} ${escapeXml(moduleTitle)} 웹북 비주얼</title>
  <desc id="desc">공개 AI 활용법을 한국 업무 산출물로 바꾸는 고품질 SVG 인포그래픽</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${soft}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="960" height="520" rx="32" fill="#f8fafc"/>
  <rect x="36" y="34" width="888" height="452" rx="28" fill="url(#paper)" filter="url(#shadow)"/>
  <text x="72" y="86" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="18" font-weight="900" letter-spacing="1.8" fill="${accent}">SHIFTBASE AI WEBBOOK</text>
  <text x="72" y="128" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="34" font-weight="850" fill="${ink}">${escapeXml(moduleTitle)}</text>
  <foreignObject x="72" y="150" width="660" height="58">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font: 15px/1.55 system-ui, -apple-system, Segoe UI, sans-serif; color:#475569;">${escapeHtml(ctx.scene)}</div>
  </foreignObject>
  <g transform="translate(72 238)">
    ${["공개 자료", "업무 번역", "AI 요청", "사람 검토"].map((label, index) => {
      const x = index * 208;
      return `<g>
        <rect x="${x}" y="0" width="170" height="132" rx="18" fill="#ffffff" stroke="${index % 2 === 0 ? accent : "#94a3b8"}" stroke-width="2"/>
        <circle cx="${x + 28}" cy="30" r="15" fill="${index % 2 === 0 ? accent : ink}"/>
        <text x="${x + 28}" y="35" text-anchor="middle" font-size="15" font-weight="900" fill="#ffffff">${index + 1}</text>
        <text x="${x + 24}" y="70" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20" font-weight="850" fill="${ink}">${escapeXml(label)}</text>
        <foreignObject x="${x + 24}" y="84" width="120" height="34">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font: 12px/1.4 system-ui, -apple-system, Segoe UI, sans-serif; color:#64748b;">${escapeHtml(index === 0 ? compact(ctx.sample, 42) : index === 1 ? compact(ctx.lens, 42) : index === 2 ? "목표, 맥락, 형식" : "승인선과 책임")}</div>
        </foreignObject>
      </g>`;
    }).join("")}
  </g>
  <rect x="72" y="408" width="816" height="44" rx="16" fill="#ffffff" stroke="#dbe3ef"/>
  <text x="98" y="436" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="850" fill="${ink}">완성 산출물</text>
  <text x="224" y="436" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="750" fill="${accent}">${escapeXml(output)}</text>
</svg>
`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, svg, "utf8");
}

function canvasMap(container, moduleTitle, ctx, moduleIndex) {
  const [accent, soft, ink] = palette(container.slug, moduleIndex);
  const steps = [
    ["공개 자료", compact(ctx.sample, 34)],
    ["업무 번역", compact(ctx.scene, 34)],
    ["AI 요청", "목표, 맥락, 출력 형식"],
    ["사람 검토", compact(ctx.sensitive, 34)],
    ["산출물", container.outputs[moduleIndex % container.outputs.length]]
  ];
  const nodeSvg = steps.map((step, index) => {
    const x = 54 + index * 138;
    const y = index % 2 === 0 ? 92 : 226;
    return `<g class="node" data-node="${index}"><rect x="${x}" y="${y}" width="116" height="76" rx="14" fill="${index === 0 ? soft : "#fff"}" stroke="${index === 0 ? accent : "#cbd5e1"}" stroke-width="2"/><text x="${x + 58}" y="${y + 31}" text-anchor="middle" font-size="15" font-weight="900" fill="${ink}">${escapeHtml(step[0])}</text><text x="${x + 58}" y="${y + 53}" text-anchor="middle" font-size="11" fill="#64748b">${escapeHtml(compact(step[1], 18))}</text></g>`;
  }).join("");
  const details = [
    `${ctx.sample}에서 업무에 직접 쓰일 부분만 표시합니다.`,
    ctx.lens,
    `AI에게는 ${moduleTitle}의 목적, 독자, 제외 조건, 원하는 형식을 함께 줍니다.`,
    ctx.sensitive,
    `${container.outputs[moduleIndex % container.outputs.length]} 형태로 저장해 다음 업무에서 다시 씁니다.`
  ];
  const body = `<section class="work"><aside class="panel">${steps.map((step, index) => `<button class="btn${index === 0 ? " active" : ""}" data-step="${index}">${index + 1}. ${escapeHtml(step[0])}</button>`).join("")}<p class="hint">왼쪽 단계를 눌러 온라인 팁이 한국 업무 산출물로 바뀌는 흐름을 확인하세요.</p></aside><section class="board"><div class="cols"><div class="card"><svg class="svgbox" viewBox="0 0 760 420" width="100%" role="img" aria-label="업무 전환 흐름도"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${accent}"/></marker></defs><rect x="24" y="30" width="712" height="350" rx="18" fill="#f8fafc" stroke="#dbe3ef"/>${nodeSvg}<path d="M170 130 C220 110 240 250 308 264" fill="none" stroke="${accent}" stroke-width="3" marker-end="url(#arrow)"/><path d="M308 264 C350 260 365 130 446 130" fill="none" stroke="${accent}" stroke-width="3" marker-end="url(#arrow)"/><path d="M446 130 C500 120 520 250 584 264" fill="none" stroke="${accent}" stroke-width="3" marker-end="url(#arrow)"/><path d="M584 264 C630 260 642 150 706 132" fill="none" stroke="${accent}" stroke-width="3" marker-end="url(#arrow)"/></svg></div><div class="card"><span class="tag" id="stepName"></span><h2 id="stepTitle" style="margin:14px 0 8px;font-size:22px"></h2><p class="small" id="stepDesc"></p><div class="output" id="stepOutput" style="margin-top:14px"></div></div></div></section></section><script>const steps=${JSON.stringify(steps)};const details=${JSON.stringify(details)};const outputs=${JSON.stringify(["수집: 링크, 핵심 주장, 적용 조건","번역: 우리 팀의 실제 업무 장면으로 재작성","요청: 역할 + 맥락 + 자료 + 형식 + 검토 기준","검토: 사실, 표현 수위, 민감정보, 승인 필요 여부","패키징: 읽기-보기-체크-산출물 흐름"])};const btns=[...document.querySelectorAll('.btn')];const nodes=[...document.querySelectorAll('.node rect')];function render(i){btns.forEach((b,n)=>b.classList.toggle('active',n===i));nodes.forEach((n,k)=>{n.setAttribute('fill',k===i?'${soft}':'#fff');n.setAttribute('stroke',k===i?'${accent}':'#cbd5e1');});stepName.textContent=steps[i][0];stepTitle.textContent=steps[i][1];stepDesc.textContent=details[i];stepOutput.textContent=outputs[i];}btns.forEach((b,i)=>b.onclick=()=>render(i));render(0);</script>`;
  return canvasShell({ title: `${moduleTitle} 전환 지도`, subtitle: `${ctx.visual}를 보며 공개 AI 팁을 실제 업무 흐름으로 옮깁니다.`, accent, soft, ink, body });
}

function promptLab(container, moduleTitle, ctx, moduleIndex) {
  const [accent, soft, ink] = palette(container.slug, moduleIndex + 2);
  const goals = [draftGoal(container.outputs[0]), `${moduleTitle} 기준으로 누락을 찾는다`, `${ctx.reader}에게 공유할 문장으로 바꾼다`];
  const body = `<section class="work"><aside class="panel"><button class="btn active" data-kind="goal">목표</button><button class="btn active" data-kind="context">맥락</button><button class="btn active" data-kind="format">형식</button><button class="btn active" data-kind="review">검토</button><p class="hint">항목을 켜고 끄며 프롬프트가 얼마나 업무형으로 바뀌는지 확인하세요.</p></aside><section class="board"><div class="cols"><div class="card"><div class="grid"><label class="small strong">업무 목표<select id="goal" style="display:block;width:100%;margin-top:7px;padding:10px;border:1px solid #cbd5e1">${goals.map((goal) => `<option>${escapeHtml(goal)}</option>`).join("")}</select></label><label class="small strong">공유 대상<select id="reader" style="display:block;width:100%;margin-top:7px;padding:10px;border:1px solid #cbd5e1"><option>${escapeHtml(ctx.reader)}</option><option>팀장에게 5분 안에 보고</option><option>동료가 바로 실행할 체크리스트</option></select></label><label class="small strong">표현 수위<input id="tone" type="range" min="1" max="3" value="2" style="width:100%;margin-top:9px"></label></div><div class="card" style="margin-top:14px;background:${soft}"><span class="tag">품질 점수</span><div class="row"><span>목표 명확성</span><span class="score" id="s1">A</span></div><div class="row"><span>맥락 충분성</span><span class="score" id="s2">A</span></div><div class="row"><span>검토 가능성</span><span class="score" id="s3">A</span></div></div></div><div class="card"><span class="tag">조립된 프롬프트</span><pre class="output mono" id="prompt" style="margin-top:14px"></pre></div></div></section></section><script>const ctx=${JSON.stringify(ctx)};const title=${JSON.stringify(container.title)};const active={goal:true,context:true,format:true,review:true};const toneWords=['정중하고 간결하게','실무자가 바로 실행할 수 있게','상사 보고용으로 단정하게'];function render(){const g=goal.value;const r=reader.value;const tone=toneWords[Number(document.getElementById('tone').value)-1];const parts=[];if(active.goal)parts.push('목표: '+g);if(active.context)parts.push('맥락: '+ctx.scene+'\\n자료 범위: '+ctx.sample);parts.push('역할: '+title+'를 돕는 업무 코치로 행동한다.');if(active.format)parts.push('출력 형식: 1) 핵심 요약 2) 실행 항목 3) 확인 질문 4) '+r+'에게 공유할 문장');if(active.review)parts.push('검토 기준: '+ctx.sensitive+' 확정되지 않은 내용은 확인 필요로 표시한다.');parts.push('말투: '+tone);prompt.textContent=parts.join('\\n\\n');s1.textContent=active.goal?'A':'C';s2.textContent=active.context?'A':'C';s3.textContent=active.review?'A':'B';}[...document.querySelectorAll('.btn')].forEach(b=>b.onclick=()=>{const k=b.dataset.kind;active[k]=!active[k];b.classList.toggle('active',active[k]);render();});goal.onchange=render;reader.onchange=render;tone.oninput=render;render();</script>`;
  return canvasShell({ title: `${moduleTitle} 프롬프트 랩`, subtitle: "목표, 맥락, 출력 형식, 검토 기준을 조립해 한국 업무에서 바로 쓰기 좋은 요청문으로 만듭니다.", accent, soft, ink, body });
}

function imageBrief(container, moduleTitle, ctx, moduleIndex) {
  const [accent, soft, ink] = palette(container.slug, moduleIndex + 4);
  const data = {
    wide: `주제: ${ctx.visual}\n배경: 한국 사무실의 회의 전 준비 장면\n거리감: 중간 거리, 인물보다 업무 흐름이 보이게\n재질: 종이 메모, 노트북 화면, 정돈된 책상\n금지: 실제 회사 로고, 개인정보, 과장된 미래형 UI`,
    diagram: `주제: ${moduleTitle} 프로세스 도식\n배경: 흰색 교육용 캔버스\n거리감: 정면, 단계와 화살표가 읽히게\n재질: 선명한 벡터풍 박스와 라벨\n금지: 읽기 어려운 작은 글자, 장식용 그래픽`,
    cover: `주제: ${container.title}\n배경: 실무 교육용 웹북 표지\n거리감: 넓은 여백, 제목 영역 확보\n재질: 차분한 종이 질감과 디지털 카드\n금지: 선정적 광고 문구, 특정 도구 로고`
  };
  const body = `<section class="work"><aside class="panel"><button class="btn active" data-shot="wide">업무 장면</button><button class="btn" data-shot="diagram">설명 도식</button><button class="btn" data-shot="cover">웹북 커버</button><p class="hint">이미지 생성 프롬프트는 주제, 배경, 거리감, 재질, 금지 조건을 분리하면 결과가 안정적입니다.</p></aside><section class="board"><div class="cols"><div class="card"><svg class="svgbox" viewBox="0 0 720 420" width="100%" role="img" aria-label="이미지 프롬프트 미리보기"><rect width="720" height="420" fill="#f8fafc"/><rect x="44" y="50" width="632" height="320" rx="24" fill="#fff" stroke="#dbe3ef"/><rect id="poster" x="88" y="90" width="250" height="240" rx="18" fill="${soft}" stroke="${accent}" stroke-width="3"/><circle cx="170" cy="158" r="42" fill="#fff" stroke="${accent}" stroke-width="3"/><path d="M124 278 C165 222 242 222 302 278" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/><rect x="388" y="104" width="210" height="42" rx="10" fill="#e2e8f0"/><rect x="388" y="166" width="210" height="42" rx="10" fill="#e2e8f0"/><rect x="388" y="228" width="210" height="42" rx="10" fill="#e2e8f0"/><text x="493" y="314" text-anchor="middle" font-size="18" font-weight="900" fill="${ink}" id="svgLabel">업무 장면</text></svg></div><div class="card"><span class="tag">이미지 생성 브리프</span><div class="output" id="brief" style="margin-top:14px"></div><div class="small" style="margin-top:12px">주의: 실제 고객명, 사내 화면, 미공개 수치가 보이는 스크린샷은 그대로 넣지 않습니다.</div></div></div></section></section><script>const data=${JSON.stringify(data)};const labels={wide:'업무 장면',diagram:'설명 도식',cover:'웹북 커버'};function render(k){brief.textContent=data[k];svgLabel.textContent=labels[k];poster.setAttribute('rx',k==='diagram'?4:18);document.querySelectorAll('.btn').forEach(b=>b.classList.toggle('active',b.dataset.shot===k));}document.querySelectorAll('.btn').forEach(b=>b.onclick=()=>render(b.dataset.shot));render('wide');</script>`;
  return canvasShell({ title: `${moduleTitle} 이미지 브리프 빌더`, subtitle: "이미지 생성형 AI를 업무 교육 자료에 붙일 때 필요한 시각 언어를 구조화합니다.", accent, soft, ink, body });
}

function qualityGate(container, moduleTitle, ctx, moduleIndex) {
  const [accent, soft, ink] = palette(container.slug, moduleIndex + 6);
  const risks = [["사실 확인", "출처가 약한 수치와 날짜", 72], ["표현 수위", "상사/고객에게 단정적으로 들리는 문장", 64], ["민감정보", compact(ctx.sensitive, 40), 88], ["승인 필요", "외부 발송, 비용, 일정 약속", 79]];
  const body = `<section class="work"><aside class="panel"><button class="btn active" data-level="draft">초안</button><button class="btn" data-level="share">공유 전</button><button class="btn" data-level="external">외부 발송 전</button><p class="hint">단계가 올라갈수록 AI 결과물보다 사람의 확인과 승인선이 중요해집니다.</p></aside><section class="board"><div class="cols"><div class="card"><span class="tag">검토 게이트</span>${risks.map((risk) => `<div class="row"><div><b>${escapeHtml(risk[0])}</b><p class="small" style="margin:3px 0 0">${escapeHtml(risk[1])}</p></div><span class="score" data-base="${risk[2]}">${risk[2]}</span></div>`).join("")}</div><div class="card"><svg class="svgbox" viewBox="0 0 680 360" width="100%" role="img" aria-label="승인선 도식"><rect width="680" height="360" fill="#f8fafc"/><path d="M80 280 L230 120 L390 220 L560 80" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/><circle cx="80" cy="280" r="28" fill="#fff" stroke="${accent}" stroke-width="4"/><text x="80" y="286" text-anchor="middle" font-weight="900" fill="${ink}">AI</text><circle cx="230" cy="120" r="28" fill="#fff" stroke="${accent}" stroke-width="4"/><text x="230" y="126" text-anchor="middle" font-weight="900" fill="${ink}">나</text><circle cx="390" cy="220" r="28" fill="#fff" stroke="${accent}" stroke-width="4"/><text x="390" y="226" text-anchor="middle" font-weight="900" fill="${ink}">팀</text><circle cx="560" cy="80" r="28" fill="#fff" stroke="${accent}" stroke-width="4"/><text x="560" y="86" text-anchor="middle" font-weight="900" fill="${ink}">승인</text><text x="340" y="328" text-anchor="middle" font-size="16" font-weight="900" fill="${ink}" id="gateLabel"></text></svg><p class="small" id="gateDesc" style="margin-top:14px"></p></div></div></section></section><script>const desc={draft:['초안 단계: 내 검토 중심','AI가 만든 문장의 구조와 누락을 빠르게 봅니다.'],share:['공유 전: 팀 기준 적용','동료나 상사가 오해할 표현, 책임 소재, 근거 누락을 확인합니다.'],external:['외부 발송 전: 승인 필요','고객, 파트너, 지원자에게 나가는 내용은 사람 승인선을 통과해야 합니다.']};function render(k){document.querySelectorAll('.btn').forEach(b=>b.classList.toggle('active',b.dataset.level===k));const mul=k==='draft'?.75:k==='share'?1:1.18;document.querySelectorAll('.score').forEach(s=>s.textContent=Math.min(99,Math.round(Number(s.dataset.base)*mul)));gateLabel.textContent=desc[k][0];gateDesc.textContent=desc[k][1];}document.querySelectorAll('.btn').forEach(b=>b.onclick=()=>render(b.dataset.level));render('draft');</script>`;
  return canvasShell({ title: `${moduleTitle} 품질 게이트`, subtitle: "AI 결과물을 초안, 공유 전, 외부 발송 전으로 나눠 검토 강도를 달리합니다.", accent, soft, ink, body });
}

function readingMarkdown(container, moduleTitle, plan, ctx, pageIndex, moduleIndex) {
  const output = container.outputs[pageIndex % container.outputs.length] ?? "업무 산출물";
  const openings = [
    `이번 장의 무대는 **${ctx.scene}**입니다. 온라인에서 본 AI 활용법은 그대로 가져오면 대개 너무 넓거나, 우리 회사의 승인선과 표현 방식에 맞지 않습니다.`,
    `이 장은 **${ctx.scene}**에서 출발합니다. 화면 속 팁을 따라 하는 대신, 실제 담당자가 누구에게 무엇을 보고해야 하는지부터 다시 씁니다.`,
    `여기서는 **${ctx.scene}**을 하나의 사례처럼 다룹니다. 강의나 블로그의 빠른 요령을 사내 문서, 메일, 회의 흐름 안에 넣어도 버티는 구조로 바꾸는 과정입니다.`,
    `출발점은 **${ctx.scene}**입니다. 같은 AI 기능이라도 한국 회사에서는 독자, 결재선, 공유 타이밍이 달라지면 전혀 다른 산출물이 됩니다.`
  ];
  const methods = [
    `먼저 장면을 좁히고, 독자와 산출물을 고정한 뒤, AI가 맡을 일과 사람이 확인할 일을 분리합니다.`,
    `자료를 한꺼번에 던지기보다 입력, 제외 조건, 원하는 형식, 확인 질문을 차례로 나눕니다.`,
    `${topicPhrase(moduleTitle)} 단순한 기능 사용법이 아니라 다음 담당자가 이어받을 수 있는 업무 절차로 정리합니다.`,
    `AI의 빠른 초안은 시작점으로 두고, 최종 공유 전에는 근거와 표현 수위가 남아 있는지 확인합니다.`
  ];
  const lenses = [
    `**한국 업무 맥락**에서는 ${ctx.lens}`,
    `이 단계에서 중요한 감각은 속도보다 맥락입니다. ${ctx.lens}`,
    `상용 도서처럼 설명하려면 왜 이 절차가 필요한지 독자가 납득해야 합니다. ${ctx.lens}`,
    `팀 안에서 반복해서 쓰려면 말투와 책임 경계가 함께 정리되어야 합니다. ${ctx.lens}`
  ];
  const closings = [
    "마지막으로 결과물을 공유하기 전에 사실, 말투, 민감정보, 승인 필요 여부를 확인합니다.",
    "완성본은 바로 발송하는 문서가 아니라, 사람이 검토한 기준까지 포함한 업무 자산이어야 합니다.",
    "좋은 AI 활용은 답변을 빨리 받는 데서 끝나지 않고, 다음 사람이 같은 기준으로 반복할 수 있을 때 완성됩니다.",
    "이 페이지의 산출물은 개인 메모가 아니라 팀 안에서 재사용될 작은 운영 기준으로 남깁니다."
  ];
  const variant = (pageIndex + moduleIndex) % openings.length;
  return [
    `## ${plan.suffix}`,
    "",
    `${openings[variant]} ${methods[(variant + 1) % methods.length]}`,
    "",
    `${lenses[variant]} 이 기준이 없으면 AI 답변은 그럴듯하지만 회의, 보고, 고객 응대에서 바로 쓰기 어렵습니다.`,
    "",
    `이 페이지에서는 ${outputActionPhrase(output)} 입력 자료를 정돈하고, 요청문을 한 번에 완성하려 하지 않고 검토 가능한 작은 단위로 나눕니다. 좋은 프롬프트는 길어서 좋은 것이 아니라, 목표와 맥락과 출력 형식이 서로 맞물릴 때 좋아집니다.`,
    "",
    `실무 예문으로 바꾸면, ${topicPhrase(moduleTitle)} "${plan.suffix}" 항목을 먼저 기록한 뒤 ${objectPhrase(output)} 다음 담당자가 이어받을 수 있는 형태로 남깁니다. 예를 들어 원본 자료, AI에게 준 요청, 사람이 보류한 판단을 한 줄씩 나눠 적으면 검토자가 빠르게 맥락을 따라올 수 있습니다.`,
    "",
    `${ctx.reader}에게 공유할 때는 "AI가 이렇게 말했습니다"가 아니라 "이 자료를 기준으로 여기까지 정리했고, 이 부분은 확인이 필요합니다"라고 말해야 합니다. 이 작은 문장 차이가 한국식 협업에서 책임 경계를 분명하게 만듭니다.`,
    "",
    `> ${plan.note}`,
    "",
    `${closings[variant]} AI가 빠르게 만든 초안일수록 사람이 확인해야 할 기준은 더 분명해야 합니다.`
  ].join("\n\n");
}

function makeBlock(plan, container, moduleTitle, moduleIndex, pageIndex, pageId, ctx) {
  const blockId = `${pageId}-enhanced-block`;
  const title = `${container.title} / ${moduleTitle}`;
  if (plan.kind === "image-definition") {
    return {
      id: blockId,
      type: "image-definition",
      props: {
        image: visualPath(container, moduleIndex),
        alt: `${container.title} ${moduleTitle} 업무 전환 SVG`,
        label: "AI Webbook Visual",
        text: `${ctx.visual}. 공개 AI 활용법을 한국식 업무 절차, 승인선, 산출물로 바꾸는 흐름입니다.`
      }
    };
  }
  if (plan.kind === "canvas-map") return codeBlock(blockId, title, canvasMap(container, moduleTitle, ctx, moduleIndex));
  if (plan.kind === "prompt-lab") return codeBlock(blockId, title, promptLab(container, moduleTitle, ctx, moduleIndex));
  if (plan.kind === "image-brief") return codeBlock(blockId, title, imageBrief(container, moduleTitle, ctx, moduleIndex));
  if (plan.kind === "quality-gate") return codeBlock(blockId, title, qualityGate(container, moduleTitle, ctx, moduleIndex));
  if (plan.kind === "intro-summary") {
    return {
      id: blockId,
      type: "intro-summary",
      props: {
        outputs: [`${moduleTitle} 핵심 메모`, draftGoal(container.outputs[0]), `${ctx.reader}에게 공유할 설명 문장`, "사람 검토 기준과 승인선"]
      }
    };
  }
  if (plan.kind === "checklist") {
    return {
      id: blockId,
      type: "checklist",
      props: {
        title: `${moduleTitle} 실행 전 점검`,
        items: [
          `${ctx.sample} 중 AI에 넣지 말아야 할 항목을 먼저 제외했습니다.`,
          "요청문에 업무 목적, 대상 독자, 원하는 출력 형식을 적었습니다.",
          "결과가 틀렸을 때 확인할 원본 자료나 담당자를 정했습니다.",
          ctx.lens,
          "최종 산출물이 팀에서 다시 쓸 수 있는 템플릿 형태인지 확인했습니다."
        ]
      }
    };
  }
  if (plan.kind === "result-card") {
    return {
      id: blockId,
      type: "result-card",
      props: {
        title: `${container.outputs[pageIndex % container.outputs.length] ?? "웹북 산출물"} 정리`,
        emptyText: `${moduleTitle}에서 만든 메모를 바탕으로 다음 업무에서 다시 쓸 수 있는 산출물을 완성하세요.`
      }
    };
  }
  return {
    id: blockId,
    type: "example-list",
    props: {
      examples: [
        {
          title: "그대로 따라 하면 약한 사용법",
          items: [
            `${container.title}에 대해 막연히 "잘 정리해줘"라고 요청합니다.`,
            "유튜브나 블로그에서 본 표현을 그대로 복사해 우리 팀의 승인선과 말투에 맞지 않는 결과를 만듭니다.",
            "출처, 날짜, 적용 조건, 책임 표현을 확인하지 않고 답변을 공유합니다."
          ]
        },
        {
          title: "상용 도서형으로 다듬은 사용법",
          items: [
            `${moduleTitle}에서 필요한 입력, 판단 기준, 최종 산출물을 먼저 적습니다.`,
            `${ctx.scene}을 기준으로 요청문을 좁히고, 독자는 ${ctx.reader}로 명확히 둡니다.`,
            "결과를 바로 쓰지 않고 근거, 표현 수위, 민감정보, 승인 필요 여부로 한 번 더 비교합니다."
          ]
        }
      ]
    }
  };
}

function enhanceContainer(container) {
  const ctx = slugContext(container);
  container.updatedAt = updatedAt;
  container.coverImage = container.slug === "ai-youtube-to-workbook-system" ? premiumBitmapCover : visualPath(container, 0);
  container.recommendationCards = Array.from({ length: 4 }, (_, index) => ({
    image: visualPath(container, index),
    text: container.audience?.[index % Math.max(1, container.audience.length)] ?? ctx.reader
  }));
  container.introMarkdown = [
    `## ${container.title}`,
    "",
    container.summary,
    "",
    `이 컨테이너는 **${ctx.scene}**을 기준 장면으로 삼습니다. 공개된 AI 활용법을 그대로 모으는 데서 끝내지 않고, 한국 업무 환경에서 실제로 통과해야 하는 말투, 승인선, 보안 기준, 산출물 형식으로 다시 편집합니다.`,
    "",
    "### 학습 원칙",
    "",
    "- 목표와 독자를 먼저 고정합니다.",
    "- AI에게 줄 자료와 빼야 할 자료를 나눕니다.",
    "- 초안, 공유 전, 외부 발송 전의 검토 강도를 다르게 둡니다.",
    "- 이미지 생성 브리프도 주제, 배경, 거리감, 재질, 금지 조건으로 나눕니다.",
    "",
    "### 참고한 공개 원칙",
    "",
    ...sourceReferences.map((source) => `- [${source.label}](${source.url})`)
  ].join("\n");

  container.modules.forEach((module, moduleIndex) => {
    const moduleTitle = stripModulePrefix(module.title);
    writeVisual(container, module, moduleIndex, ctx);
    module.lessons.forEach((lesson) => {
      lesson.title = moduleTitle;
      lesson.pages.forEach((page, pageIndex) => {
        const plan = pagePlans[pageIndex % pagePlans.length];
        page.title = `${moduleTitle}: ${plan.suffix}`;
        page.left = {
          title: page.title,
          bodyMarkdown: readingMarkdown(container, moduleTitle, plan, ctx, pageIndex, moduleIndex),
          paragraphs: [
            `${moduleTitle} 단계의 기준 장면은 ${ctx.scene}입니다.`,
            plan.note,
            `${objectPhrase(container.outputs[pageIndex % container.outputs.length] ?? "업무 산출물")} 실제 업무에서 다시 쓸 수 있는 형태로 정리합니다.`
          ],
          checkpoints: [
            "업무 목적과 대상 독자를 한 문장으로 말할 수 있습니다.",
            "AI가 참고할 자료와 참고하면 안 되는 자료를 구분할 수 있습니다.",
            "한국 업무 맥락에 맞는 표현 수위와 승인선을 설명할 수 있습니다.",
            "결과를 공유하기 전 사람이 확인할 기준을 적을 수 있습니다."
          ],
          footnote: ctx.sensitive
        };
        page.workspace = {
          layout: ["canvas-map", "prompt-lab", "image-brief", "quality-gate"].includes(plan.kind) ? "focus" : page.workspace?.layout ?? "stack",
          blocks: [makeBlock(plan, container, moduleTitle, moduleIndex, pageIndex, page.id, ctx)]
        };
      });
    });
  });

  return container;
}

function getContainerFiles() {
  return fs
    .readdirSync(contentRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(contentRoot, entry.name, "container.json"))
    .filter((filePath) => fs.existsSync(filePath))
    .sort((a, b) => a.localeCompare(b, "en"));
}

const files = getContainerFiles();
for (const filePath of files) {
  const container = JSON.parse(fs.readFileSync(filePath, "utf8"));
  fs.writeFileSync(filePath, `${JSON.stringify(enhanceContainer(container), null, 2)}\n`, "utf8");
}

console.log(`Enhanced ${files.length} AI webbook container(s) with richer Korean prose and code-canvas interactions.`);
