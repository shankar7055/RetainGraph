import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { ArrowUpRight, Zap, Brain, Workflow, Shield, Cpu, Sparkles, Boxes, Radar } from "lucide-react";
import heroNoise from "@/assets/hero-noise.jpg";
import orb from "@/assets/orb.jpg";
import arch from "@/assets/architecture.jpg";
import { useScrollScene, useMarquee } from "@/lib/scroll";
import { Magnetic, TiltCard, Spotlight } from "@/components/site/Interactive";
import { LiquidMetal } from '@paper-design/shaders-react';

export const Route = createFileRoute("/")({
  component: Home,
});

const stats = [
  { k: 10, suffix: "s", v: "Timeout window configured for robust Cognee/Groq chat response delivery" },
  { k: 15, suffix: "min", v: "Interval for retaingraph-churn.timer oneshot client scan passes" },
  { k: 100, suffix: "%", v: "Isolation enforcement using UUID-based datasets per tenant" },
];

const capabilities = [
  { icon: Brain, title: "Cognee Graph RAG", body: "Uses official @cognee/cognee-ts client to build and query semantic knowledge graphs." },
  { icon: Workflow, title: "Ingestion Pipelines", body: "Asynchronous intake enqueues BullMQ jobs to add, cognify, and poll dataset status." },
  { icon: Shield, title: "Tenant Dataset Isolation", body: "Strictly scopes queries and datasets by Tenant UUID to guarantee privacy." },
  { icon: Cpu, title: "Groq Inference", body: "Fast LLM inference for chat completions, brief generation, and churn classification." },
];

const services = [
  { n: "01", t: "Ingestion Worker", d: "Processes BullMQ jobs and updates ClientInteraction statuses asynchronously." },
  { n: "02", t: "Oneshot Churn Scan", d: "Systemd timer-driven oneshot job running Groq-powered churn risk classification." },
  { n: "03", t: "Pre-Call Briefs", d: "Generates account detail summaries using GRAPH_SUMMARY_COMPLETION." },
];

const process = [
  { icon: Radar, n: "01", t: "Ingest", d: "Accept raw text payload, create pending ClientInteraction record, and enqueue BullMQ job." },
  { icon: Boxes, n: "02", t: "Process", d: "Worker picks up job, calls Cognee add() and cognify(), and polls status until completion." },
  { icon: Sparkles, n: "03", t: "Analyze", d: "Query Cognee graph context, pass to Groq, and write InsightEvents for CSM attention." },
];

const logos = ["Cigna", "Aetna", "Anthem", "CVS", "United", "Humana"];

