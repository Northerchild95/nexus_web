import { serializeJsonLd } from "@/lib/seo/jsonld";

/** Datos estructurados: debe renderizarse como <script> (generateMetadata no soporta JSON-LD). */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
