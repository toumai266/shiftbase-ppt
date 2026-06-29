"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type HeroSlide = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  progressTone?: "light" | "dark";
};

type HomeHeroProps = {
  slides: HeroSlide[];
};

export function HomeHero({ slides }: HomeHeroProps) {
  const [active, setActive] = useState(0);
  const activeSlide = slides[active];
  const isLightProgress = activeSlide.progressTone !== "dark";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [active, slides.length]);

  const goPrev = () => {
    setActive((index) => (index - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActive((index) => (index + 1) % slides.length);
  };

  return (
    <section className="border-b border-line bg-ink">
      <div className="relative aspect-[200/51] overflow-hidden bg-ink">
        {slides.map((slide, index) => (
          <Link
            aria-label={slide.title}
            className={`focus-ring absolute inset-0 transition-opacity duration-1000 ease-out ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
            key={slide.title}
            href={slide.href}
            tabIndex={index === active ? 0 : -1}
          >
            <Image
              alt=""
              className="object-cover"
              src={slide.image}
              fill
              priority={index === 0}
              sizes="100vw"
            />
          </Link>
        ))}
        <div className={`absolute inset-x-0 bottom-0 z-10 h-0.5 ${isLightProgress ? "bg-[#BAE6FD]/25" : "bg-[#4F46E5]/16"}`}>
          <span
            key={active}
            className={`block h-full origin-left animate-[heroProgress_6500ms_linear_forwards] ${isLightProgress ? "bg-[#BAE6FD]" : "bg-[#4F46E5]"}`}
          />
        </div>
        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
          <div className="inline-flex items-center gap-2 text-white drop-shadow-[0_8px_18px_rgba(15,23,42,0.34)]">
            <button
              aria-label="이전 배너"
              className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-white/64 transition hover:bg-white/14 hover:text-white"
              onClick={goPrev}
              type="button"
            >
              <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-1.5 px-1" aria-label={`현재 배너 ${active + 1} / ${slides.length}`}>
              {slides.map((slide, index) => (
                <button
                  aria-label={`${index + 1}번 배너 보기`}
                  aria-pressed={active === index}
                  className="flex h-3 w-3 items-center justify-center rounded-full"
                  key={slide.title}
                  onClick={() => setActive(index)}
                  type="button"
                >
                  <span
                    className={`rounded-full transition ${
                      active === index ? "h-2 w-2 bg-white" : "h-1.5 w-1.5 bg-white/30 hover:bg-white/56"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              aria-label="다음 배너"
              className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-white/64 transition hover:bg-white/14 hover:text-white"
              onClick={goNext}
              type="button"
            >
              <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
