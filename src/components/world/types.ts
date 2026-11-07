import type { ReactNode } from "react";
import type { SceneId } from "@/config/scenes";

export type SceneItem = {
  id: SceneId;
  title: string;
  copy: string;
  tint: string;
  pos: { x: number; y: number };
  ui: ReactNode;
};
