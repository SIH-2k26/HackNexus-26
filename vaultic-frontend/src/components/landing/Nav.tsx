import { useEffect, useState } from "react";
import { Wordmark } from "./Logo";

const links = [
  { label: "Platform", href: "#platform" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
  { label: "Security", href: "#security" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 transition-all duration-500 ${
          scrolled ? "mt-3 py-2" : "mt-5 py-3"
        }`}
      >
        <a
          href="#top"
          className={`transition-colors duration-500 ${scrolled ? "text-ink" : "text-on-brand"}`}
        >
          <Wordmark />
        </a>

        <nav
          className={`hidden items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-md transition-all duration-500 md:flex ${
            scrolled
              ? "border-border bg-card/90 text-ink shadow-[0_8px_30px_rgba(16,24,60,0.08)]"
              : "border-white/25 bg-white/10 text-on-brand"
          }`}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-current/10"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#platform"
            className={`hidden rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 sm:inline-flex ${
              scrolled
                ? "bg-brand text-on-brand hover:brightness-110"
                : "bg-on-brand text-brand hover:brightness-95"
            }`}
          >
            Explore Vaultic
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:hidden ${
              scrolled ? "border-border text-ink" : "border-white/30 text-on-brand"
            }`}
          >
            <span className="text-lg leading-none">{open ? "\u00d7" : "\u2261"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-5 mt-2 rounded-3xl border border-border bg-card p-3 shadow-[0_20px_60px_rgba(16,24,60,0.12)] md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-ink hover:bg-surface"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#platform"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-2xl bg-brand px-4 py-3 text-center text-sm font-medium text-on-brand"
          >
            Explore Vaultic
          </a>
        </div>
      )}
    </header>
  );
}
