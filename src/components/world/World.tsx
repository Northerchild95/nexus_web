"use client";
import { useMemo, useRef } from "react";
import { useIsClient } from "@/hooks/useIsClient";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWorldTimeline } from "@/hooks/useWorldTimeline";
import Scene from "./Scene";
import type { SceneItem } from "./types";

/**
 * Isla de cliente. Los textos ya llegan traducidos desde el servidor (props),
 * así el HTML inicial contiene todo el contenido (SEO) y solo la animación se hidrata.
 */
export default function World({ items }: { items: SceneItem[] }) {
  const hydrated = useIsClient();
  const wide = useMediaQuery("(min-width: 900px)");
  const reduced = useReducedMotion();
  const animate = hydrated && wide && !reduced;

  const stage = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const positions = useMemo(() => items.map((i) => i.pos), [items]);

  useWorldTimeline({ stage, camera, world, positions, enabled: animate });

  if (!animate) {
    // SSR, móvil y reduced-motion: lista vertical (invisible solo hasta hidratar, sin salto de layout)
    return (
      <div className={`flex flex-col gap-10 px-4 py-16 ${hydrated ? "" : "opacity-0"}`}>
        {items.map((i) => <Scene key={i.id} item={i} flow />)}
      </div>
    );
  }

  return (
    <div ref={stage} className="relative h-screen overflow-hidden">
      <div ref={camera} className="absolute inset-0 origin-center">
        <div ref={world} className="absolute left-1/2 top-1/2 h-0 w-0">
          {items.map((i) => <Scene key={i.id} item={i} flow={false} />)}
        </div>
      </div>
    </div>
  );
}
