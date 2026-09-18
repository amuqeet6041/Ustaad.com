import Link from "next/link";
import {
  ArrowRightIcon,
  ChatIcon,
  CompassIcon,
  CreditCardIcon,
  GraduationCapIcon,
} from "./icons";

const ACTIONS = [
  {
    label: "Find an Ustaad",
    description: "Browse verified Ustaads and learning programs.",
    href: "/browse",
    icon: CompassIcon,
    primary: true,
  },
  {
    label: "View Classrooms",
    description: "See your active learning rooms.",
    href: "/student-dashboard/classrooms",
    icon: GraduationCapIcon,
  },
  {
    label: "View Messages",
    description: "Check messages and notifications.",
    href: "/student-dashboard/messages",
    icon: ChatIcon,
  },
  {
    label: "View Payments",
    description: "Review fees and escrow status.",
    href: "/student-dashboard/payments",
    icon: CreditCardIcon,
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className={`group rounded-2xl border p-5 transition ${
              action.primary
                ? "border-[#B5651D]/40 bg-[#B5651D]/10 hover:border-[#D18A4A]/60 hover:bg-[#B5651D]/15"
                : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/10 ${
                  action.primary ? "bg-[#B5651D]/20 text-[#D18A4A]" : "bg-white/[0.05] text-[#D18A4A]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRightIcon className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
            </div>
            <p className="mt-4 text-sm font-bold text-white">{action.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/45">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}