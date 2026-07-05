import { Link } from "@tanstack/react-router";
import { useRef, useEffect } from "react";
import { ArrowUpRight, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

export function Footer() {
  const modelRef = useRef<any>(null);
  const spinVelocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  function handleModelClick() {
    if (!modelRef.current || typeof modelRef.current.adjustCameraOrbit !== 'function') return;
    
    // Add velocity in radians
    spinVelocityRef.current += 0.25;
    
    if (animationFrameRef.current === null) {
      const animate = () => {
        if (!modelRef.current || typeof modelRef.current.adjustCameraOrbit !== 'function') {
          animationFrameRef.current = null;
          return;
        }
        
        // Adjust camera orbit horizontally by velocity
        modelRef.current.adjustCameraOrbit(spinVelocityRef.current, 0, 0);
        
        // Decay velocity
        spinVelocityRef.current *= 0.92;
        
        if (Math.abs(spinVelocityRef.current) > 0.001) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          spinVelocityRef.current = 0;
          animationFrameRef.current = null;
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }

  return (
    <footer className="relative border-t border-border bg-card grain overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-24 pb-10">
        <div className="grid md:grid-cols-2 gap-10 pb-24">
          <div>
            <div className="eyebrow flex items-center gap-2 mb-6">
              <span className="inline-block w-6 h-[2px] bg-muted-foreground" />
              Get started
            </div>
            <h2 className="display text-4xl md:text-6xl max-w-xl">
              Get smarter about client retention
            </h2>
          </div>
          <div className="md:pt-16">
            <p className="text-muted-foreground max-w-md mb-6">
              Weekly insights on customer success graphs, churn patterns, and Cognee architecture. No fluff, just what works.
            </p>
            <form className="flex items-center gap-2 border border-border rounded-full p-1.5 max-w-md bg-card">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm inline-flex items-center gap-1.5">
                Subscribe <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-10 py-14 border-t border-border">
          <Link to="/" className="flex items-start">
            <div className="grid place-items-center w-16 h-16 text-white border border-white/20 rounded-md overflow-hidden">
              <model-viewer
                ref={modelRef}
                src="/luwai_HD_1783185489195.glb"
                disable-zoom="true"
                interaction-prompt="none"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Link>
          <FooterCol title="Quick Links" links={[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
          ]} />
          <FooterCol title="Company" links={[
            { to: "/about", label: "About Us" },
            { to: "/about", label: "Contact Us" },
          ]} />
          <div>
            <div className="eyebrow mb-5">Policies</div>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Privacy Policy</a></li>
            </ul>
            <div className="flex items-center gap-2 mt-6">
              {[Twitter, Linkedin, Youtube, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="grid place-items-center w-9 h-9 rounded-md border border-border hover:bg-secondary">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 text-center text-xs text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} RetainGraph. All rights reserved.
        </div>
      </div>
      <div aria-hidden className="select-none pointer-events-none overflow-hidden">
        <div className="text-white/10 font-display font-black leading-[0.8] tracking-tighter text-center whitespace-nowrap" style={{ fontSize: "clamp(6rem, 26vw, 24rem)" }}>
          retaingraph
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div className="eyebrow mb-5">{title}</div>
      <ul className="space-y-3 text-sm">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="text-muted-foreground hover:text-foreground">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
