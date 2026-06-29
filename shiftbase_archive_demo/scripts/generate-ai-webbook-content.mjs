import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content", "containers");
const visualRoot = path.join(root, "public", "assets", "ai-webbook");
const updatedAt = "2026-05-31";

const coverImages = [
  "/assets/courses/prompt-template.png",
  "/assets/courses/ai-research.png",
  "/assets/courses/ai-report-writing.png",
  "/assets/courses/ai-meeting-notes.png",
  "/assets/courses/ai-excel-automation.png",
  "/assets/courses/chatgpt-workflow.png",
  "/assets/courses/internal-qa-bot.png",
  "/assets/ax-learning-platform-mockup.png"
];

const recommendationImages = [
  "/assets/audiences/ai-beginner.png",
  "/assets/audiences/automation-worker.png",
  "/assets/audiences/team-leader.png",
  "/assets/audiences/result-learner.png"
];

const palettes = [
  { bg: "#f8fafc", ink: "#111827", primary: "#2563eb", mid: "#7c3aed", warm: "#f97316", soft: "#dbeafe" },
  { bg: "#f9fafb", ink: "#172033", primary: "#0f766e", mid: "#334155", warm: "#ea580c", soft: "#ccfbf1" },
  { bg: "#fbfbf8", ink: "#1f2937", primary: "#b45309", mid: "#4f46e5", warm: "#dc2626", soft: "#fde68a" },
  { bg: "#f7f7ff", ink: "#151928", primary: "#4f46e5", mid: "#0891b2", warm: "#f59e0b", soft: "#e0e7ff" }
];

