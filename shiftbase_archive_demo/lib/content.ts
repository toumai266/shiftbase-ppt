import { containerSpecs, type ContainerRecommendation, type ContainerSpec, type ModuleSpec } from "@/lib/containerSpec";

export const brand = {
  name: "Shiftbase",
  slogan: "당신의 일에 AI라는 날개를 달아보세요"
};

export type CourseLevel = "초급" | "중급" | "고급";
export type CourseIndustry = "사무직" | "공통";
export type CoursePriceType = "무료" | "유료";
export type ModuleFormat = "개념 이해" | "적용 판단" | "따라 하기" | "운영 기준";

export type CourseModuleItem = {
  id: string;
  title: string;
  status: "학습 가능" | "준비 중";
  href?: string;
};

export type CourseModule = {
  slug: string;
  eyebrow: string;
  title: string;
  question: string;
  format: ModuleFormat;
  thumbnail: string;
  status: "학습 가능" | "준비 중";
  href?: string;
  items: CourseModuleItem[];
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  industry: CourseIndustry;
  priceType: CoursePriceType;
  price: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  lessons: number;
  badge: string;
  displayBadges: string[];
  updatedAt: string;
  firstLessonSlug: string;
  recommendedFor: string[];
  recommendations: ContainerRecommendation[];
  introMarkdown: string;
  outcomes: string[];
  outputs: string[];
  modules: CourseModule[];
  curriculum: string[];
};

export const levelFilters: CourseLevel[] = ["초급", "중급", "고급"];
export const industryFilters: CourseIndustry[] = ["사무직", "공통"];
export const priceFilters: CoursePriceType[] = ["무료", "유료"];

function toCourseLevel(difficulty: ContainerSpec["difficulty"]): CourseLevel {
  if (difficulty === "advanced") return "고급";
  if (difficulty === "intermediate") return "중급";
  return "초급";
}

function toCourseIndustry(container: ContainerSpec): CourseIndustry {
  return container.tracks.some((track) => track.includes("사무") || track.includes("총무"))
    ? "사무직"
    : "공통";
}

function getModuleFormat(module: ModuleSpec): ModuleFormat {
  const blockTypes = module.lessons.flatMap((lesson) =>
    lesson.pages.flatMap((page) => page.workspace.blocks.map((block) => block.type))
  );

  if (blockTypes.includes("block-board")) return "따라 하기";
  if (blockTypes.includes("candidate-select") || blockTypes.includes("state-summary")) return "적용 판단";
  if (module.title.includes("검토") || module.title.includes("기준")) return "운영 기준";
  return "개념 이해";
}

function getFirstLesson(container: ContainerSpec) {
  return container.modules[0]?.lessons[0];
}

function getPageCount(container: ContainerSpec) {
  return container.modules.reduce(
    (moduleTotal, module) =>
      moduleTotal + module.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.pages.length, 0),
    0
  );
}

function getLessonCount(container: ContainerSpec) {
  return container.modules.reduce((total, module) => total + module.lessons.length, 0);
}

function normalizePricing(container: ContainerSpec) {
  const originalPrice = Math.max(0, Math.round(container.pricing?.originalPrice ?? 0));
  const discountRate = Math.min(100, Math.max(0, Math.round(container.pricing?.discountRate ?? 0)));
  const salePrice = Math.round(originalPrice * (100 - discountRate) / 100);
  return { originalPrice, discountRate, salePrice };
}

function formatWon(value: number) {
  return value === 0 ? "0원" : `${value.toLocaleString("ko-KR")}원`;
}

function normalizeRecommendations(container: ContainerSpec): ContainerRecommendation[] {
  const fallbackImages = [
    "/assets/audiences/ai-beginner.png",
    "/assets/audiences/automation-worker.png",
    "/assets/audiences/team-leader.png",
    "/assets/audiences/result-learner.png"
  ];
  const fallbackTexts = [
    container.audience[0] ?? "AI 적용 지점을 찾고 싶은 실무자",
    container.audience[1] ?? "반복 업무를 줄이고 싶은 팀원",
    container.audience[2] ?? "팀의 AI 활용 기준이 필요한 리더",
    "결과물 중심으로 배우고 싶은 학습자"
  ];

  return Array.from({ length: 4 }, (_, index) => ({
    image: container.recommendationCards?.[index]?.image ?? fallbackImages[index],
    text: container.recommendationCards?.[index]?.text ?? fallbackTexts[index]
  }));
}

