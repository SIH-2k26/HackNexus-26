import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/landing/Reveal";
import { LogoMark } from "@/components/landing/Logo";
import heroVisual from "@/assets/hero-federated.png";
import solutionVisual from "@/assets/solution-visual.png";

const title = "Vaultic — Fraud Intelligence Without Sharing Raw Data";
const description =
  "Vaultic lets financial institutions collaboratively train fraud detection models with federated learning, keeping raw transaction data inside each bank.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const pipeline = [
  "Local Data",
  "Local Training",
  "Differential Privacy",
  "Secure Aggregation",
  "FedAvg",
  "Global Model",
  "Fraud Detection",
];

const privacyFlow = [
  "Bank Data",
  "Local Training",
  "Protected Model Update",
  "Federated Aggregation",
  "Global Model",
];

const products = [
  {
    title: "Federated Learning",
    description:
      "Train fraud detection models locally at participating institutions and combine learned model parameters into a shared global model.",
    highlights: [
      "Raw transaction data remains local",
      "Local MLP training",
      "Collaborative model improvement",
      "Multi-round federated learning",
    ],
  },
  {
    title: "Privacy Protection",
    description:
      "Protect model updates before federation using privacy-preserving mechanisms designed to reduce exposure of sensitive information.",
    highlights: [
      "Differential Privacy",
      "Controlled noise addition",
      "Secure aggregation masking",
      "No raw transaction exchange",
    ],
  },
  {
    title: "Fraud Intelligence",
    description:
      "Use the collaboratively trained global model to evaluate transactions and identify potentially fraudulent activity.",
    highlights: [
      "Risk scoring",
      "Fraud probability",
      "Low / Medium / High risk",
      "Allow / Review / Flag decisions",
    ],
  },
];

const operatorFeatures = [
  "Command Center",
  "Bank Network",
  "Global Model",
  "Audit",
  "Fraud Checker",
  "System Configuration",
];

function Arrow({ vertical = false }: { vertical?: boolean }) {
  return (
    <span aria-hidden className="text-muted-foreground/60">
      {vertical ? "\u2193" : "\u2192"}
    </span>
  );
}

