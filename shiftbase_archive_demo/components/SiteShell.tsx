import Link from "next/link";
import Image from "next/image";
import {
  Home,
  LayoutDashboard,
  Library,
  MessageCircleQuestion,
  UserRound
} from "lucide-react";
import { brand, footerSections } from "@/lib/content";

type HeaderNavItem = {
  callout?: string;
  href: string;
  label: string;
};

const shiftbaseNavItems = [
  { href: "/learning", label: "학습" },
  { href: "/find-course", label: "추천" },
  { href: "/enterprise", label: "기업교육" },
  { href: "/support", label: "고객지원" }
];

const shiftbaseUtilityNavItems: HeaderNavItem[] = [];

const defaultAuthItem = { href: "/me", label: "로그인" };

type HeaderProps = {
  authItem?: HeaderNavItem | null;
  brandAction?: HeaderNavItem | null;
  logoAlt?: string;
  logoHref?: string;
  logoSrc?: string;
  navItems?: HeaderNavItem[];
  utilityNavItems?: HeaderNavItem[];
};

type SiteShellProps = HeaderProps & {
  children: React.ReactNode;
};

export const shellPresets = {
  shiftbase: {
    authItem: defaultAuthItem,
    brandAction: null,
    logoAlt: brand.name,
    logoHref: "/",
    logoSrc: "/assets/logo.png",
    navItems: shiftbaseNavItems,
    utilityNavItems: shiftbaseUtilityNavItems
  }
} satisfies Record<string, HeaderProps>;

const mobileNavItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/learning", label: "콘텐츠", icon: Library },
  { href: "/find-course", label: "추천", icon: MessageCircleQuestion },
  { href: "/me", label: "내 학습", icon: LayoutDashboard }
];

/* ─── Header ─── */
export function Header({
  authItem = shellPresets.shiftbase.authItem,
  brandAction = shellPresets.shiftbase.brandAction,
  logoAlt = shellPresets.shiftbase.logoAlt,
  logoHref = shellPresets.shiftbase.logoHref,
  logoSrc = shellPresets.shiftbase.logoSrc,
  navItems = shellPresets.shiftbase.navItems,
  utilityNavItems = shellPresets.shiftbase.utilityNavItems
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          className="focus-ring flex items-center gap-2 rounded-lg text-[15px] font-bold tracking-tight"
          href={logoHref}
          aria-label={logoAlt}
        >
          <Image
            alt=""
            className="h-8 w-auto"
            src={logoSrc}
            width={150}
            height={40}
          />
        </Link>

        {/* Desktop nav */}
        {navItems.length > 0 ? (
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <Link
                className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="hidden items-center gap-2 sm:flex">
          {utilityNavItems.length > 0 ? (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="보조 메뉴">
              {utilityNavItems.map((item) => (
                <Link
                  className="focus-ring rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition-colors hover:text-ink"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
          {brandAction ? (
            <Link
              className="focus-ring group inline-flex h-9 items-center rounded-lg px-2 text-xs font-bold text-primary transition-colors hover:bg-primary/7"
              href={brandAction.href}
            >
              <span className="relative block h-4 overflow-hidden whitespace-nowrap">
                <span className="block animate-[brandActionSlide_4.2s_ease-in-out_infinite]">
                  <span className="block h-4 leading-4">
                    <span className="inline-block leading-4 shadow-[inset_0_-1px_0_currentColor]">
                      {brandAction.callout}
                    </span>
                  </span>
                  <span className="flex h-4 items-center leading-4">
                    <span className="inline-block leading-4 shadow-[inset_0_-1px_0_currentColor]">{brandAction.label}</span>
                  </span>
                  <span className="block h-4 leading-4">
                    <span className="inline-block leading-4 shadow-[inset_0_-1px_0_currentColor]">
                      {brandAction.callout}
                    </span>
                  </span>
                </span>
              </span>
            </Link>
          ) : null}
          {authItem ? (
            <Link
              className="focus-ring rounded-full border border-line px-5 py-2 text-sm font-semibold transition-colors hover:bg-soft"
              href={authItem.href}
            >
              {authItem.label}
            </Link>
          ) : null}
        </div>

        {/* Mobile user button */}
        <Link
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted sm:hidden"
          href="/me"
          aria-label="내 학습"
        >
          <UserRound size={16} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

/* ─── Footer ─── */
export function Footer() {
  const policyLinks = [
    { label: "개인정보처리방침", href: "/privacy" },
    { label: "이용약관", href: "/terms" }
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.45fr_1fr] lg:px-8">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-3">
              <Image
                alt={brand.name}
                className="h-8 w-auto"
                src="/assets/logo.png"
                width={150}
                height={40}
              />
            </div>
            <nav className="flex translate-y-1 flex-wrap items-center gap-2 text-xs font-semibold text-muted" aria-label="정책">
              {policyLinks.map((link, index) => (
                <span className="flex items-center gap-2" key={link.href}>
                  {index > 0 ? <span className="text-muted/40">|</span> : null}
                  <Link className="focus-ring rounded transition hover:text-ink" href={link.href}>
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>
          <div className="mt-5 max-w-4xl space-y-1 text-xs leading-5 text-muted">
            <p>
              (주)인트박스 | 대표자 : 유희현 | 사업자등록번호: 000-00-00000 사업자 정보 확인
            </p>
            <p>
              통신판매업신고 제 2026-xx-xxxx | 이메일: info@shiftbase.com | 전화번호: 000-000-0000
            </p>
            <p>© 2026 Shiftbase. All rights reserved.</p>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold">{section.title}</p>
              <div className="mt-3 grid gap-2.5">
                {section.links.map((link) => (
                  <Link
                    className="focus-ring rounded text-sm text-muted transition-colors hover:text-ink"
                    href={link.href}
                    key={`${section.title}-${link.label}-${link.href}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── Shell ─── */
export function SiteShell({
  authItem,
  brandAction,
  children,
  logoAlt,
  logoHref,
  logoSrc,
  navItems,
  utilityNavItems
}: SiteShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col pb-16 md:pb-0">
      <Header
        authItem={authItem}
        brandAction={brandAction}
        logoAlt={logoAlt}
        logoHref={logoHref}
        logoSrc={logoSrc}
        navItems={navItems}
        utilityNavItems={utilityNavItems}
      />
      <div className="flex-1">{children}</div>
      <Footer />

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden"
        aria-label="모바일 메뉴"
      >
        <div className="grid grid-cols-4">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="focus-ring flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted transition-colors hover:text-primary"
                href={item.href}
                key={item.href}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
