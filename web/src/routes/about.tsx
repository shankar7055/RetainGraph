import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Award, Cpu, Lock, Users } from "lucide-react";
import arch from "@/assets/architecture.jpg";
import insightNewOne from "@/assets/insight_black_one.png";
import insightNewTwo from "@/assets/insight_black_two.png";
import insightNewThree from "@/assets/insight_black_three.png";
import memberAnya from "@/assets/member_anya.png";
import memberDario from "@/assets/member_dario.png";
import memberRue from "@/assets/member_rue.png";
import memberMila from "@/assets/member_mila.png";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — RetainGraph" },
      { name: "description", content: "Graph-based client retention and Cognee-driven context discovery." },
      { property: "og:title", content: "About — RetainGraph" },
      { property: "og:description", content: "Building on machine intelligence and knowledge graphs." },
    ],
  }),
});

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-24">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-6">
            <div className="eyebrow mb-6">// 001 — Who we are</div>
            <h1 className="display text-5xl md:text-8xl">Predictive Client Success & Retention Graphs</h1>
          </div>
          <p className="md:col-span-6 md:pt-24 text-muted-foreground max-w-md">
            A production-grade pipeline leveraging Cognee and Groq to ingest customer data, build semantic knowledge graphs, and proactively flag account churn risk.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pb-24">
        <div className="grid grid-cols-3 gap-6">
          <div className="aspect-[3/4] bg-card rounded-md overflow-hidden grain">
            <img src={insightNewOne} alt="" className="w-full h-full object-cover grayscale opacity-75" loading="lazy" />
          </div>
          <div className="aspect-[3/4] bg-card rounded-md overflow-hidden">
            <img src={insightNewTwo} alt="" className="w-full h-full object-cover opacity-85" loading="lazy" />
          </div>
          <div className="aspect-[3/4] bg-card rounded-md overflow-hidden grain">
            <img src={insightNewThree} alt="" className="w-full h-full object-cover grayscale contrast-125 opacity-75" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="bg-surface text-surface-foreground">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-28 grid md:grid-cols-4 gap-px bg-black/10">
          {[
            { icon: Award, t: "Oneshot Scans", d: "Fires oneshot timer scans every 15 minutes to flag risk before a client meeting." },
            { icon: Cpu, t: "Cognee Graph", d: "Enforces semantic relationships and maps customer interactions to a unified knowledge graph." },
            { icon: Lock, t: "Tenant Isolated", d: "Strict application layer dataset isolation using tenant UUID names." },
            { icon: Users, t: "Enterprise Ready", d: "Designed to fit single VM architectures with high reliability, timeouts, and backoffs." },
          ].map((c) => (
            <div key={c.t} className="bg-surface p-10">
              <c.icon className="w-8 h-8 mb-6" />
              <div className="display text-lg mb-2">{c.t}</div>
              <p className="text-sm text-black/60">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-28">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-6">
            <div className="eyebrow mb-6">// 002</div>
            <h2 className="display text-5xl md:text-7xl">Building graph-aware client success</h2>
          </div>
          <div className="md:col-span-6 md:pt-16 space-y-8">
            <p className="text-muted-foreground">Since 2018, we've partnered with teams shipping real systems into real infrastructure. No demos, no vaporware — only what runs in production.</p>
            <div className="grid grid-cols-2 gap-6">
              <div><div className="display text-6xl mb-2">8yrs</div><div className="text-xs text-muted-foreground">Building AI at the frontier</div></div>
              <div><div className="display text-6xl mb-2">3x</div><div className="text-xs text-muted-foreground">Faster delivery than in-house average</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pb-28">
        <div className="eyebrow mb-6">People behind the intelligence</div>
        <h2 className="display text-4xl md:text-6xl mb-16">A small senior team, deeply embedded.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Anya Voss", role: "Founder / ML lead", portrait: memberAnya },
            { name: "Dario Kim", role: "Systems architect", portrait: memberDario },
            { name: "Rue Chen", role: "Research engineer", portrait: memberRue },
            { name: "Mila Farid", role: "Head of platform", portrait: memberMila },
          ].map((p, i) => (
            <div key={p.name}>
              <div className="aspect-[4/5] rounded-md mb-4 bg-card overflow-hidden relative border border-border">
                <img 
                  src={p.portrait} 
                  alt={p.name} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                  loading="lazy" 
                />
              </div>
              <div className="font-display">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.role}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
