export type FaqItem = { q: string; a: string };

/** Datos estructurados FAQPage (schema.org). Función pura: se prueba sin renderizar nada. */
export const buildFaqJsonLd = (items: FaqItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
});

export const buildWebSiteJsonLd = (name: string, url: string, lang: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name,
  url,
  inLanguage: lang,
});

/** Serializa para un <script>: escapa "<" para que ningún texto cierre la etiqueta. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
