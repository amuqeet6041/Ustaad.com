"use client";

import Link from "next/link";
import { useState } from "react";
import { Gig } from "@/lib/marketplaceData";

interface Props {
  gig: Gig;
}

export default function MarketplaceGigCard({ gig }: Props) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ochre/50 hover:shadow-xl hover:shadow-navy/5">
      {/* Top Section: Ustaad Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/tutors/${gig.ustaad.id}`}
            className="flex items-center gap-3.5 group/author"
          >
            {/* Avatar */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gig.ustaad.avatarGradient} text-sm font-extrabold text-white shadow-sm transition group-hover/author:scale-105`}
            >
              {gig.ustaad.initials}
            </div>

            {/* Name & Credentials */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-ink transition group-hover/author:text-navy">
                  {gig.ustaad.name}
                </span>
                {gig.ustaad.verified && (
                  <span
                    title="Verified Academic Credentials"
                    className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-tint text-[10px] font-bold text-green"
                  >
                    ✓
                  </span>
                )}
              </div>
              <p className="truncate text-xs font-medium text-slate">
                {gig.ustaad.education.split("·")[0].trim()}
              </p>
            </div>
          </Link>

          {/* Bookmark Button */}
          <button
            type="button"
            aria-label={isFavorited ? "Remove from saved" : "Save this Ustaad"}
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

        {/* Visual Mentorship Card Header */}
        <Link href={`/gigs/${gig.id}`} className="block mt-4">
          <div className="relative overflow-hidden rounded-xl border border-hairline/60 bg-paper p-4 transition group-hover:bg-ochre-tint/30">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-navy px-2.5 py-1 text-[11px] font-bold text-white tracking-wide">
                {gig.subject}
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate shadow-xs border border-hairline">
                📍 {gig.ustaad.city} ({gig.ustaad.mode})
              </span>
            </div>

            <h3 className="mt-3 line-clamp-2 text-sm font-bold text-ink leading-snug transition group-hover:text-navy">
              {gig.title}
            </h3>

            {/* Quick Pedagogy Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate">
              <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-hairline/70">
                <span className="text-green font-bold">✓</span> 1-on-1 Class
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 border border-hairline/70">
                <span className="text-green font-bold">✓</span> Notes Included
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom Information: Rating, Match Score, Transparent Price */}
      <div className="mt-5 border-t border-hairline pt-4">
        <div className="flex items-center justify-between text-xs">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <span className="text-ochre text-sm font-black">★</span>
            <span className="font-extrabold text-ink">{gig.ustaad.rating.toFixed(2)}</span>
            <span className="text-slate text-[11px]">({gig.ustaad.reviewCount})</span>
          </div>

          {/* AI Match Score */}
          <span className="rounded-full bg-ochre-tint px-2.5 py-0.5 text-[11px] font-extrabold text-ochre">
            {gig.matchPercent}% Match
          </span>
        </div>

        {/* Pricing Row */}
        <div className="mt-3.5 flex items-baseline justify-between pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate">
            Tuition Fee
          </span>
          <div className="text-right">
            <span className="text-base font-extrabold text-navy">
              Rs. {gig.startingPrice.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-slate ml-1">/ session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
