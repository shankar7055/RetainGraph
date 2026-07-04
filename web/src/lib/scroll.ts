import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Fade + rise on scroll for children matching selector. */
export function useReveal<T extends HTMLElement>(
  selector = "[data-reveal]",
): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(selector);
      items.forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [selector]);
  return ref;
}

/** Parallax translateY for elements matching data-parallax with optional speed. */
export function useParallax<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-parallax]");
      items.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.3");
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return ref;
}

/** Horizontal scroll marquee. */
export function useMarquee<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-marquee-track]", {
        xPercent: -50,
        ease: "none",
        duration: 30,
        repeat: -1,
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return ref;
}

/** Combined reveal + parallax scope. */
export function useScrollScene<T extends HTMLElement>(
  revealSelector = "[data-reveal]",
): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(revealSelector).forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.3");
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger] > *").forEach((el, i) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.06,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
      // Number counters
      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
        const to = parseFloat(el.dataset.counter || "0");
        const suffix = el.dataset.suffix || "";
        const decimals = parseInt(el.dataset.decimals || "0");
        const obj = { v: 0 };
        gsap.to(obj, {
          v: to,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = obj.v.toFixed(decimals) + suffix;
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [revealSelector]);
  return ref;
}
