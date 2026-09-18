"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import MarketplaceGigCard from "@/components/shared/MarketplaceGigCard";
import { GIGS, POPULAR_SUBJECTS, CITIES } from "@/lib/marketplaceData";

export default function BrowseMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedMode, setSelectedMode] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxBudget, setMaxBudget] = useState<number>(20000);
  const [sortBy, setSortBy] = useState<"match" | "rating" | "price_asc" | "price_desc" | "reviews">("match");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and Sort Gigs
  const filteredGigs = useMemo(() => {
    let result = GIGS.filter((gig) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = gig.title.toLowerCase().includes(q);
        const matchesSubject = gig.subject.toLowerCase().includes(q);
        const matchesUstaad = gig.ustaad.name.toLowerCase().includes(q);
        const matchesCity = gig.ustaad.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesUstaad && !matchesCity) {
          return false;
        }
      }

      // Subject filter
      if (selectedSubject !== "All" && !gig.subject.toLowerCase().includes(selectedSubject.toLowerCase())) {
        return false;
      }

      // City filter
      if (selectedCity !== "All Cities") {
        if (selectedCity === "Online Only" && gig.ustaad.mode !== "Online") {
          return false;
        } else if (selectedCity !== "Online Only" && gig.ustaad.city !== selectedCity) {
          return false;
        }
      }

      // Mode filter
      if (selectedMode !== "All") {
        if (selectedMode === "Online" && gig.ustaad.mode === "In-Person") return false;
        if (selectedMode === "In-Person" && gig.ustaad.mode === "Online") return false;
      }

      // Level filter
      if (selectedLevel !== "All" && gig.ustaad.level !== selectedLevel) {
        return false;
      }

      // Verified filter
      if (verifiedOnly && !gig.ustaad.verified) {
        return false;
      }

      // Budget filter
      if (gig.startingPrice > maxBudget) {
        return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "match") return b.matchPercent - a.matchPercent;
      if (sortBy === "rating") return b.ustaad.rating - a.ustaad.rating;
      if (sortBy === "price_asc") return a.startingPrice - b.startingPrice;
      if (sortBy === "price_desc") return b.startingPrice - a.startingPrice;
      if (sortBy === "reviews") return b.ustaad.reviewCount - a.ustaad.reviewCount;
      return 0;
    });

    return result;
  }, [searchQuery, selectedSubject, selectedCity, selectedMode, selectedLevel, verifiedOnly, maxBudget, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSubject("All");
    setSelectedCity("All Cities");
    setSelectedMode("All");
    setSelectedLevel("All");
    setVerifiedOnly(false);
    setMaxBudget(20000);
    setSortBy("match");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedSubject !== "All" ||
    selectedCity !== "All Cities" ||
    selectedMode !== "All" ||
    selectedLevel !== "All" ||
    verifiedOnly ||
    maxBudget < 20000;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Editorial Header Section */}
        <section className="border-b border-hairline bg-white px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            {/* Section Tag */}
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-ochre" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ochre">
                Verified Ustaad Network
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-tight">
                Learn directly from Pakistan&apos;s most{" "}
                <span className="text-navy underline decoration-ochre/40 underline-offset-8">
                  dedicated teachers.
                </span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate sm:text-lg">
                Connect with verified subject specialists, Cambridge mentors, and university position holders. Compare transparent learning packages with zero hidden fees and full escrow protection.
              </p>
            </div>

            {/* Human-Made Search & Filter Controls */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate/50">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject (e.g. Physics, Python, IELTS), curriculum, or teacher name..."
                  className="w-full rounded-xl border border-hairline bg-paper py-3.5 pl-12 pr-12 text-sm text-ink placeholder-slate/50 transition focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-medium text-slate hover:text-ink"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Mobile Filter Trigger Button */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-white px-5 py-3.5 text-sm font-bold text-navy shadow-xs transition hover:bg-paper lg:hidden"
              >
                <svg className="h-4 w-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters {hasActiveFilters && "•"}
              </button>
            </div>

            {/* Popular Subject Chips */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate mr-1">
                Popular Subjects:
              </span>
              {POPULAR_SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedSubject === subject
                      ? "bg-navy text-white shadow-xs"
                      : "border border-hairline bg-white text-slate hover:border-navy/30 hover:text-ink"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Catalog Main Layout (Sidebar + Results) */}
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Filter Sidebar */}
            <aside className={`lg:block ${showMobileFilters ? "block" : "hidden"} space-y-6`}>
              <div className="rounded-2xl border border-hairline bg-white p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy flex items-center gap-2">
                    <svg className="h-4 w-4 text-ochre" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filter Mentors
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs font-bold text-ochre hover:underline"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-2">
                    Campus / Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2.5 text-xs font-semibold text-ink transition focus:border-navy focus:bg-white focus:outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-2">
                    Teaching Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-lg border border-hairline bg-paper p-1">
                    {["All", "Online", "In-Person"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`rounded-md py-1.5 text-center text-xs font-semibold transition ${
                          selectedMode === mode
                            ? "bg-navy text-white shadow-xs"
                            : "text-slate hover:text-ink"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-2">
                    Teacher Standing
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2.5 text-xs font-semibold text-ink transition focus:border-navy focus:bg-white focus:outline-none"
                  >
                    <option value="All">All Ustaad Standings</option>
                    <option value="Top Rated Ustaad">Top Rated Ustaad</option>
                    <option value="Level 2 Ustaad">Level 2 Ustaad</option>
                    <option value="Rising Star">Rising Star</option>
                  </select>
                </div>

                {/* Maximum Price Range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate">
                      Max Price / Session
                    </label>
                    <span className="text-xs font-extrabold text-navy">
                      Rs. {maxBudget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={20000}
                    step={500}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-navy cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate mt-1">
                    <span>Rs. 1,000</span>
                    <span>Rs. 20,000</span>
                  </div>
                </div>

                {/* Verified Only Checkbox */}
                <div className="pt-2 border-t border-hairline">
                  <label className="flex items-start gap-2.5 text-xs font-semibold text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-hairline text-navy focus:ring-navy"
                    />
                    <span>Show verified degrees & credentials only</span>
                  </label>
                </div>
              </div>

              {/* Escrow Guarantee Callout */}
              <div className="rounded-2xl border border-green-tint bg-green-tint/50 p-5 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-green">
                  <span>🛡️</span>
                  <span>Ustaad Escrow Protection</span>
                </div>
                <p className="text-slate leading-relaxed">
                  Your tuition fees are kept in safe custody until your scheduled session is successfully conducted.
                </p>
              </div>
            </aside>

            {/* Results Grid Column */}
            <div className="lg:col-span-3">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
                <div>
                  <h2 className="text-xl font-bold text-ink">
                    {filteredGigs.length}{" "}
                    <span className="font-normal text-slate">
                      {filteredGigs.length === 1 ? "learning program" : "learning programs"} found
                    </span>
                  </h2>
                  {selectedSubject !== "All" && (
                    <p className="text-xs text-slate mt-0.5">
                      Curated offerings in <span className="font-bold text-navy">{selectedSubject}</span>
                    </p>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sortSelect" className="text-xs font-semibold text-slate whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    id="sortSelect"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-bold text-ink transition focus:border-navy focus:outline-none"
                  >
                    <option value="match">AI Match Score</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="reviews">Most Reviewed</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Pills */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 py-4">
                  <span className="text-xs font-semibold text-slate">Active filters:</span>
                  {selectedSubject !== "All" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                      Subject: {selectedSubject}
                      <button onClick={() => setSelectedSubject("All")} className="text-slate hover:text-ink">✕</button>
                    </span>
                  )}
                  {selectedCity !== "All Cities" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                      Location: {selectedCity}
                      <button onClick={() => setSelectedCity("All Cities")} className="text-slate hover:text-ink">✕</button>
                    </span>
                  )}
                  {selectedMode !== "All" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                      Mode: {selectedMode}
                      <button onClick={() => setSelectedMode("All")} className="text-slate hover:text-ink">✕</button>
                    </span>
                  )}
                  {selectedLevel !== "All" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                      Standing: {selectedLevel}
                      <button onClick={() => setSelectedLevel("All")} className="text-slate hover:text-ink">✕</button>
                    </span>
                  )}
                  {verifiedOnly && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                      Verified Credentials
                      <button onClick={() => setVerifiedOnly(false)} className="text-slate hover:text-ink">✕</button>
                    </span>
                  )}
                  {maxBudget < 20000 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                      Under Rs. {maxBudget.toLocaleString()}
                      <button onClick={() => setMaxBudget(20000)} className="text-slate hover:text-ink">✕</button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-ochre hover:underline ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              {filteredGigs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredGigs.map((gig) => (
                    <MarketplaceGigCard key={gig.id} gig={gig} />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-white p-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-2xl text-slate">
                    🔍
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">No learning programs match your criteria</h3>
                  <p className="mt-1.5 max-w-sm text-sm text-slate">
                    Try adjusting your filters or resetting the search to discover more Ustaads.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 rounded-xl bg-navy px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