function Landing() {
  return (
    <div id="top" className="overflow-x-hidden">
      <Nav />

      {/* HERO */}
      <section className="hero-panel relative pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rise mx-auto max-w-4xl">
            <img
              src={heroVisual}
              alt="Federated network of financial institutions protected by a shield"
              width={1600}
              height={912}
              className="float-slow blend-blue mx-auto w-full max-w-3xl"
            />
          </div>

          <div className="rise mx-auto mt-2 max-w-4xl text-center [animation-delay:120ms]">
            <h1 className="text-[2.6rem] font-semibold text-ink sm:text-6xl lg:text-7xl">
              Fraud Intelligence Without Sharing Raw Data
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-ink/70 sm:text-lg">
              Vaultic enables financial institutions to collaboratively train fraud detection models
              while keeping sensitive transaction data within each institution.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#platform"
                className="rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-on-brand transition-transform duration-300 hover:-translate-y-0.5"
              >
                Explore Vaultic
              </a>
              <a
                href="#architecture"
                className="rounded-full border border-ink/15 bg-card px-7 py-3.5 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
              >
                View Architecture
              </a>
            </div>
            <p className="mt-7 text-xs tracking-[0.16em] text-ink/45 uppercase">
              Federated learning · Fraud detection · Privacy · Financial institutions
            </p>
          </div>
        </div>
      </section>

      {/* WELCOME / POSITIONING + PROBLEM BENTO */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <Reveal className="text-center">
          <span className="eyebrow">Welcome to Vaultic</span>
          <h2 className="mx-auto mt-6 max-w-3xl text-[2.2rem] font-semibold text-ink sm:text-5xl lg:text-6xl">
            Collaborative Intelligence. Private by Design.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground">
            Fraud rarely stops at the boundaries of a single financial institution. Vaultic enables
            participating banks to learn collectively from distributed transaction intelligence
            without pooling their raw customer data.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {["Train locally", "Protect model updates", "Aggregate globally", "Detect fraud smarter"].map(
              (s) => (
                <span key={s} className="flow-chip">
                  {s}
                </span>
              ),
            )}
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <article className="soft-card flex h-full flex-col justify-between p-8 sm:p-10">
              <div className="flex items-center justify-center rounded-[1.75rem] bg-surface px-6 py-12">
                <div className="flex items-center gap-3">
                  {["Bank A", "Bank B", "Bank C"].map((b, i) => (
                    <span
                      key={b}
                      className={`flex h-20 w-20 items-center justify-center rounded-full text-xs font-medium ${
                        i === 1
                          ? "bg-brand text-on-brand"
                          : i === 2
                            ? "bg-ink text-on-brand"
                            : "bg-card text-ink shadow-[0_10px_30px_rgba(16,24,60,0.08)]"
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  The Problem
                </span>
                <h3 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
                  Fraud Intelligence Shouldn&apos;t Require Centralizing Customer Data
                </h3>
              </div>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="soft-card flex h-full flex-col gap-8 p-8 sm:p-10">
              <p className="max-w-md text-lg text-ink/80">
                Traditional fraud detection systems operate primarily within institutional
                boundaries. Valuable patterns remain fragmented across banks, while centralized data
                sharing introduces privacy, security, regulatory, and operational challenges.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Privacy-preserving", "Raw transaction data remains local."],
                  ["Federated Learning", "Banks train models on their own infrastructure."],
                  ["Collaborative Intelligence", "Protected updates build a shared global model."],
                ].map(([t, d]) => (
                  <div key={t} className="rounded-2xl bg-surface p-5">
                    <p className="text-sm font-semibold text-ink">{t}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>

          <Reveal delay={40}>
            <article className="soft-card flex h-full flex-col justify-between p-8 sm:p-10">
              <p className="max-w-sm text-lg text-ink/80">
                Vaultic takes a different approach: move the learning to the data instead of moving
                the data to a central location.
              </p>
              <div className="mt-12 flex justify-center">
                <a
                  href="#architecture"
                  className="rounded-full bg-brand px-10 py-5 text-lg font-medium text-on-brand shadow-[0_18px_40px_rgba(37,99,235,0.28)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  View Architecture
                </a>
              </div>
            </article>
          </Reveal>

          <Reveal delay={120}>
            <article id="security" className="soft-card flex h-full flex-col justify-between p-8 sm:p-10">
              <div className="flex items-center justify-center rounded-[1.75rem] bg-surface px-6 py-10">
                <div className="w-full max-w-sm space-y-3">
                  {privacyFlow.slice(0, 3).map((s, i) => (
                    <div
                      key={s}
                      className="flex items-center justify-between rounded-2xl bg-card px-5 py-3 text-sm text-ink shadow-[0_6px_20px_rgba(16,24,60,0.06)]"
                    >
                      <span>{s}</span>
                      <span className="text-xs text-muted-foreground">0{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <h3 className="text-3xl font-semibold text-ink sm:text-4xl">Your Data Stays Yours.</h3>
                <p className="mt-4 text-base text-muted-foreground">
                  Vaultic is designed around a simple principle: institutions should be able to learn
                  together without surrendering control of their underlying transaction data.
                </p>
                <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-brand uppercase">
                  Raw transaction data is not centralized
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* OUR SOLUTION — brand panel */}
      <section id="architecture" className="brand-panel py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 text-center text-on-brand">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-[0.16em] uppercase">
              Our Solution
            </span>
            <h2 className="mx-auto mt-8 max-w-4xl text-[2.2rem] font-semibold sm:text-5xl lg:text-[3.5rem]">
              A Federated Intelligence Layer for Modern Financial Institutions
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-14 grid items-center gap-10 lg:grid-cols-3">
              <p className="text-base text-on-brand-muted lg:text-right">
                Vaultic coordinates collaborative fraud-model training across participating
                institutions without requiring them to exchange raw transaction data.
              </p>
              <img
                src={solutionVisual}
                alt="Protected model updates flowing into a shared federated model"
                width={1008}
                height={800}
                loading="lazy"
                className="float-slow blend-blue mx-auto w-56 sm:w-72"
              />
              <p className="text-base text-on-brand-muted lg:text-left">
                Each round moves learning to the data: local training, privacy protection, secure
                aggregation, and a refreshed global model returned to every participant.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
              {pipeline.map((step, i) => (
                <span key={step} className="flex items-center gap-3">
                  <span className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-medium tracking-[0.1em] uppercase">
                    {step}
                  </span>
                  {i < pipeline.length - 1 && <span className="text-on-brand-muted">{"\u2192"}</span>}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section id="platform" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <Reveal className="text-center">
          <span className="eyebrow">Platform</span>
          <h2 className="mx-auto mt-6 max-w-3xl text-[2.2rem] font-semibold text-ink sm:text-5xl">
            Vaultic Platform Capabilities
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Built to help financial institutions learn together while keeping customer data in place.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <article className="soft-card flex h-full flex-col p-8">
                <h3 className="text-2xl font-semibold text-ink">{p.title}</h3>
                <p className="mt-4 text-sm text-muted-foreground">{p.description}</p>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-6 text-sm text-ink/80">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:pb-28">
        <Reveal>
          <article className="soft-card grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Technology
              </span>
              <h2 className="mt-4 text-[2rem] font-semibold text-ink sm:text-4xl">
                MLP Fraud Detection Model
              </h2>
              <p className="mt-5 max-w-md text-base text-muted-foreground">
                Each transaction is transformed into a normalized 10-feature representation before
                being evaluated by the neural fraud-detection model.
              </p>
              <p className="mt-6 font-mono text-lg text-brand">10 → 16 → 8 → 1</p>
            </div>
            <div className="rounded-[1.75rem] bg-surface p-8">
              <ul className="space-y-4">
                {[
                  ["10", "transaction features"],
                  ["16", "hidden neurons (layer 1)"],
                  ["8", "hidden neurons (layer 2)"],
                  ["1", "fraud output"],
                ].map(([n, label], i, arr) => (
                  <li key={label} className="flex flex-col items-center gap-3">
                    <span className="flex w-full items-center gap-4 rounded-2xl bg-card px-6 py-4 shadow-[0_6px_20px_rgba(16,24,60,0.06)]">
                      <span className="text-2xl font-semibold text-ink">{n}</span>
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </span>
                    {i < arr.length - 1 && <Arrow vertical />}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
      </section>

      {/* GLOBAL INTELLIGENCE */}
      <section className="brand-panel py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 text-on-brand">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
              <h2 className="text-[2.2rem] font-semibold sm:text-5xl">
                One Global Model.
                <br />
                Many Local Institutions.
                <br />
                Shared Fraud Intelligence.
              </h2>
              <p className="text-base text-on-brand-muted">
                Each participating institution trains locally. Protected model updates are aggregated
                using Federated Averaging to produce an improved global model that can be
                synchronized back to participating institutions.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-14 flex flex-wrap items-center gap-3">
              {privacyFlow.map((step, i) => (
                <span key={step} className="flex items-center gap-3">
                  <span className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-medium tracking-[0.1em] uppercase">
                    {step}
                  </span>
                  {i < privacyFlow.length - 1 && <span className="text-on-brand-muted">{"\u2192"}</span>}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* OPERATOR PLATFORM */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <Reveal>
          <article className="soft-card grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Vaultic Operator
              </span>
              <h2 className="mt-4 text-[2rem] font-semibold text-ink sm:text-4xl">
                Command the Federation
              </h2>
              <p className="mt-5 max-w-md text-base text-muted-foreground">
                Monitor participating institutions, coordinate federated rounds, inspect global model
                performance, manage bank nodes, and maintain a complete audit trail from a
                centralized operator interface.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {operatorFeatures.map((f) => (
                <span
                  key={f}
                  className="rounded-2xl bg-surface px-5 py-4 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {f}
                </span>
              ))}
            </div>
          </article>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="brand-panel py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 text-center text-on-brand">
          <Reveal>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15">
              <LogoMark className="h-8 w-8" />
            </span>
            <h2 className="mt-8 text-[2.2rem] font-semibold sm:text-5xl">
              Build Collective Fraud Intelligence.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-on-brand-muted">
              Collaborate across financial institutions without centralizing sensitive transaction
              data.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#platform"
                className="rounded-full bg-on-brand px-7 py-3.5 text-sm font-medium text-brand transition-transform duration-300 hover:-translate-y-0.5"
              >
                Explore Vaultic
              </a>
              <a
                href="#architecture"
                className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-on-brand transition-transform duration-300 hover:-translate-y-0.5"
              >
                View Architecture
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