function normalizeDisplayBadges(container: ContainerSpec) {
  return (container.displayBadges ?? []).map((badge) => badge.trim()).filter(Boolean);
}

function toCourseModule(container: ContainerSpec, module: ModuleSpec, index: number): CourseModule {
  const firstLesson = module.lessons[0];
  const published = container.status === "published";
  const href = published && firstLesson ? `/learn/${container.slug}/${firstLesson.id}` : undefined;
  const pages = module.lessons.flatMap((lesson) => lesson.pages);

  return {
    slug: module.id,
    eyebrow: `모듈 ${String(index + 1).padStart(2, "0")}`,
    title: module.title.replace(/^모듈\s*\d+\.\s*/, ""),
    question: pages[1]?.title ?? pages[0]?.title ?? module.title,
    format: getModuleFormat(module),
    thumbnail: container.coverImage ?? "/assets/ax-learning-platform-mockup.png",
    status: published ? "학습 가능" : "준비 중",
    href,
    items: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      status: published ? "학습 가능" : "준비 중",
      href: published ? `/learn/${container.slug}/${lesson.id}` : undefined
    }))
  };
}

function toCourse(container: ContainerSpec): Course {
  const firstLesson = getFirstLesson(container);
  const pricing = normalizePricing(container);
  const priceType = pricing.salePrice === 0 ? "무료" : "유료";

  return {
    slug: container.slug,
    title: container.title,
    subtitle: container.summary,
    description: container.summary,
    level: toCourseLevel(container.difficulty),
    industry: toCourseIndustry(container),
    priceType,
    price: formatWon(pricing.salePrice),
    originalPrice: pricing.originalPrice,
    salePrice: pricing.salePrice,
    discountRate: pricing.discountRate,
    lessons: getLessonCount(container),
    badge: container.status === "published" ? "대표 강의" : "NEW",
    displayBadges: normalizeDisplayBadges(container),
    updatedAt: container.updatedAt ?? "",
    firstLessonSlug: firstLesson?.id ?? "intro",
    recommendedFor: container.audience,
    recommendations: normalizeRecommendations(container),
    introMarkdown: container.introMarkdown ?? [
      "## 컨테이너 소개",
      "",
      container.summary,
      "",
      ...container.outcomes.map((outcome) => `- ${outcome}`)
    ].join("\n"),
    outcomes: container.outcomes,
    outputs: container.outputs,
    modules: container.modules.map((module, index) => toCourseModule(container, module, index)),
    curriculum: container.modules.map((module) => module.title.replace(/^모듈\s*\d+\.\s*/, ""))
  };
}

export const allCourses = containerSpecs.map(toCourse);
export const courses = allCourses.filter((course) => {
  const container = containerSpecs.find((item) => item.slug === course.slug);
  return container?.status === "published";
});
export const featuredCourse = courses[0] ?? allCourses[0];

export const audiences = [
  {
    title: "사무직 실무자",
    pain: "메일, 회의, 문서, 엑셀, 지시사항이 하루 안에서 계속 섞입니다.",
    start: "첫 컨테이너에서 내 업무 타임라인을 만들고 AI가 도울 지점을 찾습니다."
  },
  {
    title: "팀 리더",
    pain: "팀원이 AI를 써보긴 하지만 어디까지 업무에 적용해야 할지 기준이 없습니다.",
    start: "반복되는 입력·정리·판단 업무를 나눠 팀의 첫 AX 후보를 정합니다."
  },
  {
    title: "AI 입문자",
    pain: "뉴스와 유튜브는 AI를 쓰라고 하지만 실제 내 일에 붙이는 방법은 막막합니다.",
    start: "코드 없이 작은 반복 업무부터 AI를 도입하는 방법을 배웁니다."
  }
];

export const capabilityNotice = {
  can: ["컨테이너형 학습", "업무 지도 만들기", "AI 적용 지점 표시", "모듈별 형식 분리"],
  cannot: ["동영상 강의 재생", "계정 기반 저장", "실제 결제"]
};

