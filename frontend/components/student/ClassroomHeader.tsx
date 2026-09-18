interface ClassroomHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function ClassroomHeader({ eyebrow, title, subtitle }: ClassroomHeaderProps) {
  return (
    <div>
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D18A4A]">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}