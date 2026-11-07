import type { ReactNode } from "react";

export default function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="h-[460px] w-[230px] shrink-0 overflow-hidden rounded-[36px] border-[8px] border-frame bg-surfaceSoft p-4 shadow-lift"
    >
      {children}
    </div>
  );
}
