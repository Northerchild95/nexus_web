export default function SectionHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">{title}</h2>
      {lead && <p className="mt-4 text-lg leading-7 text-muted">{lead}</p>}
    </div>
  );
}
