export interface TutorCardProps {
  initials: string;
  name: string;
  subject: string;
  city: string;
  mode: string;
  priceLabel: string;
  matchPercent?: number;
  verified?: boolean;
}

/**
 * Tutor card used in Featured Tutors (landing page) and Browse/Search results.
 * Match % (ochre) only appears when a real score exists — never a placeholder.
 */
export default function TutorCard({
  initials,
  name,
  subject,
  city,
  mode,
  priceLabel,
  matchPercent,
  verified = true,
}: TutorCardProps) {
  return (
    <div className="bg-white border border-hairline rounded-lg p-4 flex-1">
      <div className="w-full h-28 rounded-md mb-3.5 flex items-center justify-center text-white text-2xl font-extrabold bg-gradient-to-br from-navy-tint to-navy">
        {initials}
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-navy font-bold text-sm">{name}</span>
        {verified && <span className="pill-verified">✓ Verified</span>}
      </div>
      <div className="text-slate text-xs mb-3">
        {subject} · {city} · {mode}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-navy font-bold text-sm">{priceLabel}</span>
        {matchPercent != null && (
          <span className="text-ochre font-extrabold text-sm">{matchPercent}% match</span>
        )}
      </div>
    </div>
  );
}
