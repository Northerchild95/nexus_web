// Solo datos visuales. Los textos viven en src/messages/*.json (namespace "Scenes").
export const SCENE_SIZE = { w: 960, h: 560 } as const;

export const SCENES = [
  { id: "focus", tint: "bg-brand-100", pos: { x: 0, y: 0 } },
  { id: "tasks", tint: "bg-accent-aqua", pos: { x: 1150, y: -240 } },
  { id: "habits", tint: "bg-accent-mint", pos: { x: 2300, y: 160 } },
  { id: "finance", tint: "bg-accent-amber", pos: { x: 3450, y: -180 } },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
