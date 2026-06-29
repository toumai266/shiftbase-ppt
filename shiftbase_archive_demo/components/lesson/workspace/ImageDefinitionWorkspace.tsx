import Image from "next/image";
import type { LessonWorkspaceBlock } from "@/lib/containerSpec";

type ImageDefinitionBlock = Extract<LessonWorkspaceBlock, { type: "image-definition" }>;

export function ImageDefinitionWorkspace({ block }: { block: ImageDefinitionBlock }) {
  if (block.props.presentation === "reference") {
    return (
      <figure className="overflow-hidden border border-line bg-white">
        <div className="border-b border-line px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {block.props.label}
          </p>
          <figcaption className="mt-2 text-sm font-semibold leading-6 text-ink">
            {block.props.text}
          </figcaption>
        </div>
        <div className="relative min-h-[360px] bg-[#f8fafc]">
          <Image
            src={block.props.image}
            alt={block.props.alt}
            className="object-contain p-3 sm:p-5"
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </div>
      </figure>
    );
  }

  return (
    <div className="overflow-hidden border border-line bg-ink text-white">
      <div className="relative min-h-[320px]">
        <Image
          src={block.props.image}
          alt={block.props.alt}
          className="object-cover opacity-45"
          fill
          sizes="(min-width: 1024px) 48vw, 100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.86))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/58">
            {block.props.label}
          </p>
          <p className="mt-3 text-lg font-semibold leading-7">{block.props.text}</p>
        </div>
      </div>
    </div>
  );
}
