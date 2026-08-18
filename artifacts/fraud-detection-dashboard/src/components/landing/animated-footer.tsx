import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "./Logo";

export function AnimatedFooter({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(
    () => ["private", "federated", "secure", "collaborative", "intelligent"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <footer className="w-full bg-surface border-t border-border pt-16 pb-12 overflow-hidden">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex gap-8 py-12 lg:py-20 items-center justify-center flex-col text-center">
          <div className="flex gap-4 flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground shadow-xs">
              <ShieldCheck className="w-4 h-4 text-brand" /> Vaultic Enterprise Federation
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl max-w-4xl tracking-tight text-center font-bold text-ink leading-tight">
              <span>Fraud intelligence, built </span>
              <span className="relative inline-flex w-full justify-center overflow-hidden text-center h-[1.3em] pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-brand capitalize"
                    initial={{ opacity: 0, y: "-100%" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl text-center text-muted-foreground font-medium mt-2">
              Vaultic enables financial institutions to collaboratively
              improve fraud detection while keeping sensitive transaction
              data within their own environment.
            </p>
          </div>

          <div className="flex flex-row gap-4 pt-2">
            <Button
              size="lg"
              variant="outline"
              onClick={() => (onOpenAuth ? onOpenAuth() : (window.location.href = "#platform"))}
              className="gap-3 rounded-full border-border bg-card text-ink font-semibold hover:bg-surface h-12 px-7 shadow-xs cursor-pointer"
              data-testid="button-footer-explore"
            >
              Explore Vaultic
            </Button>

            <Button
              size="lg"
              onClick={() => (onOpenAuth ? onOpenAuth() : (window.location.href = "#architecture"))}
              className="gap-3 rounded-full bg-brand text-on-brand hover:brightness-110 font-semibold h-12 px-7 shadow-md cursor-pointer"
              data-testid="button-footer-get-started"
            >
              Get Started
              <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* FOOTER BOTTOM BAR */}
        <div className="mt-12 flex flex-col items-center gap-6 border-t border-border pt-8 text-ink sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <Wordmark />
            <p className="mt-1 text-xs text-muted-foreground font-medium">
              Enterprise Federated Fraud Intelligence
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
            <a className="transition-colors hover:text-brand" href="#platform">
              Platform
            </a>
            <a className="transition-colors hover:text-brand" href="#how-it-works">
              How It Works
            </a>
            <a className="transition-colors hover:text-brand" href="#architecture">
              Architecture
            </a>
            <a className="transition-colors hover:text-brand" href="#security">
              Security
            </a>
          </nav>
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-foreground sm:text-left">
          Vaultic is a research prototype for privacy-preserving federated fraud detection.
        </p>
      </div>
    </footer>
  );
}

export { AnimatedFooter as Footer };
