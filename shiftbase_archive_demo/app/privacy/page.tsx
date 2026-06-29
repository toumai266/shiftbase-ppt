import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "개인정보처리방침 - Shiftbase",
  description: "Shiftbase의 개인정보 처리 기준을 안내합니다."
};

const privacyRows = [
  {
    label: "현재 공개 MVP",
    items: "브라우저 접속 기록, 서비스 이용 로그, 기기 및 브라우저 정보, 문의 시 사용자가 직접 제공한 이메일과 문의 내용"
  },
  {
    label: "계정 기능 도입 시",
    items: "이름 또는 닉네임, 이메일, 로그인 식별자, 학습 진도, 실습 제출 결과, 다운로드 이력"
  },
  {
    label: "유료 서비스 도입 시",
    items: "결제 상태, 결제 승인 정보, 환불 처리 정보. 카드번호 등 결제수단 원문은 결제대행사가 처리합니다."
  },
  {
    label: "기업교육 도입 시",
    items: "소속 조직, 수강 권한, 수료 여부, 조직 관리자에게 제공되는 학습 리포트 항목"
  }
];

const policySections = [
  {
    title: "1. 처리 목적",
    body: [
      "회사는 AI 업무전환 학습, 고객지원, 서비스 안정화, 부정 이용 방지, 유료 서비스 제공과 환불 처리를 위해 필요한 범위에서 개인정보를 처리합니다.",
      "실습 기능은 가상 데이터 사용을 전제로 설계되며, 실제 고객 이름, 연락처, 주소, 결제정보, 건강정보, 상담 내용 등 민감하거나 식별 가능한 정보를 입력하지 않는 것을 원칙으로 합니다."
    ]
  },
  {
    title: "2. 보유 및 이용 기간",
    body: [
      "문의 내용은 처리 완료 후 3년 이내 보관하고, 계정 정보와 학습 기록은 회원 탈퇴 또는 서비스 종료 요청 시 지체 없이 삭제합니다. 관계 법령상 보존 의무가 있는 결제와 거래 기록은 해당 법령에서 정한 기간 동안 보관할 수 있습니다.",
      "현재 MVP에서 별도 계정 저장 기능을 제공하지 않는 경우, 사용자가 입력한 실습 내용은 원칙적으로 서버에 영구 저장하지 않습니다."
    ]
  },
  {
    title: "3. 제3자 제공과 국외 이전",
    body: [
      "회사는 이용자의 개인정보를 사전 동의 없이 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있거나 수사기관의 적법한 요청이 있는 경우 예외적으로 제공될 수 있습니다.",
      "AI 기능을 외부 모델 제공자와 연동하는 경우 입력 내용이 국외 사업자에게 전송될 수 있습니다. 이 경우 제공자, 이전 국가, 이전 항목, 보유 기간, 거부 방법을 서비스 화면 또는 별도 고지로 안내합니다."
    ]
  },
  {
    title: "4. 처리 위탁",
    body: [
      "회사는 서비스 운영을 위해 호스팅, 이메일 발송, 결제, 분석, 고객지원 도구를 사용할 수 있습니다. 위탁이 발생하면 수탁자, 업무 내용, 보유 기간을 공개하고 계약을 통해 개인정보 보호 의무를 부과합니다.",
      "현재 확정된 수탁자 목록이 없는 항목은 실제 도입 시 본 방침을 업데이트합니다."
    ]
  },
  {
    title: "5. 정보주체의 권리",
    body: [
      "이용자는 개인정보 열람, 정정, 삭제, 처리정지, 동의 철회를 요청할 수 있습니다. 회사는 본인 확인 후 법령이 정한 범위에서 지체 없이 처리합니다.",
      "자동화된 결정이 도입되는 경우 이용자는 해당 결정에 대한 설명 요구와 거부권을 행사할 수 있습니다."
    ]
  },
  {
    title: "6. 안전성 확보 조치",
    body: [
      "회사는 접근 권한 최소화, 관리자 접근 통제, 전송 구간 암호화, 로그 최소화, 민감정보 입력 경고, 정기 점검을 통해 개인정보를 보호합니다.",
      "기업교육이나 유료 파일 제공 기능을 도입하는 경우 조직별 접근 권한과 서명된 파일 URL 등 추가 보호 조치를 적용합니다."
    ]
  },
  {
    title: "7. 쿠키와 자동 수집 장치",
    body: [
      "서비스는 로그인 유지, 접속 통계, 오류 분석을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있으나 일부 기능이 제한될 수 있습니다."
    ]
  },
  {
    title: "8. 개인정보 보호 책임자",
    body: [
      "개인정보 관련 문의, 열람 청구, 고충 처리는 아래 연락처로 요청할 수 있습니다.",
      "담당 부서: Shiftbase 운영팀 / 이메일: info@shiftbase.com / 전화번호: 000-000-0000"
    ]
  },
  {
    title: "9. 방침 변경",
    body: [
      "본 방침은 2026년 5월 16일부터 적용됩니다. 개인정보 처리 방식이 변경되는 경우 시행일, 변경 내용, 변경 사유를 서비스 화면에 공지합니다."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <main className="bg-soft">
        <section className="border-b border-line bg-white">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-bold text-muted">Shiftbase 정책</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              개인정보처리방침
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              Shiftbase는 업무 데이터를 다루는 학습 서비스입니다.
              실제 고객정보 입력을 최소화하고, 필요한 정보만 처리하는 것을 기본 원칙으로 합니다.
            </p>
            <p className="mt-5 text-sm font-semibold text-ink">시행일: 2026년 5월 16일</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden border border-line bg-white">
            <div className="grid border-b border-line bg-[#f3f7fb] px-4 py-3 text-sm font-bold text-ink sm:grid-cols-[180px_minmax(0,1fr)]">
              <span>구분</span>
              <span>처리 항목</span>
            </div>
            {privacyRows.map((row) => (
              <div
                className="grid gap-2 border-b border-line px-4 py-4 text-sm last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]"
                key={row.label}
              >
                <p className="font-bold text-ink">{row.label}</p>
                <p className="leading-7 text-muted">{row.items}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {policySections.map((section) => (
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
