import { formatPKR } from "@/utils/formatters";
import { CalendarIcon, CreditCardIcon, GraduationCapIcon, HeartIcon } from "./icons";

export interface StudentStatsData {
  activeClassrooms: number;
  upcomingSessions: number;
  pendingFees: number;
  savedUstaads: number;
}

export const EMPTY_STATS: StudentStatsData = {
  activeClassrooms: 0,
  upcomingSessions: 0,
  pendingFees: 0,
  savedUstaads: 0,
};

export default function StudentStats({ stats = EMPTY_STATS }: { stats?: Partial<StudentStatsData> }) {
  const data: StudentStatsData = { ...EMPTY_STATS, ...stats };

  const cards = [
    {
      label: "Active Classrooms",
      value: String(data.activeClassrooms),
      icon: GraduationCapIcon,
    },
    {
      label: "Upcoming Sessions",
      value: String(data.upcomingSessions),
      icon: CalendarIcon,
    },
    {
      label: "Pending Fees",
      value: formatPKR(data.pendingFees),
      icon: CreditCardIcon,
    },
    {
      label: "Saved Ustaads",
      value: String(data.savedUstaads),
      icon: HeartIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-[#D18A4A] ring-1 ring-white/10 transition group-hover:scale-105">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/45">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}