export function Home() {
  const sceneRef = useScrollScene<HTMLDivElement>();
  const marqueeRef = useMarquee<HTMLDivElement>();

  return (
    <SiteLayout>
      <div ref={sceneRef}>
        {/* HERO */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-end">
          <div className="absolute inset-0 z-0 pointer-events-none" data-parallax="0.25">
            <LiquidMetal
              width={1920}
              height={1080}
              image="/whitelogo.png"
              colorBack="#000000"
              colorTint="#307dcf73"
              shape={undefined}
              repetition={6}
              softness={0.8}
              shiftRed={1}
              shiftBlue={-1}
              distortion={0.4}
              contour={0.4}
              angle={0}
              speed={1}
              scale={0.6}
              fit="contain"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background z-0 pointer-events-none" />
          <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 pt-24 pb-24 w-full z-10">
            <div className="eyebrow flex items-center gap-2 mb-8" data-reveal>
              <Stripes /> RetainGraph / 2026
            </div>
            <h1 className="display text-[clamp(3rem,10vw,10rem)]" data-reveal>
              Graph-Powered<br />Client Retention
            </h1>
            <div className="mt-10 flex flex-wrap gap-3" data-reveal>
              <Magnetic>
                <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm">
                  Start a project <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm hover:bg-secondary">
                  See our work
                </Link>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div ref={marqueeRef} className="border-y border-border py-6 overflow-hidden bg-card">
          <div data-marquee-track className="flex gap-16 whitespace-nowrap will-change-transform">
            {[...Array(2)].map((_, r) => (
              <div key={r} className="flex gap-16">
                {["Cognee Graph RAG", "Client Success", "Churn Prediction", "Groq Inference", "Tenant Isolation", "BullMQ Ingestion", "Systemd Services", "Correlation IDs"].map((w, i) => (
                  <span key={i} className="display text-2xl md:text-4xl flex items-center gap-16 text-muted-foreground">
                    {w} <Zap className="w-5 h-5 text-foreground" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* INTRO */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-24">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4 eyebrow" data-reveal>
              <span className="inline-block w-6 h-[2px] bg-muted-foreground align-middle mr-2" />
              About RetainGraph
            </div>
            <p className="md:col-span-8 text-2xl md:text-3xl display leading-[1.15]" data-reveal>
              A multi-tenant SaaS API + worker system + React dashboard designed to get data into Cognee cleanly and get graph-aware answers back out fast.
            </p>
          </div>

          <div className="mt-20 grid md:grid-cols-4 gap-px bg-border" data-stagger>
            {capabilities.map((c) => (
              <div key={c.title} className="bg-background p-8 group transition-colors hover:bg-card">
                <c.icon className="w-6 h-6 mb-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                <h3 className="font-display text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-px bg-border" data-stagger>
            {stats.map((s) => (
              <div key={s.suffix + s.k} className="bg-background p-10">
                <div className="display text-7xl mb-4 flex items-baseline">
                  <span data-counter={s.k} data-suffix={s.suffix}>0{s.suffix}</span>
                </div>
                <div className="text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DIVIDER with parallax bolt */}
        <section className="relative py-40 grain border-y border-border overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 flex items-center justify-center">
            <div data-parallax="0.5" className="grid place-items-center w-24 h-24 bg-primary text-primary-foreground rounded-md">
              <Zap className="w-10 h-10" />
            </div>
          </div>
        </section>

        <section className="bg-card text-foreground border-y border-border">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-28">
            <div className="grid md:grid-cols-12 gap-10 mb-16">
              <div className="md:col-span-6" data-reveal>
                <div className="eyebrow text-muted-foreground mb-6"><Stripes /> Services</div>
                <h2 className="display text-5xl md:text-7xl">Power neural solutions.</h2>
              </div>
              <p className="md:col-span-6 md:pt-10 text-muted-foreground" data-reveal>
                We ship production-grade AI: from prototype to platform. Every engagement includes architecture, deployment, telemetry and a runbook for your team.
              </p>
            </div>
            <div className="divide-y divide-border border-y border-border" data-stagger>
              {services.map((s) => (
                <div key={s.n} className="grid grid-cols-12 gap-6 py-8 items-center group cursor-pointer">
                  <div className="col-span-2 font-mono text-sm text-muted-foreground/60">/{s.n}</div>
                  <div className="col-span-4 display text-2xl group-hover:translate-x-2 transition-transform">{s.t}</div>
                  <div className="col-span-5 text-sm text-muted-foreground">{s.d}</div>
                  <div className="col-span-1 flex justify-end">
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEW: PROCESS with tilt cards */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-28">
          <div className="grid md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-6" data-reveal>
              <div className="eyebrow mb-6"><Stripes /> Method</div>
              <h2 className="display text-5xl md:text-7xl">Three phases to production.</h2>
            </div>
            <p className="md:col-span-6 md:pt-10 text-muted-foreground" data-reveal>
              A predictable path from a fuzzy problem to a running system. Every phase has a deliverable and a decision gate.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6" data-stagger>
            {process.map((p) => (
              <TiltCard key={p.n} className="bg-card border border-border rounded-lg p-8 relative overflow-hidden">
                <div className="font-mono text-xs text-muted-foreground mb-10">/ {p.n}</div>
                <p.icon className="w-8 h-8 mb-6" />
                <div className="display text-3xl mb-3">{p.t}</div>
                <p className="text-sm text-muted-foreground">{p.d}</p>
                <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-muted opacity-30 blur-2xl" />
              </TiltCard>
            ))}
          </div>
        </section>

        {/* SCALE */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-28">
          <div className="grid md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-6" data-reveal>
              <div className="eyebrow mb-6"><Stripes /> Scale</div>
              <h2 className="display text-5xl md:text-7xl">Built for the scale.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-border" data-stagger>
            {[
              { k: 500, suffix: "M+", v: "Tokens processed daily" },
              { k: 99.99, suffix: "%", decimals: 2, v: "Platform uptime" },
              { k: 24, suffix: "/7", v: "Autonomous operation" },
              { k: 40, suffix: "+", v: "Enterprise deployments" },
            ].map((s) => (
              <div key={s.v} className="bg-background p-10">
                <div className="display text-5xl mb-3">
                  <span data-counter={s.k} data-suffix={s.suffix} data-decimals={s.decimals ?? 0}>0</span>
                </div>
                <div className="text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* OPTIMIZED with parallax orb */}
        <section className="bg-card border-y border-border overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-28 grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5" data-reveal>
              <div className="eyebrow mb-6"><Stripes /> Performance</div>
              <h2 className="display text-4xl md:text-6xl mb-6">Optimized for performance</h2>
              <p className="text-muted-foreground max-w-md">
                Real-time telemetry, adaptive routing and warm inference paths. Every millisecond accounted for, every request traceable.
              </p>
            </div>
            <div className="md:col-span-7 grid place-items-center">
              <div data-parallax="0.15">
                <img src={orb} alt="Neural sphere" width={600} height={600} loading="lazy" className="max-w-md w-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card text-foreground border-y border-border">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-28">
            <div className="grid md:grid-cols-12 gap-10 mb-16">
              <div className="md:col-span-6" data-reveal>
                <div className="eyebrow text-muted-foreground mb-6"><Stripes /> Autonomy</div>
                <h2 className="display text-5xl md:text-7xl">Engineered for autonomy</h2>
              </div>
              <p className="md:col-span-6 md:pt-10 text-muted-foreground" data-reveal>
                Systems that self-heal, self-scale and self-report. Deploy once, iterate through observation.
              </p>
            </div>
            <div className="overflow-hidden rounded-md">
              <div data-parallax="0.2">
                <img src={arch} alt="Architecture" width={1600} height={1000} loading="lazy" className="w-full scale-110" />
              </div>
            </div>
          </div>
        </section>

        {/* NEW: SPOTLIGHT CTA */}
        <section className="relative overflow-hidden border-y border-border">
          <Spotlight />
          <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 py-40 text-center grain">
            <div className="eyebrow mb-8 justify-center inline-flex" data-reveal><Stripes /> Ready when you are</div>
            <h2 className="display text-6xl md:text-9xl max-w-5xl mx-auto" data-reveal>
              A system,<br />not a demo.
            </h2>
            <div className="mt-12" data-reveal>
              <Magnetic strength={0.5}>
                <Link to="/about" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full text-base">
                  Book intro call <ArrowUpRight className="w-5 h-5" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* LOGOS */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-28">
          <div className="text-center eyebrow mb-14" data-reveal>Trusted by the pioneers</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-border" data-stagger>
            {logos.map((l) => (
              <div key={l} className="bg-background aspect-[3/1] grid place-items-center text-muted-foreground display text-2xl hover:text-foreground hover:bg-card transition-colors">
                {l}
              </div>
            ))}
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-28">
          <div className="grid md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-6" data-reveal>
              <div className="eyebrow mb-6"><Stripes /> Insights</div>
              <h2 className="display text-5xl md:text-7xl">Insights on neural logic</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6" data-stagger>
            {[1, 2, 3].map((i) => (
              <Link to="/about" key={i} className="group block">
                <TiltCard className="aspect-[4/3] bg-card border border-border rounded-md overflow-hidden mb-4 grain">
                  <div className="w-full h-full grid-bg opacity-40" />
                </TiltCard>
                <div className="eyebrow mb-2">Jul 04, 2026</div>
                <h3 className="font-display text-xl group-hover:text-muted-foreground transition-colors">
                  {["Why your AI outputs feel underbaked", "Scoring the seven traits of a durable agent", "From prompt to protocol — a builder's field guide"][i - 1]}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function Stripes() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="inline-block">
      <path d="M0 8 L6 0 M4 8 L10 0 M8 8 L14 0 M12 8 L18 0" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
