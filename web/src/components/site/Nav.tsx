import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
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
    if (!modelRef.current) return;
    
    // Add velocity in radians
    spinVelocityRef.current += 0.25;
    
    if (animationFrameRef.current === null) {
      const animate = () => {
        if (!modelRef.current) return;
        
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
    <>
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center w-8 h-8 bg-transparent text-primary-foreground rounded-sm overflow-hidden">
              <model-viewer
                ref={modelRef}
                onClick={handleModelClick}
                src="/luwai_HD_1783185489195.glb"
                auto-rotate="true"
                rotation-per-second="90deg"
                camera-controls="true"
                disable-zoom="true"
                interaction-prompt="none"
                style={{ width: "100%", height: "100%" }}
              />
            </span>
            <span className="font-display text-lg tracking-tight">retaingraph</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-border bg-card/60 backdrop-blur-md px-2 py-1.5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="px-4 py-1.5 text-sm text-muted-foreground rounded-full transition-colors hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/about"
              className="hidden md:inline-flex items-center gap-1.5 text-sm px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              Book a call <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="md:hidden grid place-items-center w-10 h-10 border border-border rounded-full"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-1/2 hidden md:block bg-background grain" />
          <div className="w-full md:w-1/2 bg-surface text-surface-foreground p-8 md:p-14 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 grid place-items-center w-10 h-10 border border-black/10 rounded-full"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-16 grid md:grid-cols-2 gap-10">
              <div>
                <div className="eyebrow mb-4 text-black/50">Quick Links</div>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        onClick={() => setOpen(false)}
                        className="text-2xl md:text-3xl font-display inline-flex items-center gap-2 hover:opacity-70"
                      >
                        {l.label} <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="eyebrow mb-4 text-black/50">Other Links</div>
                <ul className="space-y-3">
                  <li><a href="#" className="text-2xl md:text-3xl font-display inline-flex items-center gap-2 hover:opacity-70">Terms <ArrowUpRight className="w-5 h-5" /></a></li>
                  <li><a href="#" className="text-2xl md:text-3xl font-display inline-flex items-center gap-2 hover:opacity-70">Privacy <ArrowUpRight className="w-5 h-5" /></a></li>
                  <li><a href="#" className="text-2xl md:text-3xl font-display inline-flex items-center gap-2 hover:opacity-70">Careers <ArrowUpRight className="w-5 h-5" /></a></li>
                </ul>
                <div className="mt-16 text-sm text-black/60">
                  <div>2919 Manchaca Rd #102</div>
                  <div>Austin, TX 78704</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Bolt() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}
