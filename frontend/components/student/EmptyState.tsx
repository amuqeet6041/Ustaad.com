interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center sm:py-14">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-white/40 ring-1 ring-white/10">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/50">{description}</p>
      {children}
    </div>
  );
}