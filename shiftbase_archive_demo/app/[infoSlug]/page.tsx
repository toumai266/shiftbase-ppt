import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  LifeBuoy,
  Mail,
  Megaphone,
  PackageOpen,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

type PageLink = {
  href: string;
  label: string;
};

type PageCard = {
  description: string;
  icon?: LucideIcon;
  label?: string;
  title: string;
};

type PageSection = {
  description?: string;
  items: PageCard[];
  title: string;
};

type ServicePageData = {
  description: string;
  eyebrow: string;
  heroCards: PageCard[];
  icon: LucideIcon;
  meta: string[];
  primaryCta: PageLink;
  secondaryCta?: PageLink;
  sections: PageSection[];
  title: string;
};

const servicePages: Record<string, ServicePageData> = {
  about: {
    eyebrow: "About Shiftbase",
    title: "업무를 먼저 보고 AI를 붙이는 학습 플랫폼",
    description:
      "Shiftbase는 도구 사용법을 나열하는 강의가 아니라, 실제 업무를 분해하고 AI가 들어갈 지점을 판단하게 만드는 인터랙티브 학습 서비스입니다.",
    icon: Sparkles,
    meta: ["컨테이너형 학습", "인터랙티브 실습", "판단 중심 커리큘럼"],
    primaryCta: { label: "첫 컨테이너 시작", href: "/learning/ax-basic" },
    secondaryCta: { label: "내 콘텐츠 찾기", href: "/find-course" },
    heroCards: [
      {
        title: "업무 지도",
        description: "하루 업무를 입력, 정리, 판단으로 나눠 반복 구간을 확인합니다.",
        icon: ClipboardList
      },
      {
        title: "AI 적용 후보",
        description: "AI에게 맡길 수 있는 작은 작업과 사람이 검토할 작업을 분리합니다.",
        icon: Sparkles
      },
      {
        title: "결과물",
        description: "학습 후 업무 타임라인, 적용 후보, 검토 기준 같은 산출물을 남깁니다.",
        icon: PackageOpen
      }
    ],
    sections: [
      {
        title: "Shiftbase가 다루는 문제",
        description:
          "AI 활용은 도구 이름을 아는 것보다 내 업무의 구조를 보는 순간부터 시작됩니다.",
        items: [
          {
            title: "어디에 써야 할지 모르겠는 문제",
            description: "메일, 회의, 문서, 표 작업 중 어디부터 AI를 붙일지 판단하는 기준을 제공합니다."
          },
          {
            title: "결과를 그대로 믿기 어려운 문제",
            description: "AI 결과를 사람이 어떤 기준으로 확인해야 하는지 학습 흐름 안에 포함합니다."
          },
          {
            title: "강의를 봐도 업무가 바뀌지 않는 문제",
            description: "설명보다 직접 작성하고 고르는 인터랙션을 중심에 둡니다."
          }
        ]
      },
      {
        title: "학습 방식",
        items: [
          {
            title: "컨테이너",
            description: "하나의 업무 전환 주제를 작은 모듈 묶음으로 제공합니다.",
            icon: BookOpenCheck
          },
          {
            title: "모듈",
            description: "개념 이해, 적용 판단, 따라 하기, 운영 기준을 주제에 맞게 섞습니다.",
            icon: CheckCircle2
          },
          {
            title: "실습",
            description: "실제 고객정보가 아니라 예시 데이터로 안전하게 연습합니다.",
            icon: ShieldCheck
          }
        ]
      }
    ]
  },
  pricing: {
    eyebrow: "Pricing",
    title: "검증된 컨테이너부터 순차적으로 엽니다",
    description:
      "현재는 첫 학습 컨테이너를 무료로 제공하고 있습니다. 유료 컨테이너와 기업교육은 콘텐츠 검증 이후 단계적으로 공개합니다.",
    icon: ReceiptText,
    meta: ["첫 컨테이너 무료", "유료 콘텐츠 준비 중", "기업교육 별도 문의"],
    primaryCta: { label: "무료 컨테이너 보기", href: "/learning/ax-basic" },
    secondaryCta: { label: "기업교육 문의", href: "/enterprise" },
    heroCards: [
      {
        label: "무료",
        title: "Starter",
        description: "AI 업무 전환의 첫 흐름을 체험할 수 있는 대표 컨테이너를 제공합니다.",
        icon: BookOpenCheck
      },
      {
        label: "준비 중",
        title: "Focused Containers",
        description: "보고서, 리서치, 회의록, 엑셀처럼 직무별 컨테이너를 순차 공개합니다.",
        icon: PackageOpen
      },
      {
        label: "문의",
        title: "Team Training",
        description: "조직의 업무 예시와 보안 기준에 맞춘 팀 단위 교육을 구성합니다.",
        icon: UsersRound
      }
    ],
    sections: [
      {
        title: "가격 정책 방향",
        items: [
          {
            title: "무료 학습",
            description: "첫 컨테이너와 일부 자료는 진입 장벽을 낮추기 위해 무료로 유지합니다."
          },
          {
            title: "단일 컨테이너",
            description: "주제별 심화 컨테이너는 개별 구매 또는 패키지 구성을 검토 중입니다."
          },
          {
            title: "기업교육",
            description: "수강 인원, 커스텀 범위, 운영 리포트 제공 여부에 따라 별도 견적을 냅니다."
          }
        ]
      },
      {
        title: "결제 기능 도입 전 안내",
        description:
          "현재 서비스는 결제 화면을 본격 운영하지 않습니다. 유료 기능을 열 때 가격, 제공 범위, 환불 기준을 구매 화면에 함께 고지합니다.",
        items: [
          {
            title: "결제 전 제공 범위 명시",
            description: "강의, 템플릿, 다운로드 자료, 수강 권한을 구분해 표시합니다."
          },
          {
            title: "환불 기준 사전 고지",
            description: "디지털 자료 제공 여부와 수강 진행률을 기준으로 환불 조건을 안내합니다."
          }
        ]
      }
    ]
  },
  resources: {
    eyebrow: "Resources",
    title: "학습 전후에 바로 참고할 업무 전환 자료실",
    description:
      "컨테이너 학습에서 사용하는 업무 타임라인, AI 적용 후보, 검토 기준을 자료 형태로 정리합니다. 자료는 콘텐츠 공개 일정에 맞춰 순차 제공됩니다.",
    icon: FileText,
    meta: ["템플릿", "체크리스트", "예시 데이터"],
    primaryCta: { label: "학습 컨테이너 보기", href: "/learning" },
    secondaryCta: { label: "추천 받기", href: "/find-course" },
    heroCards: [
      {
        label: "무료 자료",
        title: "업무 타임라인 예시",
        description: "하루 업무를 시간대와 작업 유형으로 나누는 기본 예시입니다.",
        icon: ClipboardList
      },
      {
        label: "준비 중",
        title: "AI 적용 후보 표",
        description: "반복 작업을 요약, 분류, 초안, 검토로 나누는 표 형식 자료입니다.",
        icon: Sparkles
      },
      {
        label: "준비 중",
        title: "검토 기준 체크리스트",
        description: "AI 결과를 실제 업무에 쓰기 전 사람이 확인할 항목을 정리합니다.",
        icon: ShieldCheck
      }
    ],
    sections: [
      {
        title: "자료 카테고리",
        items: [
          {
            title: "개인 학습용",
            description: "혼자 학습할 때 작성해보는 워크시트와 예시 데이터를 제공합니다."
          },
          {
            title: "팀 공유용",
            description: "팀 회의에서 업무 후보를 모으고 우선순위를 정할 수 있는 양식을 준비합니다."
          },
          {
            title: "운영 기준용",
            description: "민감정보 입력 방지, 사람 검토, 승인 기준을 점검하는 문서를 제공합니다."
          }
        ]
      },
      {
        title: "자료 공개 원칙",
        description:
          "자료는 실제 고객정보 입력을 유도하지 않도록 예시 데이터 중심으로 구성합니다.",
        items: [
          {
            title: "예시 데이터 우선",
            description: "실습에는 가상 고객명, 가상 문의, 가상 업무 상황을 사용합니다."
          },
          {
            title: "업무 적용 가능성 중심",
            description: "화려한 자료보다 실제 업무 회의에서 바로 읽히는 형식을 우선합니다."
          }
        ]
      }
    ]
  },
  enterprise: {
    eyebrow: "For Business",
    title: "팀의 업무 언어에 맞춘 AX 교육",
    description:
      "기업교육은 일반 강의 목록을 전달하는 방식이 아니라, 팀의 반복 업무와 보안 기준을 반영해 학습 흐름을 조정합니다.",
    icon: BriefcaseBusiness,
    meta: ["직무별 업무지도", "팀 워크숍", "운영 기준 설계"],
    primaryCta: { label: "기업교육 문의", href: "/support#contact" },
    secondaryCta: { label: "Shiftbase 소개", href: "/about" },
    heroCards: [
      {
        title: "업무 진단",
        description: "부서별 반복 업무와 병목을 수집해 교육 범위를 정합니다.",
        icon: ClipboardList
      },
      {
        title: "실습 워크숍",
        description: "팀원이 직접 업무 타임라인과 AI 적용 후보를 작성합니다.",
        icon: UsersRound
      },
      {
        title: "운영 기준",
        description: "민감정보, 승인, 사람 검토 기준을 교육 산출물로 남깁니다.",
        icon: ShieldCheck
      }
    ],
    sections: [
      {
        title: "교육 구성 예시",
        items: [
          {
            title: "입문 워크숍",
            description: "AI를 처음 쓰는 팀을 대상으로 업무 분해와 적용 후보 찾기를 진행합니다."
          },
          {
            title: "직무별 컨테이너",
            description: "보고서, 회의록, 리서치, 엑셀처럼 부서별 반복 업무에 맞춰 구성합니다."
          },
          {
            title: "운영 리더 세션",
            description: "팀장과 운영 담당자가 AI 결과 검토 기준과 사용 범위를 정리합니다."
          }
        ]
      },
      {
        title: "도입 흐름",
        items: [
          {
            label: "01",
            title: "요구사항 확인",
            description: "수강 인원, 직무, 보안 요구사항, 교육 목표를 먼저 확인합니다."
          },
          {
            label: "02",
            title: "커리큘럼 조정",
            description: "기본 컨테이너를 바탕으로 조직에 맞는 예시와 과제를 조정합니다."
          },
          {
            label: "03",
            title: "교육 및 리포트",
            description: "교육 후 팀별 산출물과 다음 적용 후보를 정리합니다."
          }
        ]
      }
    ]
  },
  support: {
    eyebrow: "Support",
    title: "학습 중 막히는 지점을 빠르게 정리합니다",
    description:
      "수강, 실습, 계정, 기업교육 문의를 한곳에서 안내합니다. 현재는 이메일 기반으로 문의를 받고, 자주 묻는 질문과 공지사항을 함께 제공합니다.",
    icon: LifeBuoy,
    meta: ["수강 문의", "실습 문의", "기업교육 문의"],
    primaryCta: { label: "이메일 문의", href: "mailto:info@shiftbase.com" },
    secondaryCta: { label: "FAQ 확인", href: "/faq" },
    heroCards: [
      {
        title: "학습 문의",
        description: "컨테이너 선택, 모듈 진행, 실습 방식에 대한 질문을 받습니다.",
        icon: BookOpenCheck
      },
      {
        title: "서비스 문의",
        description: "계정, 자료, 결제 도입 전 안내, 오류 제보를 정리합니다.",
        icon: LifeBuoy
      },
      {
        title: "기업교육 문의",
        description: "팀 단위 교육, 워크숍, 커스텀 커리큘럼 상담을 받습니다.",
        icon: BriefcaseBusiness
      }
    ],
    sections: [
      {
        title: "문의 전에 알려주시면 좋은 정보",
        description:
          "아래 항목을 함께 보내주시면 더 빠르게 상황을 파악할 수 있습니다.",
        items: [
          {
            title: "이용 중인 페이지",
            description: "예: 학습 컨테이너 목록, 내 콘텐츠 찾기, 내 학습 현황"
          },
          {
            title: "발생한 상황",
            description: "무엇을 클릭했고 어떤 결과를 기대했는지 간단히 적어주세요."
          },
          {
            title: "기업교육 문의 정보",
            description: "조직명, 예상 인원, 희망 교육 주제, 보안 요구사항을 알려주세요."
          }
        ]
      },
      {
        title: "바로 확인할 수 있는 곳",
        items: [
          {
            title: "공지사항",
            description: "서비스 업데이트와 운영 안내를 확인합니다.",
            icon: Megaphone
          },
          {
            title: "자주 묻는 질문",
            description: "학습 방식, 무료 콘텐츠, 기업교육 기준을 먼저 확인합니다.",
            icon: HelpCircle
          },
          {
            title: "개인정보 안내",
            description: "실습 입력 시 실제 고객정보를 넣지 않는 원칙을 확인합니다.",
            icon: ShieldCheck
          }
        ]
      }
    ]
  },
  notice: {
    eyebrow: "Notice",
    title: "서비스 운영과 콘텐츠 공개 소식",
    description:
      "Shiftbase의 업데이트, 콘텐츠 추가, 운영 안내를 정리합니다. 아직 개발 중인 콘텐츠는 공개 일정과 함께 단계적으로 안내합니다.",
    icon: Megaphone,
    meta: ["업데이트", "콘텐츠", "운영 안내"],
    primaryCta: { label: "학습 목록 보기", href: "/learning" },
    secondaryCta: { label: "고객지원", href: "/support" },
    heroCards: [
      {
        label: "2026.05.16",
        title: "첫 무료 컨테이너 공개 준비",
        description: "내 업무를 AI로 전환하기 컨테이너를 중심으로 초기 학습 흐름을 정리하고 있습니다.",
        icon: CalendarDays
      },
      {
        label: "운영",
        title: "개인정보와 이용약관 페이지 추가",
        description: "실습 데이터 입력 기준과 AI 결과 검토 원칙을 서비스 정책에 반영했습니다.",
        icon: ShieldCheck
      },
      {
        label: "예정",
        title: "자료실 순차 공개",
        description: "업무 타임라인, AI 적용 후보 표, 검토 기준 체크리스트를 순차 공개할 예정입니다.",
        icon: FileText
      }
    ],
    sections: [
      {
        title: "최근 공지",
        items: [
          {
            label: "업데이트",
            title: "고객지원과 FAQ 페이지 정비",
            description: "서비스 이용 전 확인할 수 있는 기본 안내 페이지를 보강했습니다."
          },
          {
            label: "콘텐츠",
            title: "직무별 컨테이너 준비 중",
            description: "AI 리서치, 보고서 작성, 회의록 정리, 엑셀 자동화 컨테이너를 준비하고 있습니다."
          },
          {
            label: "운영",
            title: "실습 입력 안전 안내",
            description: "실제 고객 이름, 연락처, 주소, 상담 내용은 실습 입력에 사용하지 않는 것을 원칙으로 합니다."
          }
        ]
      },
      {
        title: "공지 분류",
        items: [
          {
            title: "서비스 업데이트",
            description: "화면, 기능, 정책 페이지 변경 내용을 안내합니다."
          },
          {
            title: "콘텐츠 공개",
            description: "새 컨테이너와 자료실 공개 일정을 안내합니다."
          },
          {
            title: "운영 안내",
            description: "점검, 문의 응대, 기업교육 신청 흐름을 안내합니다."
          }
        ]
      }
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "자주 묻는 질문",
    description:
      "학습 방식, 무료 콘텐츠, 기업교육, 개인정보 입력 기준처럼 처음 이용할 때 자주 생기는 질문을 정리했습니다.",
    icon: HelpCircle,
    meta: ["학습 방식", "무료 콘텐츠", "기업교육", "개인정보"],
    primaryCta: { label: "첫 컨테이너 시작", href: "/learning/ax-basic" },
    secondaryCta: { label: "문의하기", href: "/support" },
    heroCards: [
      {
        title: "AI를 몰라도 시작할 수 있나요?",
        description: "가능합니다. 첫 컨테이너는 업무를 나누고 AI 적용 지점을 찾는 것부터 시작합니다.",
        icon: BookOpenCheck
      },
      {
        title: "현재 결제가 가능한가요?",
        description: "현재는 무료 컨테이너 중심으로 운영하며 유료 결제는 추후 공개합니다.",
        icon: ReceiptText
      },
      {
        title: "실제 고객정보를 넣어도 되나요?",
        description: "아니요. 실습에는 반드시 예시 데이터와 가상 정보를 사용해야 합니다.",
        icon: ShieldCheck
      }
    ],
    sections: [
      {
        title: "학습 방식",
        items: [
          {
            title: "영상 강의만 보는 방식인가요?",
            description: "아닙니다. 설명, 선택, 작성, 판단을 섞은 인터랙티브 학습을 지향합니다."
          },
          {
            title: "학습 후 무엇이 남나요?",
            description: "업무 타임라인, AI 적용 후보, 검토 기준 같은 업무 산출물을 남기는 방향입니다."
          },
          {
            title: "모든 컨테이너가 같은 형식인가요?",
            description: "아닙니다. 주제에 따라 개념 이해, 적용 판단, 따라 하기, 운영 기준을 다르게 섞습니다."
          }
        ]
      },
      {
        title: "서비스 이용",
        items: [
          {
            title: "계정이 꼭 필요한가요?",
            description: "현재 MVP에서는 일부 학습을 계정 없이 볼 수 있습니다. 계정 저장 기능은 추후 안내합니다."
          },
          {
            title: "기업교육은 어떻게 문의하나요?",
            description: "고객지원 페이지의 이메일 문의로 인원, 직무, 희망 주제를 알려주세요."
          },
          {
            title: "자료실 파일은 어디서 받을 수 있나요?",
            description: "자료는 콘텐츠 공개 일정에 맞춰 순차 제공됩니다."
          }
        ]
      }
    ]
  }
};

type InfoSlug = keyof typeof servicePages;

export function generateStaticParams() {
  return Object.keys(servicePages).map((infoSlug) => ({ infoSlug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ infoSlug: string }>;
}): Promise<Metadata> {
  const { infoSlug } = await params;
  const page = servicePages[infoSlug as InfoSlug];

  if (!page) {
    return {
      title: "페이지를 찾을 수 없습니다 - Shiftbase"
    };
  }

  return {
    title: `${page.title} - Shiftbase`,
    description: page.description
  };
}

function CtaLink({
  href,
  label,
  variant = "primary"
}: PageLink & {
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition active:translate-y-px ${
        variant === "primary"
          ? "bg-primary text-white hover:bg-primary-dark"
          : "border border-line bg-white text-ink hover:bg-soft"
      }`}
      href={href}
    >
      {label}
      <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}

function CardIcon({ icon: Icon = CheckCircle2 }: { icon?: LucideIcon }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
      <Icon size={18} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

export default async function InfoPage({
  params
}: {
  params: Promise<{ infoSlug: string }>;
}) {
  const { infoSlug } = await params;
  const page = servicePages[infoSlug as InfoSlug];
  if (!page) notFound();

  const Icon = page.icon;

  return (
    <SiteShell>
      <main className="bg-soft">
        <section className="border-b border-line bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
            <div className="min-w-0">
              <p className="text-sm font-bold text-muted">
                홈 / {page.eyebrow}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
                  <Icon size={22} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="flex flex-wrap gap-2">
                  {page.meta.map((item) => (
                    <span
                      className="rounded-full border border-line bg-soft px-3 py-1 text-xs font-bold text-muted"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <h1 className="mt-6 max-w-3xl text-3xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted sm:text-lg">
                {page.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <CtaLink {...page.primaryCta} />
                {page.secondaryCta ? <CtaLink {...page.secondaryCta} variant="secondary" /> : null}
              </div>
            </div>

            <aside className="border border-line bg-[#fbfdff] p-4 shadow-soft">
              <div className="grid gap-3">
                {page.heroCards.map((card) => (
                  <article className="border border-line bg-white p-3 sm:p-4" key={card.title}>
                    <div className="flex items-start gap-3">
                      <CardIcon icon={card.icon} />
                      <div>
                        {card.label ? (
                          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-primary">
                            {card.label}
                          </p>
                        ) : null}
                        <h2 className="text-base font-black tracking-tight text-ink">{card.title}</h2>
                        <p className="mt-2 hidden text-sm leading-6 text-muted sm:block">{card.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10">
            {page.sections.map((section) => (
              <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]" key={section.title}>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-ink">{section.title}</h2>
                  {section.description ? (
                    <p className="mt-3 text-sm leading-7 text-muted">{section.description}</p>
                  ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {section.items.map((item) => (
                    <article className="border border-line bg-white p-5" key={item.title}>
                      <div className="flex items-start gap-3">
                        <CardIcon icon={item.icon} />
                        <div>
                          {item.label ? (
                            <p className="mb-1 text-xs font-black text-primary">{item.label}</p>
                          ) : null}
                          <h3 className="text-base font-black tracking-tight text-ink">{item.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section
            className="mt-12 border border-line bg-white p-5 sm:p-6"
            id={infoSlug === "support" ? "contact" : undefined}
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-sm font-black text-primary">Next step</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">
                  필요한 페이지로 바로 이동하세요
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  학습을 시작하거나, 문의 전 FAQ를 확인하거나, 팀 교육 상담으로 이어갈 수 있습니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <CtaLink {...page.primaryCta} />
                <CtaLink href="/support" label="고객지원" variant="secondary" />
                <CtaLink href="/faq" label="FAQ" variant="secondary" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
