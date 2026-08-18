export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 8.5 12.2 24 20.4 8.5 28 22"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({
  className = "",
  markClassName = "",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={`h-6 w-6 ${markClassName}`} />
      <span className="text-[1.35rem] font-semibold tracking-tight">vaultic</span>
    </span>
  );
}
