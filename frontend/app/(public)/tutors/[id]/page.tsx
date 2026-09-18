"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import StaticGigCard from "@/components/shared/StaticGigCard";
import { getUstaadById, getGigsByUstaad, USTAADS } from "@/lib/marketplaceData";

export default function TutorProfilePage() {
  const params = useParams();
  const tutorId = params?.id as string;
  const tutor = getUstaadById(tutorId) || USTAADS["ustaad-1"];
  const tutorGigs = getGigsByUstaad(tutor.id);

  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 flex-1">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate">
          <Link href="/" className="hover:text-navy transition">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-navy transition">Marketplace</Link>
          <span>/</span>
          <span className="text-ink font-semibold">{tutor.name}</span>
        </nav>

        {/* Profile Dossier Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-white p-7 sm:p-9 lg:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div
                className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tutor.avatarGradient} text-3xl font-black text-white shadow-md`}
              >
                {tutor.initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-ink">
                    {tutor.name}
                  </h1>
                  {tutor.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-tint px-3 py-1 text-xs font-bold text-green border border-green/20">
                      ✓ Verified Ustaad
                    </span>
                  )}
                  <span className="rounded-full bg-ochre-tint px-3 py-1 text-xs font-bold text-ochre">
                    {tutor.level}
                  </span>
                </div>

                <p className="mt-2 text-sm sm:text-base text-slate font-medium">
                  {tutor.title}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate">
                  <span className="flex items-center gap-1 font-medium text-ink">
                    📍 {tutor.city}, Pakistan ({tutor.mode})
                  </span>
                  <span>•</span>
                  <span>💬 {tutor.languages.join(", ")}</span>
                  <span>•</span>
                  <span>Active educator since {tutor.joinedYear}</span>
                </div>
              </div>
            </div>

            {/* Right Action CTAs */}
            <div className="flex w-full md:w-auto flex-col sm:flex-row gap-3">
              <a
                href="#message-section"
                className="rounded-xl border border-navy px-5 py-3 text-center text-xs font-bold text-navy transition hover:bg-navy hover:text-white"
              >
                💬 Ask a Question
              </a>
              <a
                href="#services-section"
                className="rounded-xl bg-navy px-6 py-3 text-center text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
              >
                Explore Learning Plans ↓
              </a>
            </div>
          </div>

          {/* Academic Stats Row */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-hairline pt-6 sm:grid-cols-4">
            <div className="rounded-xl border border-hairline bg-paper p-4 text-center">
              <p className="text-2xl font-black text-ochre">{tutor.rating.toFixed(2)} ★</p>
              <p className="text-xs text-slate mt-1 font-medium">Student Rating ({tutor.reviewCount})</p>
            </div>
            <div className="rounded-xl border border-hairline bg-paper p-4 text-center">
              <p className="text-2xl font-black text-navy">{tutor.totalStudents}+</p>
              <p className="text-xs text-slate mt-1 font-medium">Students Mentored</p>
            </div>
            <div className="rounded-xl border border-hairline bg-paper p-4 text-center">
              <p className="text-2xl font-black text-navy">{tutor.totalSessions}+</p>
              <p className="text-xs text-slate mt-1 font-medium">Classes Completed</p>
            </div>
            <div className="rounded-xl border border-hairline bg-paper p-4 text-center">
              <p className="text-2xl font-black text-green">{tutor.completionRate}</p>
              <p className="text-xs text-slate mt-1 font-medium">Reliability Rate</p>
            </div>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Dossier, Credentials, Direct Message (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bio */}
            <div className="rounded-2xl border border-hairline bg-white p-6 space-y-3 shadow-xs">
              <h2 className="text-base font-extrabold text-navy flex items-center gap-2">
                <span>📝</span> Pedagogical Approach & Background
              </h2>
              <p className="text-xs sm:text-sm text-slate leading-relaxed font-normal">
                {tutor.bio}
              </p>
            </div>

            {/* Verified Qualifications */}
            <div className="rounded-2xl border border-hairline bg-white p-6 space-y-3 shadow-xs">
              <h2 className="text-base font-extrabold text-navy flex items-center gap-2">
                <span>🎓</span> Verified Degrees & Certifications
              </h2>
              <div className="rounded-xl border border-hairline bg-paper p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{tutor.education}</span>
                  <span className="text-green text-[10px] font-bold bg-green-tint px-1.5 py-0.5 rounded">
                    ✓ Verified
                  </span>
                </div>
                <p className="text-slate">Academic degrees authenticated by the Ustaad Verification Team.</p>
              </div>
            </div>

            {/* Schedule & Availability */}
            <div className="rounded-2xl border border-hairline bg-white p-6 space-y-3 text-xs shadow-xs">
              <h2 className="text-base font-extrabold text-navy flex items-center gap-2">
                <span>⚡</span> Responsiveness & Classroom Format
              </h2>
              <div className="space-y-2 text-ink">
                <div className="flex justify-between py-1.5 border-b border-hairline">
                  <span className="text-slate">Average Response:</span>
                  <span className="font-bold">{tutor.responseTime}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-hairline">
                  <span className="text-slate">Delivery Format:</span>
                  <span className="font-bold">{tutor.mode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-hairline">
                  <span className="text-slate">Primary Campus:</span>
                  <span className="font-bold">{tutor.city}, Pakistan</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate">Base Hourly Rate:</span>
                  <span className="font-black text-navy">Rs. {tutor.hourlyRate.toLocaleString()} / hr</span>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div id="message-section" className="rounded-2xl border border-hairline bg-white p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-extrabold text-navy flex items-center gap-2">
                <span>💬</span> Ask {tutor.name.split(" ")[0]} a Question
              </h2>
              {!messageSent ? (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <textarea
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Ask about syllabus requirements, exam board, or specific lesson timings..."
                    className="w-full rounded-xl border border-hairline bg-paper p-3 text-xs text-ink placeholder-slate/50 focus:border-navy focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-navy py-2.5 text-center text-xs font-bold text-white transition hover:opacity-90"
                  >
                    Send Direct Inquiry
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-green-tint bg-green-tint p-4 text-center text-xs text-green font-semibold">
                  ✓ Your inquiry has been delivered to {tutor.name}. Expect a response within {tutor.responseTime}.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Learning Programs Offered (7 cols) */}
          <div id="services-section" className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>📦</span> Mentorship Programs & Courses ({tutorGigs.length})
              </h2>
              <p className="text-xs text-slate mt-1">
                Select a structured program below to view tiered deliverables and reserve sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tutorGigs.map((gig) => (
                <StaticGigCard key={gig.id} gig={gig} />
              ))}
            </div>

            {/* Student Reviews */}
            <div className="mt-12 space-y-4 pt-6 border-t border-hairline">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>⭐</span> Student Testimonials & Endorsements
              </h2>

              <div className="space-y-3">
                {tutorGigs.flatMap((g) => g.reviews).map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-hairline bg-white p-5 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                          {rev.studentInitials}
                        </div>
                        <span className="text-xs font-bold text-ink">{rev.studentName}</span>
                        <span className="text-[10px] text-slate">({rev.studentCity})</span>
                      </div>
                      <span className="text-ochre text-xs">{"★".repeat(rev.rating)}</span>
                    </div>
                    <p className="text-xs text-slate leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
