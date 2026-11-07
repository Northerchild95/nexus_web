import { SCENE_SIZE } from "@/config/scenes";
import type { SceneItem } from "./types";

export default function Scene({ item, flow }: { item: SceneItem; flow: boolean }) {
  const style = flow
    ? undefined
    : {
        width: SCENE_SIZE.w,
        height: SCENE_SIZE.h,
        left: item.pos.x - SCENE_SIZE.w / 2,
        top: item.pos.y - SCENE_SIZE.h / 2,
      };
  const layout = flow
    ? "relative mx-auto w-full max-w-[960px] flex-col gap-8 p-8 md:flex-row md:p-12"
    : "absolute p-12";
  return (
    <section
      data-scene={item.id}
      aria-labelledby={`scene-${item.id}`}
      style={style}
      className={`flex items-center justify-between rounded-4xl shadow-card ${item.tint} ${layout}`}
    >
      <div className="max-w-[380px]">
        <h2 id={`scene-${item.id}`} data-reveal className="text-4xl font-bold leading-[1.1] tracking-tight">
          {item.title}
        </h2>
        <p data-reveal className="mt-4 text-lg leading-7 text-ink/75">{item.copy}</p>
      </div>
      <div data-reveal className="float">{item.ui}</div>
    </section>
  );
}
