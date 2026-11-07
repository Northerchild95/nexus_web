"use client";
import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

type Pos = { x: number; y: number };
type Args = {
  stage: RefObject<HTMLElement | null>;
  camera: RefObject<HTMLElement | null>;
  world: RefObject<HTMLElement | null>;
  positions: Pos[];
  enabled: boolean;
};

/**
 * Un solo timeline con pin + scrub:
 * la cámara (scale/rotate) se aleja, el mundo (x/y) viaja a la siguiente escena
 * y la cámara se acerca otra vez. Cada escena revela su contenido al llegar.
 */
export function useWorldTimeline({ stage, camera, world, positions, enabled }: Args) {
  useEffect(() => {
    if (!enabled || !stage.current) return;
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-scene]");
      const reveals = (i: number) => Array.from(els[i].querySelectorAll("[data-reveal]"));
      const base = Math.min(1, window.innerWidth / 1100);
      const n = positions.length;

      gsap.set(world.current, { x: -positions[0].x, y: -positions[0].y });
      gsap.set(camera.current, { scale: base });
      gsap.set(els.slice(1), { opacity: 0.25 });
      gsap.set(els.slice(1).flatMap((_, k) => reveals(k + 1)), { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: `+=${(n - 1) * 130}%`,
          pin: true,
          scrub: 1,
        },
      });

      for (let i = 1; i < n; i++) {
        const at = `s${i}`;
        tl.addLabel(at)
          .to(camera.current, { scale: base * 0.5, rotate: i % 2 ? -4 : 4, duration: 0.6 }, at)
          .to(world.current, { x: -positions[i].x, y: -positions[i].y, duration: 1.2 }, at)
          .to(els[i - 1], { opacity: 0.25, duration: 0.6 }, at)
          .to(camera.current, { scale: base, rotate: 0, duration: 0.6 }, `${at}+=0.6`)
          .to(els[i], { opacity: 1, duration: 0.6 }, `${at}+=0.6`)
          .to(reveals(i), { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, `${at}+=0.9`)
          .to({}, { duration: 0.7 });
      }
    }, stage);
    return () => ctx.revert();
  }, [enabled, stage, camera, world, positions]);
}
