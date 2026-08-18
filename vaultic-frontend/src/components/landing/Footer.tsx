import { Wordmark } from "./Logo";

export function Footer() {
  return (
    <footer className="brand-panel">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col items-center gap-6 border-t border-white/15 pt-10 text-on-brand sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <Wordmark />
            <p className="mt-1 text-sm text-on-brand-muted">
              Enterprise Federated Fraud Intelligence
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-on-brand-muted">
            <a className="transition-opacity hover:opacity-70" href="#platform">
              Platform
            </a>
            <a className="transition-opacity hover:opacity-70" href="#how-it-works">
              How It Works
            </a>
            <a className="transition-opacity hover:opacity-70" href="#architecture">
              Architecture
            </a>
            <a className="transition-opacity hover:opacity-70" href="#security">
              Security
            </a>
          </nav>
        </div>
        <p className="mt-8 text-center text-xs text-on-brand-muted sm:text-left">
          Vaultic is a research prototype for privacy-preserving federated fraud detection.
        </p>
      </div>
    </footer>
  );
}
