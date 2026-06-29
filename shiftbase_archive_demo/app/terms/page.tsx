import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "이용약관 - Shiftbase",
  description: "Shiftbase 이용 기준을 안내합니다."
};

const termsSections = [
  {
    title: "제1조 목적",
    body: [
      "본 약관은 주식회사 인트박스가 운영하는 Shiftbase 및 관련 서비스의 이용 조건, 회사와 이용자의 권리와 의무, 책임 사항을 정합니다.",
      "Shiftbase는 AI 업무전환 학습 콘텐츠와 실습 환경을 제공합니다."
    ]
  },
  {
    title: "제2조 용어의 정의",
    body: [
      "서비스란 회사가 웹사이트와 향후 앱, 기업교육, 콘텐츠 다운로드 등을 통해 제공하는 모든 기능을 의미합니다.",
      "이용자란 회원가입 여부와 관계없이 서비스를 이용하는 사람을 의미합니다. 회원이란 회사가 정한 절차에 따라 계정을 만들고 서비스를 이용하는 사람을 의미합니다.",
      "콘텐츠란 강의, 템플릿, 체크리스트, 문서, 이미지, AI 실습 결과물 등 서비스 안에서 제공되거나 작성되는 자료를 의미합니다."
    ]
  },
  {
    title: "제3조 약관의 게시와 변경",
    body: [
      "회사는 이용자가 쉽게 확인할 수 있도록 본 약관을 서비스 화면에 게시합니다.",
      "회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 중요한 변경이 있는 경우 시행일과 변경 사유를 사전에 공지합니다."
    ]
  },
  {
    title: "제4조 서비스 이용과 계정",
    body: [
      "현재 MVP에서는 일부 기능이 계정 없이 제공될 수 있습니다. 계정 기능이 도입되면 이용자는 정확한 정보를 제공하고 계정 접근 권한을 직접 관리해야 합니다.",
      "타인의 계정을 사용하거나 허위 정보를 입력해 서비스 운영을 방해해서는 안 됩니다."
    ]
  },
  {
    title: "제5조 학습 콘텐츠와 실습 결과물",
    body: [
      "회사가 제공하는 강의, 템플릿, 체크리스트, 화면 구성, 문서, 이미지 등 서비스 콘텐츠의 권리는 회사 또는 정당한 권리자에게 있습니다.",
      "이용자는 학습 과정에서 만든 실습 결과물을 본인 또는 소속 조직의 업무에 사용할 수 있습니다. 다만 회사가 제공한 템플릿, 강의 자료, 유료 자료를 무단 복제, 판매, 재배포, 공개 공유해서는 안 됩니다."
    ]
  },
  {
    title: "제6조 AI 기능 이용",
    body: [
      "AI가 생성한 결과는 업무 보조용 초안이며, 정확성, 최신성, 적법성, 특정 목적 적합성이 항상 보장되지 않습니다.",
      "이용자는 AI 결과를 실제 발송, 계약, 상담, 안내, 의사결정에 사용하기 전 직접 검토해야 합니다. 의료, 법률, 금융, 노무, 세무 등 전문 판단이 필요한 내용은 전문가 검토가 필요합니다.",
      "실습 입력창에는 실제 고객 이름, 연락처, 주소, 결제정보, 건강정보, 상담 내용 등 개인정보 또는 민감정보를 입력하지 않아야 합니다."
    ]
  },
  {
    title: "제7조 유료 서비스와 환불",
    body: [
      "현재 MVP에서 실제 결제를 제공하지 않는 경우 유료 서비스 조항은 결제 기능 도입 시 적용됩니다.",
      "유료 콘텐츠, 패키지, 기업교육, 다운로드 자료의 가격, 제공 범위, 환불 조건은 구매 화면 또는 계약서에 별도로 표시합니다.",
      "디지털 콘텐츠가 제공되었거나 다운로드가 시작된 경우 관계 법령과 고지된 환불 기준에 따라 환불이 제한될 수 있습니다."
    ]
  },
  {
    title: "제8조 금지 행위",
    body: [
      "이용자는 법령 또는 약관 위반, 타인의 권리 침해, 개인정보 무단 수집, 서비스 보안 우회, 자동화된 대량 접속, 악성 코드 전송, 허위 정보 게시, 혐오 또는 불법 콘텐츠 게시를 해서는 안 됩니다.",
      "고객사 비공개 정보, 영업비밀, 타인을 특정할 수 있는 개인정보를 실습 입력창이나 문의 채널에 입력해서는 안 됩니다."
    ]
  },
  {
    title: "제9조 서비스 변경과 중단",
    body: [
      "회사는 운영상, 기술상 필요에 따라 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다.",
      "정기 점검, 장애 대응, 외부 서비스 장애, 천재지변, 보안 위협 등 부득이한 사유가 있는 경우 사전 공지 없이 서비스가 일시 중단될 수 있습니다."
    ]
  },
  {
    title: "제10조 책임 제한",
    body: [
      "회사는 무료로 제공되는 MVP, 베타 기능, 외부 AI 모델의 응답, 이용자가 입력한 정보의 오류로 발생한 손해에 대해 회사의 고의 또는 중대한 과실이 없는 한 책임을 부담하지 않습니다.",
      "이용자가 약관을 위반하거나 부적절한 업무 데이터, 개인정보, 민감정보를 입력해 발생한 문제는 이용자가 책임집니다."
    ]
  },
  {
    title: "제11조 이용 제한",
    body: [
      "회사는 이용자가 본 약관 또는 관련 법령을 위반한 경우 게시물 삭제, 기능 제한, 계정 정지, 계약 해지 등 필요한 조치를 할 수 있습니다.",
      "이용자는 조치에 이의가 있는 경우 회사가 안내하는 문의처로 소명할 수 있습니다."
    ]
  },
  {
    title: "제12조 준거법과 분쟁 해결",
    body: [
      "본 약관은 대한민국 법령을 기준으로 해석합니다.",
      "서비스 이용과 관련한 분쟁은 회사와 이용자가 성실히 협의해 해결하며, 협의가 어려운 경우 관할 법원은 민사소송법 등 관련 법령에 따릅니다."
    ]
  }
];

export default function TermsPage() {
  return (
    <SiteShell>
      <main className="bg-soft">
        <section className="border-b border-line bg-white">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-bold text-muted">Shiftbase 정책</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              이용약관
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              본 약관은 Shiftbase의 AI 업무전환 학습 서비스를 이용할 때 적용되는 기본 기준입니다.
              현재 MVP에서 제공되지 않는 결제, 계정, 기업교육 기능은 실제 도입 시 별도 고지와 함께 적용됩니다.
            </p>
            <p className="mt-5 text-sm font-semibold text-ink">시행일: 2026년 5월 16일</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {termsSections.map((section) => (
              <section className="border border-line bg-white p-5" key={section.title}>
                <h2 className="text-lg font-black tracking-tight text-ink">{section.title}</h2>
                <div className="mt-3 space-y-2">
                  {section.body.map((paragraph) => (
                    <p className="text-sm leading-7 text-muted" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