const containers = [
  {
    slug: "ai-youtube-to-workbook-system",
    title: "유튜브 AI 강의를 내 업무 웹북으로 바꾸기",
    summary: "유튜브 강의, 블로그, 공식문서에서 얻은 AI 활용법을 팀 교육용 웹북으로 재구성합니다.",
    hub: "AI 활용법 큐레이션",
    tracks: ["공통", "AI 입문", "콘텐츠 큐레이션"],
    difficulty: "beginner",
    team: "교육기획팀",
    role: "콘텐츠 담당자",
    reviewer: "팀장",
    officeScene: "팀원들이 각자 본 AI 강의 링크를 사내 메신저에 쌓아두지만, 실제 업무 절차로는 이어지지 않는 상황",
    onlineSource: "유튜브 강의, 블로그 튜토리얼, 공식 도움말",
    koreanContext: "사내 교육 자료는 출처, 적용 부서, 검토자, 배포일을 함께 남겨야 합니다.",
    risk: "인기 있는 팁을 검증 없이 팀 표준으로 배포하면 업무 양식과 보안 기준이 뒤섞입니다.",
    audience: ["유튜브 AI 강의를 많이 보지만 업무 적용으로 이어지지 않는 학습자", "팀 교육용 AI 활용 자료를 웹북으로 만들고 싶은 운영자", "온라인 팁을 실습 페이지로 바꾸고 싶은 콘텐츠 담당자"],
    outcomes: ["공개 AI 활용법을 업무 맥락으로 선별합니다.", "영상 요약을 모듈과 페이지 구조로 재구성합니다.", "출처와 검토 기준을 분리해 안전한 웹북 초안을 만듭니다.", "학습자가 따라 할 수 있는 실습 흐름으로 바꿉니다."],
    outputs: ["온라인 AI 활용법 수집표", "웹북 모듈 설계안", "페이지별 실습 카드", "출처 검토 체크리스트"],
    modules: ["수집 기준", "업무 맥락화", "페이지 설계", "운영 검토"]
  },
  {
    slug: "ai-prompt-operating-system",
    title: "AI 프롬프트 운영체계 만들기",
    summary: "역할, 맥락, 자료, 출력 형식, 검토 기준을 한 장의 업무 프롬프트 운영체계로 정리합니다.",
    hub: "AI 업무 활용",
    tracks: ["공통", "프롬프트", "AI 입문"],
    difficulty: "beginner",
    team: "전략기획팀",
    role: "기획 실무자",
    reviewer: "파트장",
    officeScene: "회의록, 보고서, 메일 요청마다 프롬프트가 새로 쓰여 결과 품질이 들쭉날쭉한 상황",
    onlineSource: "프롬프트 템플릿 영상, 커뮤니티 예시, 도구별 가이드",
    koreanContext: "한국 회사의 요청문은 보고 대상, 결재선, 존댓말 톤, 사내 양식을 분명히 적어야 품질이 안정됩니다.",
    risk: "좋은 문장처럼 보이는 답변도 보고 기준과 책임 표현이 빠지면 바로 쓸 수 없습니다.",
    audience: ["매번 프롬프트를 새로 쓰느라 시간이 걸리는 실무자", "팀 공통 프롬프트 양식이 필요한 리더", "AI 답변 품질을 안정화하고 싶은 학습자"],
    outcomes: ["좋은 요청의 공통 구조를 설명합니다.", "업무별 재사용 프롬프트 카드를 만듭니다.", "출력 형식과 검토 기준을 프롬프트에 포함합니다.", "프롬프트를 팀 템플릿으로 관리합니다."],
    outputs: ["업무 프롬프트 카드", "역할-맥락-출력 구조표", "재사용 프롬프트 라이브러리", "프롬프트 검토 루틴"],
    modules: ["요청 구조", "맥락 제공", "출력 제어", "프롬프트 운영"]
  },
  {
    slug: "ai-research-source-synthesis",
    title: "AI로 리서치 자료 수집과 근거 정리하기",
    summary: "검색, 링크, 문서, 영상 자료를 모아 신뢰도와 업무 관련성을 기준으로 리서치 브리프를 만듭니다.",
    hub: "AI 리서치",
    tracks: ["공통", "리서치", "사무직"],
    difficulty: "intermediate",
    team: "신사업팀",
    role: "시장조사 담당자",
    reviewer: "사업개발 리더",
    officeScene: "벤치마킹 자료는 많지만 회의에서 바로 판단할 수 있는 근거표가 부족한 상황",
    onlineSource: "검색형 AI 활용법, 출처 기반 노트북 사례, 산업 리포트 요약 팁",
    koreanContext: "상사에게 공유할 리서치는 주장, 근거, 출처, 해석을 분리해야 회의에서 반박을 견딥니다.",
    risk: "AI가 요약한 문장을 원문 확인 없이 인용하면 날짜, 시장 범위, 수치 정의가 틀릴 수 있습니다.",
    audience: ["자료는 많은데 결론을 정리하기 어려운 기획자", "시장 조사와 벤치마킹을 자주 하는 실무자", "AI 검색 결과의 근거를 검토해야 하는 팀원"],
    outcomes: ["리서치 질문을 쪼개 검색 범위를 정합니다.", "출처의 신뢰도와 최신성을 분리해 봅니다.", "자료별 핵심 주장과 근거를 표로 정리합니다.", "업무 의사결정용 브리프를 작성합니다."],
    outputs: ["리서치 질문 지도", "출처 평가표", "주장-근거 매트릭스", "1페이지 리서치 브리프"],
    modules: ["질문 설계", "자료 수집", "근거 비교", "브리프 작성"]
  },
  {
    slug: "ai-email-document-communication",
    title: "AI로 메일과 문서 커뮤니케이션 정리하기",
    summary: "메일 스레드, 공지, 요청 문서, 답장 초안을 AI로 정리하되 톤과 책임 경계를 유지합니다.",
    hub: "AI 업무 활용",
    tracks: ["사무직", "커뮤니케이션", "문서"],
    difficulty: "beginner",
    team: "운영지원팀",
    role: "커뮤니케이션 담당자",
    reviewer: "팀장",
    officeScene: "고객사와 내부 부서가 한 메일 스레드에 섞여 요청, 기한, 책임자가 흐려진 상황",
    onlineSource: "메일 요약 프롬프트, 비즈니스 문서 톤 가이드, 답장 초안 자동화 팁",
    koreanContext: "대외 메일은 예의, 책임 표현, 내부 승인 여부를 함께 확인해야 합니다.",
    risk: "AI가 부드럽게 바꾼 문장에 약속, 인정, 일정 확정 같은 민감한 표현이 숨어 있을 수 있습니다.",
    audience: ["메일 처리와 문서 초안 작성 시간이 많은 사무직", "상대별 톤 조절이 필요한 실무자", "요청사항과 답장을 빠르게 구분하고 싶은 팀원"],
    outcomes: ["긴 메일에서 요청, 기한, 결정사항을 뽑습니다.", "상대와 상황에 맞는 답장 톤을 설계합니다.", "문서 초안을 검토 가능한 구조로 만듭니다.", "민감정보와 책임 표현을 점검합니다."],
    outputs: ["메일 요약 카드", "답장 초안 프롬프트", "공지문 구조표", "커뮤니케이션 검토표"],
    modules: ["요청 추출", "답장 초안", "공지 문서", "톤 검토"]
  },
  {
    slug: "ai-meeting-action-system",
    title: "AI 회의록과 액션아이템 운영하기",
    summary: "회의 기록을 결정사항, 할 일, 담당자, 후속 질문으로 분리해 실행 가능한 운영 보드로 바꿉니다.",
    hub: "AI 업무 활용",
    tracks: ["사무직", "회의", "운영"],
    difficulty: "beginner",
    team: "프로젝트 PMO",
    role: "회의 운영자",
    reviewer: "프로젝트 리더",
    officeScene: "회의는 끝났지만 결정사항과 후속 조치가 채팅방에 흩어져 실행이 늦어지는 상황",
    onlineSource: "AI 회의록 요약, 액션아이템 추출, 회의 자동화 영상",
    koreanContext: "회의록은 참석자에게 예민하므로 발언 요약과 확정된 결정사항을 구분해야 합니다.",
    risk: "AI가 발언을 결정사항처럼 바꾸면 담당자와 일정에 대한 오해가 생깁니다.",
    audience: ["회의 후 정리와 공유에 시간이 많이 드는 팀원", "결정사항과 할 일을 놓치기 쉬운 프로젝트 운영자", "회의록 품질을 팀 기준으로 맞추고 싶은 리더"],
    outcomes: ["회의 전 안건과 기대 산출물을 정합니다.", "회의 중 기록을 AI가 처리하기 좋은 형태로 남깁니다.", "회의 후 액션아이템과 리스크를 분리합니다.", "공유 전 사실과 책임 표현을 검토합니다."],
    outputs: ["회의 준비 프롬프트", "결정사항 정리표", "액션아이템 보드", "회의록 검토 체크리스트"],
    modules: ["회의 준비", "기록 구조", "액션 추출", "공유 검토"]
  },
  {
    slug: "ai-spreadsheet-analysis-automation",
    title: "AI로 엑셀 데이터 정리와 분석 자동화하기",
    summary: "표 데이터를 설명 가능한 질문, 수식 후보, 이상값 점검, 보고 문장으로 연결합니다.",
    hub: "AI 데이터 활용",
    tracks: ["사무직", "엑셀", "데이터"],
    difficulty: "intermediate",
    team: "영업관리팀",
    role: "데이터 담당자",
    reviewer: "영업관리 팀장",
    officeScene: "월간 실적 파일마다 열 이름과 입력 규칙이 조금씩 달라 집계 시간이 길어지는 상황",
    onlineSource: "엑셀 함수 생성, 피벗 분석, 데이터 클렌징 자동화 튜토리얼",
    koreanContext: "숫자 보고는 원본 파일, 기준일, 집계 제외 조건을 남겨야 재무와 영업이 같은 숫자를 봅니다.",
    risk: "AI가 만든 수식은 그럴듯해도 범위, 필터, 빈값 처리에서 틀릴 수 있습니다.",
    audience: ["엑셀 정리와 반복 집계가 많은 실무자", "수식과 피벗을 AI에게 물어보고 싶은 학습자", "데이터 보고 전에 오류를 줄이고 싶은 팀원"],
    outcomes: ["표의 열 의미와 분석 질문을 먼저 정의합니다.", "AI에게 수식과 정리 절차를 요청합니다.", "이상값, 중복, 누락을 점검합니다.", "분석 결과를 업무 보고 문장으로 바꿉니다."],
    outputs: ["데이터 질문 카드", "수식 요청 프롬프트", "오류 점검표", "데이터 보고 문장"],
    modules: ["표 이해", "정리 자동화", "분석 질문", "오류 검토"]
  },
  {
    slug: "ai-report-writing-dashboard",
    title: "AI 보고서 기획과 초안 작성하기",
    summary: "보고 목적, 독자, 근거, 결론을 정리해 AI가 만든 초안을 업무 보고서로 다듬습니다.",
    hub: "AI 문서 작성",
    tracks: ["사무직", "보고서", "문서"],
    difficulty: "intermediate",
    team: "경영기획팀",
    role: "보고서 작성자",
    reviewer: "본부장",
    officeScene: "자료는 충분하지만 본부장 보고용 메시지와 결론이 늦게 잡히는 상황",
    onlineSource: "보고서 초안 프롬프트, 요약/재작성 팁, 피라미드 구조 설명",
    koreanContext: "한국식 보고서는 결론, 배경, 근거, 요청사항의 순서와 결재권자의 관심사를 맞춰야 읽힙니다.",
    risk: "AI가 문장을 매끈하게 만들수록 근거가 약한 주장도 설득력 있어 보일 수 있습니다.",
    audience: ["보고서 첫 문장과 구조에서 막히는 실무자", "자료는 있지만 메시지 정리가 필요한 기획자", "AI 초안을 그대로 쓰지 않고 검토하고 싶은 팀원"],
    outcomes: ["보고 목적과 독자를 먼저 고정합니다.", "자료를 주장과 근거로 분리합니다.", "AI 초안을 목차와 문장 단위로 다듬습니다.", "최종 보고 전 누락과 과장을 점검합니다."],
    outputs: ["보고 목적 카드", "주장-근거 표", "보고서 목차 초안", "최종 점검 체크리스트"],
    modules: ["목적 정의", "근거 배열", "초안 생성", "보고 검토"]
  },
  {
    slug: "ai-slide-presentation-builder",
    title: "AI로 발표자료 스토리라인 만들기",
    summary: "발표 목적, 청중, 흐름, 슬라이드 메시지를 정리해 AI 초안을 검토 가능한 발표자료 구조로 만듭니다.",
    hub: "AI 문서 작성",
    tracks: ["사무직", "발표", "콘텐츠"],
    difficulty: "intermediate",
    team: "사업전략팀",
    role: "발표자료 담당자",
    reviewer: "임원 보고 담당 리더",
    officeScene: "슬라이드 장수는 늘어나는데 한 장마다 말해야 할 메시지가 흐려지는 상황",
    onlineSource: "슬라이드 아웃라인 생성, 스토리텔링 프롬프트, 발표 대본 작성 팁",
    koreanContext: "임원 보고 자료는 첫 세 장에서 문제, 결론, 요청사항이 보여야 합니다.",
    risk: "AI가 만든 슬라이드는 보기 좋지만 숫자 출처, 의사결정 포인트, 다음 행동이 빠지기 쉽습니다.",
    audience: ["슬라이드 제목과 순서가 잘 잡히지 않는 실무자", "발표자료 초안을 빠르게 만들고 싶은 기획자", "AI가 만든 슬라이드를 검토 기준으로 다듬고 싶은 팀원"],
    outcomes: ["발표의 한 문장 목적을 정합니다.", "청중의 질문과 반대를 예측합니다.", "슬라이드별 메시지와 근거를 배치합니다.", "디자인보다 정보 구조를 먼저 검토합니다."],
    outputs: ["발표 목적 문장", "스토리라인 지도", "슬라이드 메시지 표", "발표자료 검토표"],
    modules: ["발표 목적", "청중 분석", "스토리라인", "슬라이드 검토"]
  },
  {
    slug: "ai-customer-support-playbook",
    title: "AI 고객지원 응대 플레이북 만들기",
    summary: "고객 문의를 유형, 긴급도, 필요한 정보, 답변 초안으로 나누고 상담 품질 기준을 세웁니다.",
    hub: "AI 고객지원",
    tracks: ["사무직", "고객지원", "운영"],
    difficulty: "intermediate",
    team: "고객지원팀",
    role: "상담 품질 담당자",
    reviewer: "CS 매니저",
    officeScene: "반복 문의는 많지만 담당자마다 답변 기준과 에스컬레이션 시점이 다른 상황",
    onlineSource: "고객지원 챗봇 운영, 답변 초안 생성, 문의 분류 자동화 사례",
    koreanContext: "고객 응대 문장은 친절함보다 사실, 정책, 보상 가능 범위를 먼저 맞춰야 합니다.",
    risk: "AI가 고객을 안심시키려다 정책 밖의 약속을 만들어낼 수 있습니다.",
    audience: ["반복 문의를 빠르게 분류해야 하는 고객지원 담당자", "답변 품질을 팀 단위로 맞추고 싶은 운영자", "AI 응대와 사람 확인 경계를 정해야 하는 리더"],
    outcomes: ["고객 문의 유형과 긴급도를 분류합니다.", "누락 정보 확인 질문을 만듭니다.", "답변 초안을 톤과 정책 기준에 맞춥니다.", "사람에게 넘겨야 할 예외를 정의합니다."],
    outputs: ["문의 분류표", "확인 질문 템플릿", "답변 초안 카드", "에스컬레이션 기준표"],
    modules: ["문의 분류", "정보 확인", "응대 초안", "예외 처리"]
  },
  {
    slug: "ai-hr-onboarding-recruiting",
    title: "AI로 HR 온보딩과 채용 운영 패키지 만들기",
    summary: "채용 공고, 후보자 요약, 온보딩 일정, 안내문을 AI로 정리하면서 공정성과 개인정보 기준을 지킵니다.",
    hub: "AI 직무 활용",
    tracks: ["사무직", "HR", "운영"],
    difficulty: "intermediate",
    team: "인사팀",
    role: "HR 운영 담당자",
    reviewer: "HR 리더",
    officeScene: "채용 공고, 후보자 자료, 입사 안내문이 반복 작성되지만 기준 문서가 흩어져 있는 상황",
    onlineSource: "채용공고 작성 프롬프트, 후보자 요약, 온보딩 체크리스트 자동화 팁",
    koreanContext: "HR 자료는 개인정보와 공정성 이슈가 있어 편의보다 기준과 기록이 먼저입니다.",
    risk: "AI가 후보자를 평가하는 표현을 만들 때 편향적 기준이나 민감정보가 섞일 수 있습니다.",
    audience: ["채용과 온보딩 문서를 반복 작성하는 HR 담당자", "후보자 자료 요약 기준이 필요한 실무자", "AI 활용 시 공정성과 개인정보가 걱정되는 리더"],
    outcomes: ["직무 요구사항을 명확한 채용 언어로 바꿉니다.", "후보자 자료 요약의 근거 기준을 세웁니다.", "온보딩 일정을 역할별로 정리합니다.", "편향과 개인정보 리스크를 검토합니다."],
    outputs: ["채용공고 초안", "후보자 요약 기준표", "온보딩 일정표", "HR AI 사용 체크리스트"],
    modules: ["채용 공고", "후보자 요약", "온보딩 운영", "공정성 검토"]
  },
  {
    slug: "ai-marketing-content-engine",
    title: "AI 마케팅 콘텐츠 엔진 만들기",
    summary: "캠페인 목표, 고객 인사이트, 메시지, 채널별 소재를 AI와 함께 반복 생산하는 구조로 만듭니다.",
    hub: "AI 마케팅",
    tracks: ["사무직", "마케팅", "콘텐츠"],
    difficulty: "intermediate",
    team: "마케팅팀",
    role: "콘텐츠 마케터",
    reviewer: "브랜드 매니저",
    officeScene: "캠페인 소재는 많이 필요하지만 브랜드 톤과 고객 근거가 자주 흔들리는 상황",
    onlineSource: "콘텐츠 캘린더 생성, 카피라이팅 프롬프트, SNS 소재 변환 팁",
    koreanContext: "국내 고객에게는 과장된 표현보다 상황 공감, 신뢰, 실제 혜택이 먼저 전달되어야 합니다.",
    risk: "AI가 만든 문구가 경쟁사 표현과 비슷하거나 과장 광고처럼 보일 수 있습니다.",
    audience: ["콘텐츠 아이디어와 초안 생산이 많은 마케터", "브랜드 톤을 유지하며 AI를 쓰고 싶은 담당자", "캠페인 소재를 빠르게 비교하고 싶은 팀원"],
    outcomes: ["캠페인 목표와 고객 상황을 정리합니다.", "메시지 후보를 여러 각도로 생성합니다.", "채널별 콘텐츠 형식으로 변환합니다.", "브랜드 톤과 사실성을 검토합니다."],
    outputs: ["캠페인 브리프", "메시지 후보표", "채널별 콘텐츠 카드", "브랜드 톤 검토표"],
    modules: ["캠페인 브리프", "메시지 생성", "채널 변환", "브랜드 검토"]
  },
  {
    slug: "ai-sales-proposal-followup",
    title: "AI 영업 제안서와 팔로업 운영하기",
    summary: "고객 요구, 제안 논리, 견적 설명, 후속 메일을 AI로 정리해 영업 지원 흐름을 안정화합니다.",
    hub: "AI 영업지원",
    tracks: ["사무직", "영업지원", "문서"],
    difficulty: "intermediate",
    team: "세일즈팀",
    role: "영업지원 담당자",
    reviewer: "영업 리더",
    officeScene: "고객 미팅 메모는 있는데 제안서와 후속 메일이 매번 새로 작성되는 상황",
    onlineSource: "제안서 초안 생성, 미팅 요약, 영업 메일 팔로업 프롬프트",
    koreanContext: "제안 문서는 고객의 조직 구조, 의사결정자, 내부 검토 일정에 맞춰야 합니다.",
    risk: "AI가 가격, 일정, 기능을 확정된 약속처럼 표현하면 계약 리스크가 커집니다.",
    audience: ["고객 미팅 후 제안서와 팔로업이 많은 영업지원 담당자", "고객 요구를 내부 실행 항목으로 바꾸고 싶은 실무자", "AI 초안의 과장과 약속 표현을 검토해야 하는 팀원"],
    outcomes: ["고객 요구와 제약 조건을 구조화합니다.", "제안서 메시지와 근거를 정렬합니다.", "팔로업 메일과 내부 요청을 분리합니다.", "가격, 일정, 약속 표현의 위험을 검토합니다."],
    outputs: ["고객 요구 요약표", "제안서 구조안", "팔로업 메일 초안", "영업 리스크 점검표"],
    modules: ["요구 정리", "제안 구조", "팔로업", "약속 검토"]
  },
  {
    slug: "ai-finance-closing-review",
    title: "AI 재무 정산과 마감 검토 보조 만들기",
    summary: "증빙 요청, 비용 분류, 마감 체크리스트, 이상 항목 설명을 AI 보조 흐름으로 구성합니다.",
    hub: "AI 직무 활용",
    tracks: ["사무직", "재무", "엑셀"],
    difficulty: "intermediate",
    team: "재무팀",
    role: "마감 담당자",
    reviewer: "재무 관리자",
    officeScene: "월말마다 증빙 누락, 비용 계정 분류, 부서 확인 요청이 반복되는 상황",
    onlineSource: "정산 자동화, 비용 분류 보조, 회계 체크리스트 생성 팁",
    koreanContext: "재무 업무에서 AI는 판단자가 아니라 누락과 설명 초안을 잡아주는 보조자여야 합니다.",
    risk: "계정과 세무 판단을 AI에게 맡기면 회사 기준과 법적 해석이 어긋날 수 있습니다.",
    audience: ["정산 자료와 증빙 확인이 많은 재무 담당자", "비용 분류와 마감 체크를 표준화하고 싶은 팀원", "AI 활용 시 책임 경계를 분명히 해야 하는 관리자"],
    outcomes: ["정산 자료의 필수 항목을 정의합니다.", "증빙 누락과 비용 분류 후보를 정리합니다.", "마감 체크리스트를 반복 업무로 만듭니다.", "최종 판단은 사람이 하는 검토 경계를 세웁니다."],
    outputs: ["증빙 요청 템플릿", "비용 분류 후보표", "마감 체크리스트", "재무 검토 경계표"],
    modules: ["자료 수집", "비용 분류", "마감 운영", "책임 검토"]
  },
  {
    slug: "ai-admin-operations-automation",
    title: "AI 총무 운영 자동화 세트 만들기",
    summary: "행사, 비품, 업체, 공지, 신청 폼 업무를 AI와 자동화 도구로 정리하는 운영 세트를 만듭니다.",
    hub: "AI 직무 활용",
    tracks: ["사무직", "총무", "운영"],
    difficulty: "beginner",
    team: "총무팀",
    role: "운영 담당자",
    reviewer: "총무 리더",
    officeScene: "행사 안내, 비품 신청, 업체 연락, 참석자 취합이 동시에 밀려오는 상황",
    onlineSource: "폼 자동화, 공지문 작성, 반복 알림 워크플로 튜토리얼",
    koreanContext: "총무 업무는 친절한 안내와 정확한 마감, 예외 대응 기준이 함께 있어야 현장이 움직입니다.",
    risk: "자동화가 편해 보여도 예외 문의와 승인 기준을 정하지 않으면 담당자에게 일이 되돌아옵니다.",
    audience: ["공지와 신청 관리가 반복되는 총무 담당자", "행사와 비품 업무를 체크리스트로 운영하고 싶은 팀원", "AI와 자동화 도구를 작게 붙여보고 싶은 실무자"],
    outcomes: ["운영 업무를 입력, 정리, 판단으로 나눕니다.", "공지문과 신청 폼 초안을 만듭니다.", "반복 알림과 취합 업무를 자동화 후보로 분류합니다.", "누락과 예외 처리를 체크리스트로 관리합니다."],
    outputs: ["총무 업무 지도", "공지문 초안", "신청 폼 설계표", "운영 자동화 후보표"],
    modules: ["운영 지도", "공지와 폼", "취합 자동화", "예외 관리"]
  },
  {
    slug: "ai-agent-workflow-orchestration",
    title: "AI 에이전트 업무 흐름 설계하기",
    summary: "에이전트를 만능 비서가 아니라 목표, 도구, 절차, 검토 경계가 있는 업무 흐름으로 설계합니다.",
    hub: "AI 에이전트",
    tracks: ["공통", "자동화", "에이전트"],
    difficulty: "advanced",
    team: "AX 추진팀",
    role: "업무 자동화 설계자",
    reviewer: "정보보호 담당 리더",
    officeScene: "여러 AI 도구와 자동화 도구를 연결하고 싶지만 승인, 로그, 실패 처리가 정리되지 않은 상황",
    onlineSource: "AI 에이전트 데모, 업무 자동화 워크플로, 도구 호출 사례",
    koreanContext: "사내 자동화는 빠른 실행보다 승인권자, 로그, 복구 절차가 분명해야 운영됩니다.",
    risk: "에이전트가 도구를 호출하도록 열어두면 잘못된 메일 발송, 파일 수정, 고객 응대가 자동으로 일어날 수 있습니다.",
    audience: ["AI 에이전트와 자동화 워크플로의 차이를 알고 싶은 실무자", "n8n, Zapier, Copilot류 자동화 흐름을 업무에 붙이고 싶은 운영자", "도구 호출과 사람 승인 경계를 설계해야 하는 리더"],
    outcomes: ["에이전트가 필요한 업무와 단순 자동화를 구분합니다.", "도구, 입력, 출력, 실패 처리를 흐름으로 설계합니다.", "사람 승인 지점과 로그 기준을 정합니다.", "작은 업무부터 운영 가능한 에이전트 후보를 만듭니다."],
    outputs: ["에이전트 후보 평가표", "도구 호출 흐름도", "승인 기준표", "운영 로그 체크리스트"],
    modules: ["업무 후보", "도구 설계", "승인 경계", "운영 로그"]
  },
  {
    slug: "ai-knowledge-base-notebook",
    title: "AI 지식베이스와 노트북형 리서치 운영하기",
    summary: "사내 문서, 공개 자료, 영상 요약을 출처 기반 노트북으로 묶고 질문-답변 가능한 지식베이스로 운영합니다.",
    hub: "AI 지식관리",
    tracks: ["공통", "리서치", "문서"],
    difficulty: "intermediate",
    team: "지식관리 TF",
    role: "문서 운영자",
    reviewer: "업무 프로세스 오너",
    officeScene: "사내 가이드, 회의록, 외부 자료가 흩어져 신규 구성원이 같은 질문을 반복하는 상황",
    onlineSource: "출처 기반 노트북, RAG 개념 설명, 사내 지식베이스 운영 사례",
    koreanContext: "사내 지식은 최신 문서와 폐기 문서를 구분하지 않으면 오래된 답변이 공식처럼 퍼집니다.",
    risk: "출처 기반 답변이라도 문서가 낡았거나 권한 범위를 벗어나면 잘못된 지침이 됩니다.",
    audience: ["자료가 흩어져 있어 팀 지식으로 남지 않는 조직", "NotebookLM류 출처 기반 도구를 업무에 쓰고 싶은 실무자", "AI 답변의 근거 문서를 함께 관리해야 하는 담당자"],
    outcomes: ["지식베이스에 넣을 자료와 제외할 자료를 구분합니다.", "질문 세트와 요약 형식을 설계합니다.", "출처 기반 답변의 한계를 검토합니다.", "업데이트와 폐기 주기를 정합니다."],
    outputs: ["자료 수집 기준표", "질문 세트", "출처 기반 요약 카드", "지식베이스 운영 규칙"],
    modules: ["자료 선별", "질문 설계", "출처 답변", "운영 규칙"]
  },
  {
    slug: "ai-risk-privacy-governance",
    title: "AI 활용 리스크와 개인정보 검토하기",
    summary: "AI 업무 활용 전에 민감정보, 저작권, 환각, 편향, 책임 소재를 점검하는 실무 거버넌스 웹북입니다.",
    hub: "AI 거버넌스",
    tracks: ["공통", "운영 기준", "보안"],
    difficulty: "advanced",
    team: "정보보호·컴플라이언스 협의체",
    role: "AI 사용 기준 담당자",
    reviewer: "보안책임자",
    officeScene: "부서마다 AI를 쓰기 시작했지만 입력 금지 정보와 외부 공개 기준이 통일되지 않은 상황",
    onlineSource: "AI 보안 체크리스트, 개인정보 비식별화, 저작권·환각 리스크 설명",
    koreanContext: "국내 기업 환경에서는 개인정보, 영업비밀, 고객사 자료, 저작권을 구분한 내부 기준이 필요합니다.",
    risk: "편리한 AI 활용이 개인정보 유출, 저작권 침해, 승인 없는 외부 공유로 이어질 수 있습니다.",
    audience: ["팀의 AI 사용 기준을 만들어야 하는 관리자", "민감정보와 저작권 리스크가 걱정되는 실무자", "AI 결과물을 외부에 내보내기 전에 검토 기준이 필요한 조직"],
    outcomes: ["AI에 넣으면 안 되는 정보를 분류합니다.", "공개 자료와 생성물의 저작권 위험을 점검합니다.", "환각과 편향을 검토하는 절차를 만듭니다.", "업무 책임과 승인 경계를 명확히 합니다."],
    outputs: ["AI 입력 금지 목록", "저작권 검토표", "환각 점검 루틴", "팀 AI 사용 기준 초안"],
    modules: ["민감정보", "저작권", "환각과 편향", "승인 기준"]
  }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeHtml(value) {
  return escapeXml(value).replaceAll("'", "&#39;");
}

function hasBatchim(value) {
  const chars = Array.from(String(value).trim()).reverse();
  const lastKorean = chars.find((char) => {
    const code = char.charCodeAt(0);
    return code >= 0xac00 && code <= 0xd7a3;
  });
  if (!lastKorean) return false;
  return (lastKorean.charCodeAt(0) - 0xac00) % 28 !== 0;
}

function objectJosa(value) {
  return `${value}${hasBatchim(value) ? "을" : "를"}`;
}

function subjectJosa(value) {
  return `${value}${hasBatchim(value) ? "이" : "가"}`;
}

function pick(list, index) {
  return list[index % list.length];
}

function moduleProfile(spec, moduleTitle, moduleIndex) {
  const output = pick(spec.outputs, moduleIndex);
  const nextOutput = pick(spec.outputs, moduleIndex + 1);
  const reviewOutput = pick(spec.outputs, moduleIndex + 2);
  return {
    id: `module-${String(moduleIndex + 1).padStart(2, "0")}`,
    title: moduleTitle,
    output,
    nextOutput,
    reviewOutput,
    workplaceCase: `${spec.team}의 ${subjectJosa(spec.role)} ${spec.officeScene}에서 ${objectJosa(moduleTitle)} 맡았습니다.`,
    decision: `${spec.reviewer}에게 공유하기 전에 ${output}의 목적, 출처, 검토 기준을 한 문장으로 고정합니다.`,
    sourceUse: `${spec.onlineSource}에서 가져온 방법은 그대로 복사하지 않고 사내 양식, 보안 기준, 보고 톤에 맞춰 다시 씁니다.`,
    officeDetail: `${spec.koreanContext} ${moduleTitle} 단계에서는 담당자, 마감, 승인 여부가 산출물 안에 보여야 합니다.`,
    risk: spec.risk,
    promptTarget: `${objectJosa(moduleTitle)} 위해 필요한 입력 자료, 제외할 정보, 원하는 결과 형식, 사람이 확인할 기준을 정리`
  };
}

function makeContainerIntro(spec) {
  return [
    `## ${spec.title}`,
    "",
    spec.summary,
    "",
    "이 웹북은 온라인에서 널리 공유되는 AI 활용법을 한국 회사의 실제 업무 흐름으로 다시 편집한 실무서입니다. 빠른 팁을 모아두는 데서 끝내지 않고, 보고 대상, 결재선, 보안 기준, 사내 양식, 검토 책임까지 한 페이지 안에 남기도록 설계했습니다.",
    "",
    `주요 장면은 ${spec.team}의 ${spec.role}가 ${spec.officeScene}입니다. 학습자는 각 모듈에서 읽기, 시각화, 업무 블록 배치, 후보 선택, 최종 산출물 정리를 차례로 수행합니다.`,
    "",
    `편집 원칙: ${spec.risk}`
  ].join("\n");
}

function pageReading(spec, profile, pageTitle, intent, sections) {
  const body = [
    `## ${pageTitle}`,
    "",
    `### 현장 장면`,
    profile.workplaceCase,
    "",
    `### 왜 이 단계가 필요한가`,
    intent,
    "",
    `온라인 활용법은 보통 빠른 결과를 보여주지만, 회사 업무에서는 결과가 누구에게 보고되고 어떤 책임을 남기는지가 더 중요합니다. ${profile.officeDetail}`,
    "",
    ...sections,
    "",
    `### 편집자의 기준`,
    `오늘의 산출물은 '${profile.output}'입니다. 완성본에는 원본 자료, AI에게 준 요청, 사람이 확인한 기준, 다음 담당자가 이어받을 문장이 함께 있어야 합니다.`
  ].join("\n\n");

  return {
    title: `${profile.title}: ${pageTitle}`,
    bodyMarkdown: body,
    paragraphs: [
      profile.workplaceCase,
      intent,
      `완성 산출물: ${profile.output}. ${subjectJosa(spec.reviewer)} 보더라도 출처, 목적, 검토 기준을 바로 확인할 수 있어야 합니다.`
    ],
    checkpoints: [
      "업무 목적과 보고 대상을 한 문장으로 적었습니다.",
      "AI가 참고할 자료와 제외할 자료를 구분했습니다.",
      "결과를 공유하기 전 사람이 확인할 기준을 남겼습니다."
    ],
    footnote: "온라인에서 공개된 팁은 참고 자료입니다. 회사에서 쓰는 순간부터 보안, 책임, 승인 기준이 함께 따라옵니다."
  };
}

function visualPath(spec, moduleIndex) {
  return `/assets/ai-webbook/${spec.slug}-m${String(moduleIndex + 1).padStart(2, "0")}.svg`;
}

function makeVisualSvg(spec, profile, moduleIndex) {
  const palette = pick(palettes, moduleIndex + spec.slug.length);
  const steps = [
    { title: "온라인 팁", desc: spec.onlineSource },
    { title: "업무 번역", desc: profile.promptTarget },
    { title: "사람 검토", desc: `${spec.reviewer} 기준 확인` },
    { title: "웹북 산출물", desc: profile.output }
  ];
  const cards = steps
    .map((step, index) => {
      const x = 46 + index * 218;
      return `
        <g>
          <rect x="${x}" y="190" width="176" height="142" rx="18" fill="#ffffff" stroke="${palette.soft}" stroke-width="2"/>
          <circle cx="${x + 28}" cy="220" r="15" fill="${index % 2 === 0 ? palette.primary : palette.mid}"/>
          <text x="${x + 28}" y="225" text-anchor="middle" font-size="16" font-weight="800" fill="#ffffff">${index + 1}</text>
          <text x="${x + 24}" y="260" font-size="20" font-weight="800" fill="${palette.ink}">${escapeXml(step.title)}</text>
          <foreignObject x="${x + 24}" y="276" width="128" height="46">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font: 13px/1.45 system-ui, -apple-system, Segoe UI, sans-serif; color:#475569;">${escapeHtml(step.desc)}</div>
          </foreignObject>
        </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="520" viewBox="0 0 960 520" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(spec.title)} ${escapeXml(profile.title)} 업무 전환 지도</title>
  <desc id="desc">온라인 AI 활용법을 한국 회사 업무 산출물로 바꾸는 네 단계 흐름</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bg}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.10"/>
    </filter>
  </defs>
  <rect width="960" height="520" rx="28" fill="url(#bg)"/>
  <rect x="34" y="34" width="892" height="452" rx="26" fill="#ffffff" filter="url(#shadow)" opacity="0.92"/>
  <text x="62" y="86" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="18" font-weight="800" fill="${palette.primary}">AX WORKBOOK MAP</text>
  <text x="62" y="122" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="34" font-weight="850" fill="${palette.ink}">${escapeXml(profile.title)}</text>
  <foreignObject x="62" y="142" width="760" height="48">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font: 15px/1.55 system-ui, -apple-system, Segoe UI, sans-serif; color:#475569;">${escapeHtml(profile.workplaceCase)}</div>
  </foreignObject>
  <path d="M220 261 H274 M438 261 H492 M656 261 H710" stroke="${palette.warm}" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 10"/>
  ${cards}
  <rect x="62" y="378" width="836" height="72" rx="18" fill="${palette.soft}" opacity="0.72"/>
  <text x="86" y="407" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="800" fill="${palette.ink}">검토 질문</text>
  <foreignObject x="86" y="418" width="760" height="26">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font: 14px/1.4 system-ui, -apple-system, Segoe UI, sans-serif; color:#334155;">${escapeHtml(profile.decision)}</div>
  </foreignObject>
</svg>
`;
}

function writeVisual(spec, profile, moduleIndex) {
  const filePath = path.join(visualRoot, `${spec.slug}-m${String(moduleIndex + 1).padStart(2, "0")}.svg`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, makeVisualSvg(spec, profile, moduleIndex), "utf8");
}

function makeCanvasHtml(spec, profile, moduleIndex) {
  const palette = pick(palettes, moduleIndex + spec.slug.length);
  const scenarios = [
    {
      label: "실무자 관점",
      title: `${spec.role}의 첫 작업`,
      brief: profile.promptTarget,
      output: profile.output,
      caution: "AI 결과를 초안으로 두고 원본 자료와 사내 양식을 대조합니다."
    },
    {
      label: "리더 관점",
      title: `${subjectJosa(spec.reviewer)} 보는 기준`,
      brief: profile.decision,
      output: profile.reviewOutput,
      caution: "보고 전 책임 표현, 고객사 노출 가능성, 승인 여부를 확인합니다."
    },
    {
      label: "운영 관점",
      title: "다음 달에도 반복할 구조",
      brief: profile.sourceUse,
      output: profile.nextOutput,
      caution: profile.risk
    }
  ];

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: ${palette.bg};
      color: ${palette.ink};
    }
    .wrap { min-height: 100vh; padding: 28px; display: grid; align-content: start; gap: 18px; }
    .hero {
      border: 1px solid #e5e7eb;
      background: #fff;
      padding: 22px;
      box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
    }
    .eyebrow { margin: 0 0 8px; color: ${palette.primary}; font-size: 12px; font-weight: 900; letter-spacing: .08em; }
    h1 { margin: 0; font-size: clamp(24px, 4vw, 38px); line-height: 1.12; letter-spacing: 0; }
    .lead { margin: 12px 0 0; color: #475569; line-height: 1.65; font-size: 15px; }
    .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    button {
      border: 1px solid #dbe3ef;
      background: #fff;
      color: ${palette.ink};
      min-height: 44px;
      padding: 10px 12px;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      transition: transform .16s ease, border-color .16s ease, background .16s ease;
    }
    button:hover { border-color: ${palette.primary}; }
    button.active { background: ${palette.soft}; border-color: ${palette.primary}; color: ${palette.primary}; }
    button:active { transform: translateY(1px); }
    .board { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(240px, .9fr); gap: 14px; }
    .panel { border: 1px solid #e5e7eb; background: #fff; padding: 18px; min-height: 260px; }
    .label { margin: 0; font-size: 12px; font-weight: 900; color: ${palette.primary}; }
    .title { margin: 8px 0 0; font-size: 23px; line-height: 1.25; font-weight: 850; }
    .text { margin: 12px 0 0; color: #475569; line-height: 1.72; }
    .metric { display: grid; gap: 8px; margin-top: 18px; }
    .metric div { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #eef2f7; padding-top: 9px; font-size: 13px; }
    .metric b { color: ${palette.ink}; }
    .flow svg { width: 100%; height: auto; display: block; }
    .note { border-left: 4px solid ${palette.warm}; background: #fff7ed; padding: 13px 14px; color: #7c2d12; font-size: 13px; line-height: 1.6; }
    @media (max-width: 760px) {
      .wrap { padding: 18px; }
      .tabs, .board { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <p class="eyebrow">INTERACTIVE WORKBOOK</p>
      <h1>${escapeHtml(profile.title)} 업무 전환판</h1>
      <p class="lead">${escapeHtml(profile.workplaceCase)} 아래 버튼을 눌러 같은 온라인 AI 팁이 실무자, 리더, 운영 관점에서 어떻게 달라지는지 비교해 보세요.</p>
    </section>
    <nav class="tabs" id="tabs"></nav>
    <section class="board">
      <article class="panel">
        <p class="label" id="label"></p>
        <h2 class="title" id="title"></h2>
        <p class="text" id="brief"></p>
        <div class="metric">
          <div><span>완성 산출물</span><b id="output"></b></div>
          <div><span>검토자</span><b>${escapeHtml(spec.reviewer)}</b></div>
          <div><span>사내 기준</span><b>출처·보안·승인</b></div>
        </div>
      </article>
      <article class="panel flow" aria-label="업무 흐름도">
        <svg viewBox="0 0 420 280" role="img" aria-label="온라인 팁에서 웹북 산출물까지의 흐름">
          <rect x="16" y="24" width="120" height="72" fill="${palette.soft}" stroke="${palette.primary}" stroke-width="2"/>
          <rect x="150" y="104" width="120" height="72" fill="#fff" stroke="${palette.mid}" stroke-width="2"/>
          <rect x="284" y="184" width="120" height="72" fill="#fff7ed" stroke="${palette.warm}" stroke-width="2"/>
          <path d="M136 60 C184 60 154 140 150 140 M270 140 C318 140 288 220 284 220" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
          <text x="76" y="55" text-anchor="middle" font-size="14" font-weight="800" fill="${palette.ink}">온라인 팁</text>
          <text x="76" y="77" text-anchor="middle" font-size="12" fill="#475569">선별</text>
          <text x="210" y="135" text-anchor="middle" font-size="14" font-weight="800" fill="${palette.ink}">업무 번역</text>
          <text x="210" y="157" text-anchor="middle" font-size="12" fill="#475569">양식화</text>
          <text x="344" y="215" text-anchor="middle" font-size="14" font-weight="800" fill="${palette.ink}">사람 검토</text>
          <text x="344" y="237" text-anchor="middle" font-size="12" fill="#475569">공유</text>
        </svg>
      </article>
    </section>
    <aside class="note" id="caution"></aside>
  </main>
  <script>
    const scenarios = ${JSON.stringify(scenarios)};
    let current = 0;
    const tabs = document.getElementById("tabs");
    function render() {
      tabs.innerHTML = scenarios.map((item, index) => '<button type="button" class="' + (index === current ? 'active' : '') + '" data-index="' + index + '">' + item.label + '</button>').join("");
      tabs.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          current = Number(button.dataset.index);
          render();
        });
      });
      const item = scenarios[current];
      document.getElementById("label").textContent = item.label;
      document.getElementById("title").textContent = item.title;
      document.getElementById("brief").textContent = item.brief;
      document.getElementById("output").textContent = item.output;
      document.getElementById("caution").textContent = item.caution;
    }
    render();
  </script>
</body>
</html>`;
}

function codeCanvasBlock(id, spec, profile, moduleIndex) {
  const code = makeCanvasHtml(spec, profile, moduleIndex);
  return {
    id: `${id}-canvas-block`,
    type: "code-canvas",
    props: {
      kind: "html",
      artifactId: `${spec.slug}-${profile.id}-canvas`,
      prompt: `${spec.title} / ${profile.title} 업무 전환판을 HTML, CSS, JS로 구성`,
      code,
      entry: "index.html",
      files: {
        "index.html": code
      },
      assets: [],
      runtime: "sandboxed-iframe",
      version: 1,
      status: "generated",
      notes: "정적 생성된 인터랙티브 웹북 보조 화면입니다."
    }
  };
}

function imageDefinitionBlock(id, spec, profile, moduleIndex) {
  return {
    id: `${id}-visual`,
    type: "image-definition",
    props: {
      image: visualPath(spec, moduleIndex),
      alt: `${spec.title} ${profile.title} 업무 전환 지도`,
      label: "업무 전환 지도",
      text: `${profile.title} 단계에서는 ${spec.onlineSource}의 팁을 사내 양식, 검토자, 승인 기준이 있는 ${profile.output}로 바꿉니다.`
    }
  };
}

function introExampleBlocks(id, spec, profile) {
  return [
    {
      id: `${id}-summary`,
      type: "intro-summary",
      props: {
        outputs: [
          profile.output,
          profile.nextOutput,
          `${spec.reviewer} 검토 질문`,
          "다음 업무에 재사용할 요청문"
        ]
      }
    },
    {
      id: `${id}-examples`,
      type: "example-list",
      props: {
        examples: [
          {
            title: "온라인 팁을 그대로 따라 했을 때",
            items: [
              `${spec.onlineSource}에서 본 문장을 그대로 붙여 넣고 결과만 빠르게 얻습니다.`,
              "보고 대상, 사내 양식, 개인정보 제외 기준을 입력하지 않아 결과가 업무에 맞지 않습니다.",
              "문장이 자연스러워 보여도 출처와 검토 책임이 없어 팀 표준으로 쓰기 어렵습니다."
            ]
          },
          {
            title: "한국 업무 웹북으로 편집했을 때",
            items: [
              `${spec.team}의 실제 상황을 입력하고 ${subjectJosa(spec.reviewer)} 확인할 기준을 함께 적습니다.`,
              `${profile.output}, ${profile.nextOutput}, ${profile.reviewOutput}처럼 결과물을 이름 붙여 남깁니다.`,
              "AI 답변, 원본 자료, 사람의 수정 내역을 분리해 다음 담당자가 추적할 수 있게 합니다."
            ]
          }
        ]
      }
    }
  ];
}

function checklistBlock(id, spec, profile) {
  return {
    id: `${id}-checklist`,
    type: "checklist",
    props: {
      title: `${profile.title} 실무 체크리스트`,
      items: [
        `${spec.onlineSource}에서 가져온 방법의 출처와 적용 조건을 적었습니다.`,
        `${spec.team}에서 실제로 쓰는 양식, 용어, 승인 흐름에 맞게 바꿨습니다.`,
        "AI에 넣으면 안 되는 개인정보, 고객사 정보, 영업비밀을 제거했습니다.",
        `${subjectJosa(spec.reviewer)} 확인할 기준을 결과물 상단에 남겼습니다.`,
        `${objectJosa(profile.output)} 다음 달에도 다시 쓸 수 있도록 파일명, 담당자, 기준일을 붙였습니다.`
      ]
    }
  };
}

function quizBlock(id, spec, profile) {
  const answer = "출처, 업무 맥락, 출력 형식, 사람 검토 기준을 함께 넣고 결과를 원본과 대조한다.";
  return {
    id: `${id}-quiz`,
    type: "quiz",
    props: {
      question: `${profile.title} 단계에서 가장 상용 도서 수준에 가까운 AI 활용 방식은 무엇인가요?`,
      options: [
        answer,
        "영상에서 본 프롬프트를 그대로 복사하고 결과 문장이 자연스러우면 바로 공유한다.",
        `${spec.reviewer} 검토를 생략하고 AI가 확정한 일정과 표현을 그대로 사용한다.`
      ],
      answer
    }
  };
}

function boardBlock(id, spec, profile, stateKey) {
  return {
    id: `${id}-board`,
    type: "block-board",
    writes: { key: stateKey },
    props: {
      blockGroups: [
        {
          title: "입력 자료",
          description: "AI에게 주기 전에 정리하거나 제거해야 할 자료입니다.",
          blocks: [
            {
              id: `${id}-input-source`,
              label: "공개 팁 출처",
              category: "input",
              description: spec.onlineSource,
              axReason: "출처를 남겨야 나중에 업데이트와 폐기 판단을 할 수 있습니다.",
              examples: ["영상 링크", "공식 문서", "작성일"]
            },
            {
              id: `${id}-input-office`,
              label: "사내 양식",
              category: "input",
              description: `${spec.team}에서 실제로 쓰는 보고서, 메일, 표 양식`,
              axReason: "업무 양식을 알려주면 AI 결과를 바로 검토 가능한 형태로 받을 수 있습니다.",
              examples: ["보고 템플릿", "메일 톤", "엑셀 열 이름"]
            }
          ]
        },
        {
          title: "AI 정리 작업",
          description: "AI에게 맡겨도 되는 초안화, 분류, 변환 작업입니다.",
          blocks: [
            {
              id: `${id}-organize-draft`,
              label: "초안 생성",
              category: "organize",
              description: profile.promptTarget,
              axReason: "초안은 속도를 높이지만 최종 판단을 대신하지 않습니다.",
              examples: [profile.output, "요청문", "요약표"]
            },
            {
              id: `${id}-organize-format`,
              label: "형식 변환",
              category: "organize",
              description: `${profile.nextOutput} 형식으로 재배열`,
              axReason: "같은 내용을 보고서, 메일, 체크리스트로 바꾸는 작업은 반복 가치가 큽니다.",
              examples: ["표 변환", "목차화", "체크리스트화"]
            }
          ]
        },
        {
          title: "사람 판단",
          description: "공유 전 사람이 멈춰서 확인해야 하는 기준입니다.",
          blocks: [
            {
              id: `${id}-judge-risk`,
              label: "리스크 검토",
              category: "judge",
              description: spec.risk,
              axReason: "AI가 만든 결과가 매끄러워도 책임은 회사와 담당자에게 남습니다.",
              examples: ["개인정보", "저작권", "고객 약속"]
            },
            {
              id: `${id}-judge-approval`,
              label: "승인 경계",
              category: "judge",
              description: `${subjectJosa(spec.reviewer)} 확인해야 할 승인 기준`,
              axReason: "보고, 배포, 외부 공유는 자동화보다 승인 기록이 먼저입니다.",
              examples: ["결재선", "배포 범위", "보류 조건"]
            }
          ]
        }
      ]
    }
  };
}

function makePage({ spec, profile, moduleIndex, pageIndex, slug, title, intent, sections, blocks, layout = "split" }) {
  const id = `${profile.id}-p${String(pageIndex + 1).padStart(2, "0")}-${slug}`;
  return {
    id,
    title: `${profile.title}: ${title}`,
    left: pageReading(spec, profile, title, intent, sections),
    workspace: {
      layout,
      blocks
    }
  };
}

function makeGeneratedPages(spec, profile, moduleIndex) {
  const stateKey = `${spec.slug}-${profile.id}-workflow`;
  const selectedKey = `${spec.slug}-${profile.id}-selected`;
  return [
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 0,
      slug: "canvas",
      title: "업무 전환판으로 큰 흐름 보기",
      intent: `이 페이지는 '${profile.title}'를 단순 지식이 아니라 반복 가능한 업무 흐름으로 바라보게 합니다.`,
      sections: [
        "### 읽는 법",
        `버튼을 바꾸며 ${spec.role}, ${spec.reviewer}, 운영 담당자의 관점이 어떻게 달라지는지 비교합니다. 같은 AI 활용법이라도 실무자에게는 입력 정리, 리더에게는 검토 기준, 운영자에게는 재사용 규칙이 됩니다.`
      ],
      blocks: [codeCanvasBlock(`${profile.id}-p01`, spec, profile, moduleIndex)],
      layout: "focus"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 1,
      slug: "visual-map",
      title: "온라인 팁을 사내 산출물로 바꾸기",
      intent: "그림으로 흐름을 먼저 잡으면 페이지마다 무엇을 읽고, 무엇을 만들고, 어디서 검토해야 하는지 분명해집니다.",
      sections: [
        "### 한국 업무 맥락",
        `${profile.sourceUse} 특히 ${spec.koreanContext}`,
        "### 적용 포인트",
        `${profile.output}에는 '누가 볼 것인가', '무엇을 결정할 것인가', '어떤 정보는 제외할 것인가'가 함께 적혀야 합니다.`
      ],
      blocks: [imageDefinitionBlock(`${profile.id}-p02`, spec, profile, moduleIndex)],
      layout: "stack"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 2,
      slug: "case-edit",
      title: "실무 사례로 다시 쓰기",
      intent: "좋은 AI 활용은 프롬프트 문장이 아니라 업무 사례를 정확히 잡는 데서 시작합니다.",
      sections: [
        "### 사례 편집",
        `${profile.workplaceCase} 여기서 AI에게 맡길 일은 '판단'이 아니라 초안화, 분류, 비교, 형식 변환입니다.`,
        "### 문장 품질 기준",
        "상용 도서 수준의 문장은 멋진 표현보다 독자가 바로 행동할 수 있는 기준을 남깁니다. 담당자, 기한, 확인 자료, 보류 조건이 빠진 문장은 아직 초안입니다."
      ],
      blocks: introExampleBlocks(`${profile.id}-p03`, spec, profile),
      layout: "grid"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 3,
      slug: "prompt-boundary",
      title: "요청문과 보안 경계 세우기",
      intent: "AI에게 잘 맡기는 것과 회사 정보를 안전하게 지키는 것을 같은 페이지에서 처리합니다.",
      sections: [
        "### 요청문 뼈대",
        `역할: ${spec.role}. 상황: ${spec.officeScene}. 작업: ${profile.promptTarget}. 형식: ${profile.output}. 검토 기준: ${spec.reviewer}가 확인할 수 있는 출처와 보류 조건.`,
        "### 제외 기준",
        "개인정보, 고객사 비공개 정보, 내부 매출 원본, 법무 검토 전 계약 문구는 그대로 넣지 않습니다. 필요한 경우 익명화한 예시나 범주만 제공합니다."
      ],
      blocks: [checklistBlock(`${profile.id}-p04`, spec, profile)],
      layout: "split"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 4,
      slug: "workflow-board",
      title: "업무 블록을 배치해 흐름 만들기",
      intent: "학습자가 직접 입력, 정리, 판단 블록을 골라 배치하며 AI가 들어갈 지점을 찾습니다.",
      sections: [
        "### 실습 방법",
        "왼쪽 설명을 읽고 오른쪽의 업무 블록을 클릭하거나 끌어 배치합니다. 많이 넣는 것보다 'AI에게 맡길 초안 작업'과 '사람이 멈춰 볼 판단 작업'을 분리하는 것이 핵심입니다.",
        "### 좋은 흐름",
        `좋은 흐름은 ${objectJosa(profile.output)} 빠르게 만들면서도 ${subjectJosa(spec.reviewer)} 확인할 지점을 잃지 않습니다.`
      ],
      blocks: [boardBlock(`${profile.id}-p05`, spec, profile, stateKey)],
      layout: "stack"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 5,
      slug: "flow-review",
      title: "배치한 흐름을 검토하기",
      intent: "앞 페이지에서 만든 업무 흐름이 실제로 운영 가능한지 검토합니다.",
      sections: [
        "### 검토 기준",
        "입력 자료가 충분한지, AI 정리 작업이 과도하지 않은지, 사람 판단이 마지막에만 몰려 있지 않은지 확인합니다.",
        "### 팀 공유 문장",
        `\"${profile.title} 단계에서는 ${objectJosa(profile.output)} 먼저 만들고, ${subjectJosa(spec.reviewer)} 출처와 승인 경계를 확인한 뒤 공유한다\"처럼 한 문장으로 정리합니다.`
      ],
      blocks: [
        {
          id: `${profile.id}-p06-state`,
          type: "state-summary",
          reads: { key: stateKey },
          props: {}
        }
      ],
      layout: "stack"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 6,
      slug: "candidate-select",
      title: "오늘 바로 바꿀 후보 선택하기",
      intent: "큰 자동화보다 다음 업무 시간에 바로 시도할 작은 후보 하나를 고릅니다.",
      sections: [
        "### 선택 기준",
        "자주 반복되고, 입력 자료가 비교적 명확하며, 사람이 최종 확인할 수 있는 업무를 먼저 고릅니다.",
        "### 조직 안착",
        "첫 후보는 성공 사례보다 운영 규칙을 남기는 데 의미가 있습니다. 작은 성공 하나가 다음 컨테이너의 표준이 됩니다."
      ],
      blocks: [
        {
          id: `${profile.id}-p07-select`,
          type: "candidate-select",
          reads: { key: stateKey },
          writes: { key: selectedKey },
          props: {}
        },
        {
          id: `${profile.id}-p07-result`,
          type: "result-card",
          reads: { key: selectedKey },
          props: {
            title: `${profile.title} 첫 적용 후보`,
            emptyText: "앞 페이지에서 업무 블록을 배치한 뒤, 오늘 바로 시도할 후보 하나를 선택하세요."
          }
        }
      ],
      layout: "stack"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 7,
      slug: "risk-quiz",
      title: "리스크 신호를 골라내기",
      intent: "AI 활용에서 가장 위험한 순간은 결과가 너무 자연스러워 사람이 검토를 건너뛰는 때입니다.",
      sections: [
        "### 위험 신호",
        `${profile.risk} 특히 외부 공유, 고객 약속, 비용·일정 확정, 개인정보가 포함된 결과는 검토 없이 넘기지 않습니다.`,
        "### 퀴즈의 목적",
        "정답을 맞히는 것보다 조직에서 어떤 사용법을 금지해야 하는지 말로 설명하는 데 초점을 둡니다."
      ],
      blocks: [quizBlock(`${profile.id}-p08`, spec, profile)],
      layout: "grid"
    }),
    makePage({
      spec,
      profile,
      moduleIndex,
      pageIndex: 8,
      slug: "package",
      title: "웹북 산출물로 패키징하기",
      intent: "마지막 페이지에서는 앞에서 고른 후보를 팀에서 재사용할 수 있는 웹북 산출물로 묶습니다.",
      sections: [
        "### 패키징 기준",
        `${objectJosa(profile.output)} 만들 때는 읽는 사람의 역할을 먼저 적습니다. 실무자는 실행 절차를, ${spec.reviewer}는 검토 기준을, 다음 담당자는 재사용 조건을 볼 수 있어야 합니다.`,
        "### 다음 행동",
        `다음 업무에서 ${profile.nextOutput}로 확장하고, 한 달 뒤에는 실제 사용 로그를 모아 ${profile.reviewOutput}로 업데이트합니다.`
      ],
      blocks: [
        {
          id: `${profile.id}-p09-result`,
          type: "result-card",
          reads: { key: selectedKey },
          props: {
            title: `${profile.output} 패키지`,
            emptyText: `${profile.title} 흐름에서 선택한 후보를 바탕으로 ${objectJosa(profile.output)} 완성하세요.`
          }
        }
      ],
      layout: "focus"
    })
  ];
}

function makeModule(spec, moduleTitle, moduleIndex) {
  const profile = moduleProfile(spec, moduleTitle, moduleIndex);
  writeVisual(spec, profile, moduleIndex);
  return {
    id: profile.id,
    title: `모듈 ${moduleIndex + 1}. ${moduleTitle}`,
    lessons: [
      {
        id: `${profile.id}-webbook`,
        title: moduleTitle,
        pages: makeGeneratedPages(spec, profile, moduleIndex)
      }
    ]
  };
}

function makeContainer(spec, index) {
  const coverImage = coverImages[index % coverImages.length];
  return {
    id: spec.slug,
    slug: spec.slug,
    title: spec.title,
    summary: spec.summary,
    coverImage,
    updatedAt,
    introMarkdown: makeContainerIntro(spec),
    pricing: {
      originalPrice: 0,
      discountRate: 0
    },
    recommendationCards: recommendationImages.map((image, cardIndex) => ({
      image,
      text: spec.audience[cardIndex % spec.audience.length]
    })),
    status: "published",
    access: "free",
    hub: spec.hub,
    tracks: spec.tracks,
    audience: spec.audience,
    difficulty: spec.difficulty,
    outcomes: spec.outcomes,
    outputs: spec.outputs,
    modules: spec.modules.map((moduleTitle, moduleIndex) => makeModule(spec, moduleTitle, moduleIndex))
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function existingSpec(slug, container, moduleTitle) {
  if (slug === "ai-literacy-starter") {
    return {
      slug,
      title: container.title,
      summary: container.summary,
      team: "사내 AI 기초교육반",
      role: "비전공 실무자",
      reviewer: "교육 운영자",
      officeScene: "AI 용어는 익숙하지만 업무 적용 전 원리와 한계를 설명하기 어려운 상황",
      onlineSource: "AI 입문 강의, 생성형 AI 해설 영상, 모델 원리 블로그",
      koreanContext: "비전공자 교육에서는 어려운 수식보다 현업 예시, 오해 방지, 검토 습관이 중요합니다.",
      risk: "AI를 만능 답변기로 이해하면 환각과 편향을 놓치고 결과를 과신합니다.",
      outputs: container.outputs?.length ? container.outputs : ["AI 기본 개념 지도", "LLM 작동 흐름 설명", "AI 오류 지점 체크 구조"],
      modules: [moduleTitle]
    };
  }
  return {
    slug,
    title: container.title,
    summary: container.summary,
    team: "AX 실무 워크숍",
    role: "사무직 실무자",
    reviewer: "팀장",
    officeScene: "하루 업무에서 반복 작업은 많지만 AI를 어디에 넣어야 할지 합의되지 않은 상황",
    onlineSource: "업무 자동화 영상, 프롬프트 사례, AX 전환 강의",
    koreanContext: "한국 조직에서는 작은 개선도 팀장 보고, 담당자 합의, 검토 기준이 있어야 계속 운영됩니다.",
    risk: "AI 전환을 도구 도입으로만 보면 실제 업무 흐름과 사람 검토가 빠집니다.",
    outputs: container.outputs?.length ? container.outputs : ["타임라인 전환 프롬프트", "AI 적용 후보 목록", "사람 검토 기준표"],
    modules: [moduleTitle]
  };
}

function supplementBlock(id, spec, profile, pageIndex, moduleIndex) {
  const mode = pageIndex % 6;
  if (mode === 0) return codeCanvasBlock(id, spec, profile, moduleIndex);
  if (mode === 1) return imageDefinitionBlock(id, spec, profile, moduleIndex);
  if (mode === 2) return introExampleBlocks(id, spec, profile);
  if (mode === 3) return checklistBlock(id, spec, profile);
  if (mode === 4) return quizBlock(id, spec, profile);
  return {
    id: `${id}-result`,
    type: "result-card",
    props: {
      title: `${profile.output} 정리`,
      emptyText: `${profile.title}에서 배운 내용을 바탕으로 업무 적용 메모를 작성하세요.`
    }
  };
}

function makeSupplementReplacement(container, module, moduleIndex, page, pageIndex) {
  const cleanTitle = module.title.replace(/^모듈\s*\d+\.\s*/, "");
  const spec = existingSpec(container.slug, container, cleanTitle);
  const profile = moduleProfile(spec, cleanTitle, moduleIndex);
  writeVisual(spec, profile, moduleIndex);
  const titleByMode = [
    "실무 적용 흐름 다시 보기",
    "그림으로 보는 업무 전환 지도",
    "한국 업무 사례로 다시 쓰기",
    "요청문과 검토 기준 정리하기",
    "위험 신호 점검하기",
    "재사용 산출물로 묶기"
  ];
  const title = titleByMode[pageIndex % titleByMode.length];
  const blocks = supplementBlock(`${page.id || `${profile.id}-p${pageIndex + 1}`}`, spec, profile, pageIndex, moduleIndex);
  return {
    id: page.id || `${profile.id}-supplement-${pageIndex + 1}`,
    title: `${cleanTitle}: ${title}`,
    left: pageReading(
      spec,
      profile,
      title,
      "기존 보강 페이지를 단순 분량 채우기가 아니라 실제 업무 적용과 검토 루틴을 남기는 페이지로 바꿉니다.",
      [
        "### 보강 방향",
        `${profile.sourceUse} 이 페이지에서는 개념 설명을 ${spec.team}의 업무 언어로 다시 정리합니다.`,
        "### 품질 기준",
        "좋은 학습 페이지는 읽은 뒤 행동이 남아야 합니다. 따라서 설명, 예시, 검토 기준, 다음 산출물을 한 화면에 연결합니다."
      ]
    ),
    workspace: {
      layout: pageIndex % 2 === 0 ? "focus" : "split",
      blocks: Array.isArray(blocks) ? blocks : [blocks]
    }
  };
}

function upgradeExistingContainer(slug) {
  const filePath = path.join(contentRoot, slug, "container.json");
  if (!fs.existsSync(filePath)) return;
  const container = JSON.parse(fs.readFileSync(filePath, "utf8"));
  container.updatedAt = updatedAt;
  container.introMarkdown = container.introMarkdown || `## ${container.title}\n\n${container.summary}`;

  container.modules.forEach((module, moduleIndex) => {
    if (!module.lessons?.length) return;
    module.lessons.forEach((lesson) => {
      lesson.pages = (lesson.pages || []).map((page, pageIndex) => {
        if (String(page.id || "").startsWith("supplement-")) {
          return makeSupplementReplacement(container, module, moduleIndex, page, pageIndex);
        }
        return page;
      });
    });
  });

  writeJson(filePath, container);
}

containers.forEach((container, index) => {
  const outputPath = path.join(contentRoot, container.slug, "container.json");
  writeJson(outputPath, makeContainer(container, index));
});

upgradeExistingContainer("ai-literacy-starter");
upgradeExistingContainer("ax-basic");

console.log(`Generated ${containers.length} AI webbook container(s), upgraded existing supplement pages, and wrote SVG visual assets.`);
