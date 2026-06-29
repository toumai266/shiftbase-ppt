"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { courses, finderQuestions } from "@/lib/content";

type Answers = Partial<Record<(typeof finderQuestions)[number]["id"], string>>;

function scoreCourse(course: (typeof courses)[number], answers: Answers) {
  let score = 0;
  if (answers.industry && (course.industry === answers.industry || course.industry === "공통")) score += 4;
  if (answers.level && course.level === answers.level) score += 3;
  if (answers.price && course.priceType === answers.price) score += 3;
  if (answers.goal) {
    const moduleText = course.modules
      .map((module) => [module.title, module.question, ...module.items.map((item) => item.title)].join(" "))
      .join(" ");
    const text = `${course.title} ${course.subtitle} ${course.description} ${course.outcomes.join(" ")} ${moduleText}`;
    const goalMap: Record<string, string> = {
      업무분해: "업무",
      AI적용: "AI",
      자동화판단: "자동화",
      검토기준: "검토"
    };
    if (goalMap[answers.goal] && text.includes(goalMap[answers.goal])) score += 4;
  }
  return score;
}

export function CourseFinderChat() {
  const [answers, setAnswers] = useState<Answers>({});
  const currentIndex = finderQuestions.findIndex((q) => !answers[q.id]);
  const complete = currentIndex === -1;
  const currentQuestion = complete ? null : finderQuestions[currentIndex];
  const answered = Object.keys(answers).length;

  const recommended = useMemo(
    () =>
      [...courses]
        .map((c) => ({ course: c, score: scoreCourse(c, answers) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [answers]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Chat area */}
      <div className="flex flex-col rounded-2xl border border-line">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
            <Bot size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold">콘텐츠 추천 어시스턴트</p>
            <p className="text-xs text-muted">
              {complete ? "추천 완료" : `${answered + 1} / ${finderQuestions.length} 질문`}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 p-5" style={{ minHeight: 420 }}>
          {/* Bot intro */}
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
              <Bot size={14} />
            </span>
            <div className="rounded-xl rounded-tl-none bg-soft px-4 py-3 text-sm leading-relaxed">
              업무 상황과 경험 수준을 알려주시면 시작하기 좋은 컨테이너를 골라 드리겠습니다.
            </div>
          </div>

          {/* Previous answers */}
          {finderQuestions.map((q) => {
            const answer = answers[q.id];
            if (!answer) return null;
            return (
              <div key={q.id}>
                {/* Bot question */}
                <div className="mb-3 flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Bot size={14} />
                  </span>
                  <div className="rounded-xl rounded-tl-none bg-soft px-4 py-3 text-sm">
                    {q.question}
                  </div>
                </div>
                {/* User answer */}
                <div className="flex justify-end gap-3">
                  <div className="rounded-xl rounded-tr-none bg-primary px-4 py-3 text-sm font-medium text-white">
                    {answer}
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <UserRound size={13} />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Current question */}
          {currentQuestion ? (
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <Bot size={14} />
              </span>
              <div className="max-w-md">
                <div className="rounded-xl rounded-tl-none border border-line bg-white px-4 py-3">
                  <p className="text-sm font-semibold">{currentQuestion.question}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      className="focus-ring rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: option
                        }))
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <Sparkles size={14} />
              </span>
              <div className="rounded-xl rounded-tl-none border border-primary/20 bg-primary-light px-4 py-3">
                <p className="text-sm font-semibold text-primary-dark">추천이 준비됐습니다</p>
                <p className="mt-1 text-sm text-muted">
                  오른쪽 패널에서 추천 컨테이너를 확인하세요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-line px-5 py-3">
          <button
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-soft hover:text-ink"
            type="button"
            onClick={() => setAnswers({})}
          >
            <RotateCcw size={14} />
            다시 시작
          </button>
          <div className="flex flex-1 items-center justify-end text-xs text-muted">
            선택형 추천 인터페이스
          </div>
        </div>
      </div>

      {/* Recommendation sidebar */}
      <aside className="h-fit rounded-2xl border border-line p-5">
            <p className="text-sm font-semibold">추천 컨테이너</p>
        <p className="mt-1 text-xs text-muted">
          {complete ? "답변 기반 결과입니다" : "답변을 진행하면 정확도가 올라갑니다"}
        </p>

        <div className="mt-5 grid gap-3">
          {recommended.map(({ course, score }, i) => (
            <Link
              className="focus-ring group rounded-xl border border-line p-4 transition-colors hover:border-primary/20"
              href={`/learning/${course.slug}`}
              key={course.slug}
            >
              <div className="flex items-center justify-between">
                <span className="chip bg-primary-light text-primary font-bold">
                  {i + 1}위
                </span>
                <span className="text-xs text-muted">
                  적합도 {Math.min(99, 62 + score * 4)}%
                </span>
              </div>
              <p className="mt-2.5 text-sm font-bold leading-snug group-hover:text-primary">
                {course.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{course.subtitle}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                상세 보기 <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
