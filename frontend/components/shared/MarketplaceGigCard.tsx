"use client";

import Link from "next/link";
import { useState } from "react";
import type { Gig } from "@/services/gigService";
import { formatPrice, formatTeachingMode, getInitials, getStartingPrice } from "@/lib/marketplaceFormatters";

interface Props {
  gig: Gig;
}

export default function MarketplaceGigCard({ gig }: Props) {
  const [isFavorited, setIsFavorited] = useState(false);
  const teacher = gig.teacher;
  const city = teacher?.city ?? gig.city;
  const mode = teacher?.teaching_mode ?? null;
  const startingPrice = getStartingPrice(gig);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ochre/50 hover:shadow-xl hover:shadow-navy/5">
      {/* Top Section: Teacher Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Teacher identity — displayed, not linked (no tutor API yet). */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#14213D] to-[#1E3A8A] text-sm font-extrabold text-white shadow-sm">
              {teacher ? getInitials(teacher.name) : "U"}
            </div>

            {/* Name & Credentials */}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">
                {teacher ? teacher.name : "Teacher"}
              </p>
              {teacher?.education && (
                <p className="truncate text-xs font-medium text-slate">
                  {teacher.education.split("·")[0].trim()}
                </p>
              )}
              {!teacher?.education && teacher?.bio && (
                <p className="truncate text-xs font-medium text-slate">
                  {teacher.bio}
                </p>
              )}
            </div>
          </div>

          {/* Bookmark Button (local UI only) */}
          <button
            type="button"
            aria-label={isFavorited ? "Remove from saved" : "Save this gig"}
            onClick={() => setIsFavorited(!isFavorited)}
            className="rounded-lg p-2 text-slate/40 transition hover:bg-paper hover:text-ochre"
          >
            <svg
              className={`h-4 w-4 ${isFavorited ? "fill-ochre text-ochre" : "fill-none"}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Gig Card Header */}
        <Link href={`/gigs/${gig.id}`} className="block mt-4">
          <div className="relative overflow-hidden rounded-xl border border-hairline/60 bg-paper p-4 transition group-hover:bg-ochre-tint/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md bg-navy px-2.5 py-1 text-[11px] font-bold text-white tracking-wide">
                {gig.subject || "Tutoring"}
              </span>
              {(city || mode) && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate shadow-xs border border-hairline">
                  📍 {[city, mode ? formatTeachingMode(mode) : null].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>

            <h3 className="mt-3 line-clamp-2 text-sm font-bold text-ink leading-snug transition group-hover:text-navy">
              {gig.title}
            </h3>

            {gig.teacher?.teaching_mode && (
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate">
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-hairline/70">
                  🎓 {formatTeachingMode(gig.teacher.teaching_mode)}
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Bottom Information: Transparent Price */}
      <div className="mt-5 border-t border-hairline pt-4">
        {/* Pricing Row */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate">
            Starting From
          </span>
          <div className="text-right">
            {startingPrice != null ? (
              <span className="text-base font-extrabold text-navy">
                {formatPrice(startingPrice)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate">
                Pricing on request
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}