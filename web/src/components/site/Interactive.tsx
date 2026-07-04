import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import gsap from "gsap";

/** Magnetic button — pulls toward cursor. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  function onMove(e: MouseEvent<HTMLSpanElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(ref.current, { x, y, duration: 0.4, ease: "power3.out" });
  }
  function onLeave() {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  }
  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={"inline-block " + (className ?? "")}>
      {children}
    </span>
  );
}

/** Tilt card — rotates on cursor position. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(ref.current, {
      rotateY: px * 12,
      rotateX: -py * 12,
      duration: 0.6,
      ease: "power3.out",
      transformPerspective: 800,
    });
  }
  function onLeave() {
    if (!ref.current) return;
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3.out" });
  }
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}

/** Follow cursor spotlight overlay. */
export function Spotlight({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function move(e: globalThis.MouseEvent) {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      gsap.to(ref.current, {
        "--mx": `${e.clientX - rect.left}px`,
        "--my": `${e.clientY - rect.top}px`,
        duration: 0.6,
        ease: "power3.out",
      } as gsap.TweenVars);
    }
    const parent = ref.current?.parentElement;
    parent?.addEventListener("mousemove", move);
    return () => parent?.removeEventListener("mousemove", move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className={"pointer-events-none absolute inset-0 " + className}
      style={{
        background: "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.09), transparent 60%)",
      }}
    />
  );
}
