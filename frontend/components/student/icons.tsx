interface IconProps {
  className?: string;
}

function baseProps(className?: string) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function OverviewIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2.1 5-5 2.1 2.1-5z" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M19.5 13.5L12 21l-7.5-7.5A5 5 0 1 1 12 7a5 5 0 1 1 7.5 6.5z" />
    </svg>
  );
}

export function GraduationCapIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M22 9L12 4 2 9l10 5 10-5z" />
      <path d="M6 11.5V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5" />
      <path d="M22 9v5" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function CreditCardIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M20 8h-6" />
      <path d="M12 8H4" />
      <path d="M20 16h-2" />
      <path d="M13 16H4" />
      <circle cx="15" cy="8" r="2" />
      <circle cx="10" cy="16" r="2" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function VideoIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="2" y="5" width="14" height="14" rx="2" />
      <path d="M16 10.5l6-3.5v10l-6-3.5" />
    </svg>
  );
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M9 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M17 3l4 4L8 20l-5 1 1-5z" />
      <path d="M14.5 5.5l4 4" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="8" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function ActivityIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M22 12h-4l-3 8-6-16-3 8H2" />
    </svg>
  );
}