export type SectionId = "how" | "features" | "about" | "tech" | "milestones" | "opinions" | "faq" | "privacy" | "contact";
type FooterColumn = "product" | "project" | null;

/** Fuente única de las anclas: el Header y el Footer se generan desde aquí. */
export const SECTIONS: readonly { id: SectionId; nav: boolean; column: FooterColumn }[] = [
  { id: "how", nav: false, column: "product" },
  { id: "features", nav: true, column: "product" },
  { id: "opinions", nav: false, column: "product" },
  { id: "faq", nav: true, column: "product" },
  { id: "about", nav: true, column: "project" },
  { id: "tech", nav: false, column: "project" },
  { id: "milestones", nav: true, column: "project" },
  { id: "privacy", nav: false, column: "project" },
  { id: "contact", nav: true, column: null },
];

export const visibleSections = (hasContact: boolean) =>
  SECTIONS.filter((s) => s.id !== "contact" || hasContact);
