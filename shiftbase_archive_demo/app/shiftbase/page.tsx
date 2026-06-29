import { BookOpenCheck, Boxes, CheckCircle2, CircleHelp, Lightbulb, MessageSquareText, UsersRound } from "lucide-react";
import Image from "next/image";
import { SiteShell } from "@/components/SiteShell";

const reasons = [
  {
    title: "인터랙티브 학습",
    description: "읽고 듣는 데서 끝나지 않고, 직접 선택하고 작성하며 익힙니다.",
    icon: BookOpenCheck
  },
  {
    title: "다양한 분야의 실무 적용",
    description: "소상공인부터 제조업까지 실제 업무를 기준으로 다룹니다.",
    icon: Boxes
  },
  {
    title: "결과물로 증명하기",
    description: "문서, 앱, 학습 경험처럼 손에 남는 결과물을 만듭니다.",
    icon: CheckCircle2
  },
  {
    title: "피드백 기반 학습",
    description: "입력, 선택, 판단을 반복하며 막힌 지점을 바로 다룹니다.",
    icon: UsersRound
  }
];

const recommendedFor = [
  {
    text: "AI를 써야 하는데 어디부터 시작할지 막막한 분",
    image: "/assets/audiences/ai-beginner.png"
  },
  {
    text: "반복 업무를 줄이고 싶은 실무자",
    image: "/assets/audiences/automation-worker.png"
  },
  {
    text: "팀의 AI 활용 기준이 필요한 리더",
    image: "/assets/audiences/team-leader.png"
  },
  {
    text: "결과물 중심으로 배우고 싶은 학습자",
    image: "/assets/audiences/result-learner.png"
  }
];

const faqs = [
  {
    question: "영상 강의만 보는 방식인가요?",
    answer: "아닙니다. 영상, 실습, 문서 작성, 결과물 제작을 함께 다룹니다."
  },
  {
    question: "AI를 잘 몰라도 시작할 수 있나요?",
    answer: "가능합니다. 첫 강의는 업무를 나누고 AI 적용 지점을 찾는 것부터 시작합니다."
  },
  {
    question: "학습 후 무엇이 남나요?",
    answer: "업무 설계 자료, 체크리스트, 문서, 앱 같은 결과물을 남기는 방향으로 구성합니다."
  },
  {
    question: "강의는 계속 추가되나요?",
    answer: "네. 새 강의 컨테이너가 추가되면 강의 목록에 반영됩니다."
  }
];

export default function ShiftbasePage() {
  return (
    <SiteShell
      logoAlt="Shiftbase"
      logoHref="/"
      logoSrc="/assets/logo.png"
    >
      <main className="bg-soft">
        <section className="border-b border-line bg-ink">
          <div className="relative isolate flex min-h-[300px] items-center justify-center overflow-hidden px-4 py-12 text-center text-white sm:min-h-[340px] lg:aspect-[200/51] lg:min-h-0 lg:py-16">
            <div className="grainy-gradient-hero absolute inset-0 -z-30" aria-hidden="true">
              <span className="mesh-flow mesh-flow-a" />
              <span className="mesh-flow mesh-flow-b" />
              <span className="mesh-flow mesh-flow-c" />
              <span className="mesh-flow mesh-flow-d" />
              <span className="mesh-flow mesh-flow-e" />
              <span className="mesh-flow mesh-flow-f" />
              <span className="mesh-flow mesh-flow-accent" />
            </div>
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(15,23,42,0.5),rgba(15,23,42,0.18)_46%,rgba(79,70,229,0.06))]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),rgba(15,23,42,0.08)_52%,rgba(15,23,42,0.3)_100%)]" />
            <div className="mx-auto w-full max-w-[96vw]">
              <h1 className="text-[clamp(1.65rem,8vw,3.45rem)] font-black leading-[1.06] tracking-tight [text-shadow:0_3px_18px_rgba(15,23,42,0.48)] sm:leading-[1.02]">
                당신의 일에
                <br />
                AI라는 날개를 달아보세요
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-sm font-semibold leading-6 text-white/90 [text-shadow:0_4px_16px_rgba(15,23,42,0.46)] sm:mt-7 sm:text-xl sm:leading-8">
                Shiftbase는 누구나 AI를 손쉽게 다루는 세상을 꿈꿉니다.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black tracking-tight text-ink sm:text-5xl">
                Shiftbase로 AI를 배워보세요.
              </h2>
              <p className="mt-5 text-xl font-semibold leading-8 text-muted">
                우리의 삶은 AI로 변화할 것입니다. AI를 잘 다루게 도와드릴게요.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="rounded-2xl bg-soft p-6" key={item.title}>
                    <Icon className="text-primary" size={24} aria-hidden="true" />
                    <h3 className="mt-6 text-lg font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-soft">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                이런 분들을 위해 준비했어요
              </h2>
            </div>
            <div className="grid gap-3">
              {recommendedFor.map((item) => (
                <div className="grid overflow-hidden rounded-2xl bg-white shadow-soft sm:grid-cols-[148px_1fr]" key={item.text}>
                  <div className="relative min-h-[132px] bg-primary-light/55">
                    <Image
                      alt=""
                      className="object-cover"
                      src={item.image}
                      fill
                      sizes="(min-width: 640px) 148px, 100vw"
                    />
                  </div>
                  <div className="flex items-center gap-4 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Lightbulb size={18} aria-hidden="true" />
                  </span>
                  <p className="text-base font-semibold leading-7 text-ink">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                자주 묻는 질문
              </h2>
            </div>
            <div className="grid gap-4">
              {faqs.map((faq) => (
                <article className="rounded-2xl bg-soft p-6" key={faq.question}>
                  <div className="flex gap-4">
                    <CircleHelp className="mt-1 shrink-0 text-primary" size={20} aria-hidden="true" />
                    <div>
                      <h3 className="text-lg font-bold">{faq.question}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
                    </div>
                  </div>
                </article>
              ))}
              <div className="rounded-2xl bg-primary p-6 text-white">
                <div className="flex gap-4">
                  <MessageSquareText className="mt-1 shrink-0" size={20} aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-bold">더 궁금한 점이 있나요?</h3>
                    <p className="mt-3 text-sm leading-7 text-white/80">
                      고객지원에서 학습 방식과 기업교육 문의를 남길 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
