import { Header } from "@/components/SiteShell";
import { DemoSamplePlayer } from "@/components/demo/DemoSamplePlayer";
import { shippingDelaySampleSpec } from "@/lib/demo/shippingDelaySampleSpec";

export const metadata = {
  title: "AI로 업무 속도 올리기 | Shiftbase",
  description: "시프트베이스 데모 — AI 메일 작성 실습 흐름"
};

export default function ShippingDelayDemoPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f7f9fc]">
      <Header />
      <DemoSamplePlayer spec={shippingDelaySampleSpec} />
    </div>
  );
}
