import { useTranslations } from "next-intl";
import { SCENES } from "@/config/scenes";
import FinanceUi from "@/components/scenes/FinanceUi";
import FocusUi from "@/components/scenes/FocusUi";
import HabitsUi from "@/components/scenes/HabitsUi";
import TasksUi from "@/components/scenes/TasksUi";
import World from "./World";
import type { SceneItem } from "./types";

const UI = { focus: <FocusUi />, tasks: <TasksUi />, habits: <HabitsUi />, finance: <FinanceUi /> };

/** Server Component: traduce y compone los datos; delega la animación al cliente. */
export default function WorldSection() {
  const t = useTranslations("Scenes");
  const items: SceneItem[] = SCENES.map((s) => ({
    ...s,
    title: t(`${s.id}.title`),
    copy: t(`${s.id}.copy`),
    ui: UI[s.id],
  }));
  return <World items={items} />;
}
