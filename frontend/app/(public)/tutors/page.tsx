"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { USTAADS, Ustaad, CITIES } from "@/lib/marketplaceData";

const GOAL_OPTIONS = [
  "All Goals",
  "Cambridge O/A Levels",
  "MDCAT & Medical Prep",
  "Coding & Software Engineering",
  "IELTS & Overseas Admissions",
  "F.Sc / Matric Board Exams",
  "Tajweed & Arabic",
];

export default function FindUstaadPage() {
  const ustaadList = useMemo(() => Object.values(USTAADS), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("All Goals");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedMode, setSelectedMode] = useState<string>("All");
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(3000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeConsultModal, setActiveConsultModal] = useState<Ustaad | null>(null);
  const [consultSubmitted, setConsultSubmitted] = useState(false);
  const [consultMessage, setConsultMessage] = useState("");
  const [studentContact, setStudentContact] = useState("");

  // Filter tutors
  const filteredTutors = useMemo(() => {
    return ustaadList.filter((tutor) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tutor.name.toLowerCase().includes(q);
        const matchesTitle = tutor.title.toLowerCase().includes(q);
        const matchesBio = tutor.bio.toLowerCase().includes(q);
        const matchesEdu = tutor.education.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesBio && !matchesEdu) {
          return false;
        }
      }

      // Goal match
      if (selectedGoal !== "All Goals") {
        const goal = selectedGoal.toLowerCase();
        if (goal.includes("o/a") && !tutor.title.toLowerCase().includes("cambridge") && !tutor.title.toLowerCase().includes("o/a")) {
          return false;
        }
        if (goal.includes("mdcat") && !tutor.title.toLowerCase().includes("mdcat")) {
          return false;
        }
        if (goal.includes("coding") && !tutor.title.toLowerCase().includes("software") && !tutor.title.toLowerCase().includes("python")) {
          return false;
        }
        if (goal.includes("ielts") && !tutor.title.toLowerCase().includes("ielts")) {
          return false;
        }
        if (goal.includes("tajweed") && !tutor.title.toLowerCase().includes("tajweed")) {
          return false;
        }
      }

      // City match
      if (selectedCity !== "All Cities") {
        if (selectedCity === "Online Only" && tutor.mode !== "Online") return false;
        if (selectedCity !== "Online Only" && tutor.city !== selectedCity) return false;
      }

      // Mode match
      if (selectedMode !== "All") {
        if (selectedMode === "Online" && tutor.mode === "In-Person") return false;
        if (selectedMode === "In-Person" && tutor.mode === "Online") return false;
      }

      // Hourly rate
      if (tutor.hourlyRate > maxHourlyRate) {
        return false;
      }

      // Verified
      if (verifiedOnly && !tutor.verified) {
        return false;
      }

      return true;
    });
  }, [ustaadList, searchQuery, selectedGoal, selectedCity, selectedMode, maxHourlyRate, verifiedOnly]);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSubmitted(true);
  };

  const closeConsultModal = () => {
    setActiveConsultModal(null);
    setConsultSubmitted(false);
    setConsultMessage("");
    setStudentContact("");
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section: Direct Mentor Matching */}
        <section className="border-b border-hairline bg-white px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-ochre" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ochre">
                Personalized Tutor Directory
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-tight">
                Find your dedicated{" "}
                <span className="text-navy underline decoration-ochre/40 underline-offset-8">
                  private Ustaad.
                </span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate sm:text-lg">
                Browse individual verified educators by academic degrees, teaching background, and hourly rates. Book direct 1-on-1 private tuition tailored to your personal pace.
              </p>
            </div>

            {/* Quick Match Interactive Goal Bar */}
            <div className="mt-8 rounded-2xl border border-hairline bg-paper p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate mb-3">
                Quick Filter by Learning Goal:
              </p>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setSelectedGoal(goal)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      selectedGoal === goal
                        ? "bg-navy text-white shadow-xs"
                        : "bg-white border border-hairline text-slate hover:text-ink hover:border-navy/30"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
                  placeholder="Search educators by name, university (LUMS, FAST, KEMU), or subject..."
                  className="w-full rounded-xl border border-hairline bg-paper py-3.5 pl-12 pr-12 text-sm text-ink placeholder-slate/50 transition focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-slate hover:text-ink"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Directory Content (Sidebar + Tutor Dossier Cards) */}
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Filter Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-hairline bg-white p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-hairline">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy">
                    Filter Educators
                  </h2>
                  {(searchQuery || selectedGoal !== "All Goals" || selectedCity !== "All Cities" || selectedMode !== "All" || maxHourlyRate < 3000 || verifiedOnly) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedGoal("All Goals");
                        setSelectedCity("All Cities");
                        setSelectedMode("All");
                        setMaxHourlyRate(3000);
                        setVerifiedOnly(false);
                      }}
                      className="text-xs font-bold text-ochre hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-2">
                    City / Campus
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2.5 text-xs font-semibold text-ink focus:border-navy focus:bg-white focus:outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Teaching Mode */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate mb-2">
                    Class Format
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

                {/* Hourly Rate Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate">
                      Max Hourly Fee
                    </label>
                    <span className="text-xs font-black text-navy">
                      Rs. {maxHourlyRate.toLocaleString()} / hr
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={3000}
                    step={200}
                    value={maxHourlyRate}
                    onChange={(e) => setMaxHourlyRate(Number(e.target.value))}
                    className="w-full accent-navy cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate mt-1">
                    <span>Rs. 1,000</span>
                    <span>Rs. 3,000</span>
                  </div>
                </div>

                {/* Verified Only */}
                <div className="pt-2 border-t border-hairline">
                  <label className="flex items-start gap-2.5 text-xs font-semibold text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-hairline text-navy focus:ring-navy"
                    />
                    <span>Verified degrees & ID only</span>
                  </label>
                </div>
              </div>

              {/* Need Guidance Box */}
              <div className="rounded-2xl border border-hairline bg-white p-5 text-xs space-y-2.5 shadow-xs">
                <p className="font-bold text-navy">Need personalized tutor matching?</p>
                <p className="text-slate leading-relaxed">
                  Our academic counselors can recommend the best-suited Ustaad based on your school syllabus and past grades.
                </p>
                <Link
                  href="/register/student"
                  className="inline-block font-bold text-ochre hover:underline text-xs"
                >
                  Request Counselor Match →
                </Link>
              </div>
            </aside>

            {/* Tutor List */}
            <div className="lg:col-span-3 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <p className="text-sm font-bold text-ink">
                  {filteredTutors.length}{" "}
                  <span className="font-normal text-slate">
                    {filteredTutors.length === 1 ? "verified tutor" : "verified tutors"} ready for private tuition
                  </span>
                </p>
                <span className="text-xs text-slate">
                  Sorted by Academic Standing & Rating
                </span>
              </div>

              {filteredTutors.length > 0 ? (
                filteredTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="group rounded-2xl border border-hairline bg-white p-6 sm:p-7 shadow-xs transition duration-200 hover:border-navy/30 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                      {/* Left: Avatar + Details */}
                      <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                        <div
                          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tutor.avatarGradient} text-xl font-black text-white shadow-sm`}
                        >
                          {tutor.initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/tutors/${tutor.id}`}
                              className="text-lg font-bold text-ink transition hover:text-navy"
                            >
                              {tutor.name}
                            </Link>
                            {tutor.verified && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-green-tint px-2 py-0.5 text-[10px] font-bold text-green">
                                ✓ Verified Ustaad
                              </span>
                            )}
                            <span className="rounded-full bg-ochre-tint px-2.5 py-0.5 text-[11px] font-bold text-ochre">
                              {tutor.level}
                            </span>
                          </div>

                          <p className="mt-1 text-xs sm:text-sm font-semibold text-navy">
                            {tutor.title}
                          </p>

                          <p className="mt-1 text-xs text-slate font-medium">
                            🎓 {tutor.education}
                          </p>

                          <p className="mt-3 text-xs text-slate line-clamp-2 leading-relaxed">
                            {tutor.bio}
                          </p>

                          {/* Meta Tags */}
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate">
                            <span className="rounded bg-paper px-2.5 py-1 border border-hairline font-semibold text-ink">
                              📍 {tutor.city} ({tutor.mode})
                            </span>
                            <span>•</span>
                            <span>💬 {tutor.languages.join(", ")}</span>
                            <span>•</span>
                            <span className="text-green font-semibold">⚡ Responds in {tutor.responseTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Pricing & CTA Buttons */}
                      <div className="w-full sm:w-48 shrink-0 flex flex-col justify-between border-t border-hairline pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:border-hairline sm:pl-6 text-right sm:text-right">
                        <div>
                          <p className="text-[11px] font-semibold uppercase text-slate">
                            Private Tuition Rate
                          </p>
                          <p className="text-xl font-black text-navy mt-0.5">
                            Rs. {tutor.hourlyRate.toLocaleString()}
                            <span className="text-xs font-normal text-slate"> / hr</span>
                          </p>

                          <div className="mt-2 flex items-center justify-end gap-1 text-xs">
                            <span className="text-ochre font-black text-sm">★</span>
                            <span className="font-extrabold text-ink">{tutor.rating.toFixed(2)}</span>
                            <span className="text-slate">({tutor.reviewCount})</span>
                          </div>
                          <p className="text-[11px] text-slate mt-0.5">
                            {tutor.totalStudents}+ students mentored
                          </p>
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                          <Link
                            href={`/tutors/${tutor.id}`}
                            className="w-full rounded-xl bg-navy py-2.5 text-center text-xs font-bold text-white shadow-xs transition hover:opacity-90"
                          >
                            View Full Dossier →
                          </Link>

                          <button
                            onClick={() => setActiveConsultModal(tutor)}
                            className="w-full rounded-xl border border-hairline bg-paper py-2.5 text-center text-xs font-bold text-navy transition hover:bg-white hover:border-navy"
                          >
                            Request Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-hairline bg-white p-14 text-center">
                  <p className="text-sm font-bold text-slate">No tutors found with these filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGoal("All Goals");
                      setSelectedCity("All Cities");
                      setSelectedMode("All");
                      setMaxHourlyRate(3000);
                      setVerifiedOnly(false);
                    }}
                    className="mt-4 rounded-xl bg-navy px-5 py-2 text-xs font-bold text-white"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Consultation Request Modal */}
      {activeConsultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-hairline bg-white p-6 shadow-2xl text-ink">
            <button
              onClick={closeConsultModal}
              className="absolute right-4 top-4 text-slate hover:text-ink text-sm font-bold"
            >
              ✕
            </button>

            {!consultSubmitted ? (
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <div className="border-b border-hairline pb-3">
                  <span className="rounded bg-ochre-tint px-2 py-0.5 text-[10px] font-bold text-ochre">
                    Direct Tutor Consultation
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-ink">
                    Request Consultation with {activeConsultModal.name}
                  </h3>
                  <p className="text-xs text-slate">
                    {activeConsultModal.education.split("·")[0]} · Rs. {activeConsultModal.hourlyRate}/hr
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate mb-1">
                    Your Phone / WhatsApp or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={studentContact}
                    onChange={(e) => setStudentContact(e.target.value)}
                    placeholder="0300-1234567 or email@example.com"
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate mb-1">
                    What subjects or syllabus do you need help with?
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={consultMessage}
                    onChange={(e) => setConsultMessage(e.target.value)}
                    placeholder="e.g. Need Cambridge O-Level Physics Paper 2 past paper coaching twice a week..."
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-navy py-3 text-center text-xs font-bold text-white shadow-xs transition hover:opacity-90"
                >
                  Send Consultation Request
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-tint text-xl font-bold text-green">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-ink">Inquiry Sent to {activeConsultModal.name}!</h3>
                <p className="text-xs text-slate max-w-xs mx-auto leading-relaxed">
                  The educator will review your requirements and reach out via {studentContact} within {activeConsultModal.responseTime}.
                </p>
                <button
                  onClick={closeConsultModal}
                  className="mt-4 rounded-xl bg-navy px-5 py-2 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