export const finderQuestions = [
  {
    id: "industry",
    question: "어떤 업무에 가장 가깝나요?",
    options: ["사무직", "공통"]
  },
  {
    id: "level",
    question: "AI 업무 전환 경험은 어느 정도인가요?",
    options: ["초급", "중급", "고급"]
  },
  {
    id: "goal",
    question: "가장 먼저 줄이고 싶은 일은 무엇인가요?",
    options: ["업무분해", "AI적용", "자동화판단", "검토기준"]
  },
  {
    id: "price",
    question: "지금 원하는 수강 방식은 무엇인가요?",
    options: ["무료", "유료"]
  }
] as const;

export const footerSections = [
  {
    title: "시프트베이스",
    links: [
      { label: "시프트베이스 소개", href: "/about" },
      { label: "서비스 홈", href: "/shiftbase" },
      { label: "가격 안내", href: "/pricing" },
      { label: "자료실", href: "/resources" },
      { label: "for business", href: "/enterprise" }
    ]
  },
  {
    title: "고객지원",
    links: [
      { label: "고객지원", href: "/support" },
      { label: "공지사항", href: "/notice" },
      { label: "자주묻는 질문", href: "/faq" }
    ]
  }
];

export const infoPages = {
  about: {
    title: "Shiftbase 소개",
    description:
      "Shiftbase는 설명만 듣는 강의가 아니라, 업무를 분해하고 AI 적용 지점을 판단하는 인터랙티브 학습 서비스입니다.",
    items: ["컨테이너형 학습", "인터랙티브 실습 모듈", "판단 중심 학습"]
  },
  pricing: {
    title: "가격 안내",
    description:
      "현재 MVP에서는 첫 컨테이너를 무료로 제공합니다. 유료 콘텐츠와 결제는 콘텐츠 검증 이후 연결합니다.",
    items: ["첫 컨테이너 무료", "추후 심화 콘텐츠 유료화", "기업교육 별도 문의"]
  },
  resources: {
    title: "자료실",
    description:
      "컨테이너 학습 전후에 참고할 업무 타임라인 예시, AX 전환 후보 예시, 실무 체크리스트를 제공합니다.",
    items: ["업무 타임라인 예시", "AX 전환 후보 예시", "실무 체크리스트"]
  },
  enterprise: {
    title: "기업교육",
    description:
      "팀 단위 교육은 직무별 업무 타임라인과 조직별 AX 적용 기준에 맞춰 구성합니다.",
    items: ["직무별 타임라인", "팀별 AX 후보 도출", "운영 기준 워크숍"]
  },
  support: {
    title: "고객지원",
    description:
      "학습 경로, 모듈 진행, 타임라인 실습, 기업교육 문의에 필요한 안내를 제공합니다.",
    items: ["수강 문의", "실습 문의", "기업교육 문의"]
  },
  notice: {
    title: "공지사항",
    description:
      "Shiftbase의 서비스 업데이트, 콘텐츠 추가, 운영 안내를 확인할 수 있습니다.",
    items: ["서비스 업데이트", "콘텐츠 추가", "운영 안내"]
  },
  faq: {
    title: "자주묻는 질문",
    description:
      "학습 방식, 무료 콘텐츠, 기업교육 문의에 대해 자주 묻는 질문을 정리합니다.",
    items: ["학습 방식", "무료 콘텐츠", "기업교육 문의"]
  },
  privacy: {
    title: "개인정보처리방침",
    description:
      "MVP 데모에서는 계정 저장을 사용하지 않습니다. 향후 계정 기능 연결 시 수집 항목과 보관 기준을 명확히 고지합니다.",
    items: ["브라우저 기반 데모", "민감정보 입력 금지 안내", "계정 기능 도입 전 고지"]
  },
  terms: {
    title: "이용약관",
    description:
      "Shiftbase의 교육 콘텐츠, 인터랙티브 실습, 결과물 이용 기준을 안내합니다.",
    items: ["교육 콘텐츠 이용 범위", "실습 결과물 이용", "서비스 변경 안내"]
  }
} as const;
