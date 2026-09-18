"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { getGigById, GIGS, GigPackage } from "@/lib/marketplaceData";

export default function GigDetailPage() {
  const params = useParams();
  const gigId = params?.id as string;
  const gig = getGigById(gigId) || GIGS[0];

  // Selected mentorship plan: 'basic' | 'standard' | 'premium'
  const [selectedTier, setSelectedTier] = useState<"basic" | "standard" | "premium">("basic");
  const activePackage: GigPackage = gig.packages[selectedTier];

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Tomorrow at 5:00 PM");
  const [selectedPlatform, setSelectedPlatform] = useState("Google Meet (Virtual Whiteboard)");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [studentNotes, setStudentNotes] = useState("");

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleBookingConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  const resetModal = () => {
    setIsBookingModalOpen(false);
    setBookingSuccess(false);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 flex-1">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate">
          <Link href="/" className="hover:text-navy transition">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-navy transition">Marketplace</Link>
          <span>/</span>
          <Link href={`/browse?category=${gig.category}`} className="hover:text-navy transition">{gig.category}</Link>
          <span>/</span>
          <span className="text-ink font-semibold truncate max-w-xs">{gig.subject}</span>
        </nav>

        {/* Top Header: Title & Ustaad Credentials */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl leading-snug">
            {gig.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
            {/* Ustaad Pill */}
            <Link
              href={`/tutors/${gig.ustaad.id}`}
              className="flex items-center gap-2.5 rounded-full border border-hairline bg-white py-1 pl-1 pr-3 shadow-2xs transition hover:border-navy/30"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gig.ustaad.avatarGradient} text-xs font-bold text-white`}
              >
                {gig.ustaad.initials}
              </div>
              <span className="font-bold text-ink">{gig.ustaad.name}</span>
              {gig.ustaad.verified && (
                <span className="text-[10px] text-green font-bold bg-green-tint px-1.5 py-0.5 rounded">
                  ✓ Verified
                </span>
              )}
            </Link>

            {/* Level Tag */}
            <span className="rounded-full bg-ochre-tint px-2.5 py-1 text-[11px] font-bold text-ochre">
              {gig.ustaad.level}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <span className="text-ochre font-black">★</span>
              <span className="font-extrabold text-ink">{gig.ustaad.rating.toFixed(2)}</span>
              <span className="text-slate">({gig.ustaad.reviewCount} reviews)</span>
            </div>

            <span className="text-slate/40 hidden sm:inline">•</span>

            {/* Students */}
            <span className="text-slate font-medium">
              {gig.ustaad.totalStudents}+ students mentored
            </span>

            <span className="text-slate/40 hidden sm:inline">•</span>

            {/* AI Match */}
            <span className="text-ochre font-extrabold">
              ⚡ {gig.matchPercent}% Match Score
            </span>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* LEFT COLUMN: Content, Syllabus, Pedagogy, Reviews (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Editorial Highlight Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white p-7 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-navy px-3 py-1 text-xs font-bold text-white">
                  {gig.category} · {gig.subject}
                </span>
                <span className="rounded-md bg-green-tint px-3 py-1 text-xs font-bold text-green border border-green/20">
                  ✓ 100% Satisfaction Guarantee
                </span>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-ochre font-bold">
                  Personalized 1-on-1 Mentorship
                </p>
                <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">
                  Master concepts with confidence and clarity.
                </h2>
                <div className="mt-6 flex flex-wrap gap-2.5 text-xs text-slate">
                  <span className="rounded-md bg-paper px-3 py-1.5 border border-hairline font-medium text-ink">
                    📍 {gig.ustaad.city} ({gig.ustaad.mode})
                  </span>
                  <span className="rounded-md bg-paper px-3 py-1.5 border border-hairline font-medium text-ink">
                    ⚡ Responds in {gig.ustaad.responseTime}
                  </span>
                  <span className="rounded-md bg-paper px-3 py-1.5 border border-hairline font-medium text-ink">
                    🎓 {gig.ustaad.education.split("·")[0].trim()}
                  </span>
                </div>
              </div>
            </div>

            {/* Program Overview */}
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>📖</span> Program Overview & Teaching Philosophy
              </h2>
              <p className="text-sm leading-relaxed text-slate sm:text-base">
                {gig.overview}
              </p>
            </section>

            {/* What You Will Gain */}
            <section className="rounded-2xl border border-hairline bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                <span>🎯</span> What You Will Master
              </h2>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {gig.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-tint text-xs font-bold text-green">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm text-ink/80 leading-snug font-medium">
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum Breakdown */}
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>📚</span> Structured Curriculum Breakdown
              </h2>
              <div className="space-y-3">
                {gig.syllabus.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-hairline bg-white p-5 shadow-xs transition hover:border-navy/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy text-xs font-black text-white">
                        0{idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-ink">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-slate pl-10 leading-relaxed font-normal">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Compare Mentorship Plans Table */}
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>📊</span> Compare Mentorship Plans
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-hairline bg-white shadow-xs">
                <table className="w-full text-left text-xs text-ink">
                  <thead className="border-b border-hairline bg-paper text-[11px] uppercase tracking-wider text-slate">
                    <tr>
                      <th className="p-4">Deliverable</th>
                      <th className="p-4 text-center font-bold text-ink">Diagnostic</th>
                      <th className="p-4 text-center font-bold text-ink">Unit Mastery</th>
                      <th className="p-4 text-center font-bold text-ink">Exam Sprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    <tr>
                      <td className="p-4 font-bold text-ink">Tuition Fee</td>
                      <td className="p-4 text-center font-black text-navy text-sm">
                        Rs. {gig.packages.basic.price.toLocaleString()}
                      </td>
                      <td className="p-4 text-center font-black text-navy text-sm">
                        Rs. {gig.packages.standard.price.toLocaleString()}
                      </td>
                      <td className="p-4 text-center font-black text-navy text-sm">
                        Rs. {gig.packages.premium.price.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">1-on-1 Live Sessions</td>
                      <td className="p-4 text-center font-semibold">{gig.packages.basic.sessionsCount} Session (60m)</td>
                      <td className="p-4 text-center font-semibold">{gig.packages.standard.sessionsCount} Sessions</td>
                      <td className="p-4 text-center font-semibold">{gig.packages.premium.sessionsCount} Sessions</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Formulas & Revision Pack</td>
                      <td className="p-4 text-center text-green font-bold">✓ Included</td>
                      <td className="p-4 text-center text-green font-bold">✓ Included</td>
                      <td className="p-4 text-center text-green font-bold">✓ Included</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Marked Homework Reviews</td>
                      <td className="p-4 text-center text-slate/40">—</td>
                      <td className="p-4 text-center text-green font-bold">✓ Weekly</td>
                      <td className="p-4 text-center text-green font-bold">✓ Daily Review</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Past Paper Mocks Graded</td>
                      <td className="p-4 text-center text-slate/40">—</td>
                      <td className="p-4 text-center text-slate/40">—</td>
                      <td className="p-4 text-center text-green font-bold">✓ 2 Full Mocks</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Direct Mentor WhatsApp Q&A</td>
                      <td className="p-4 text-center text-slate/40">—</td>
                      <td className="p-4 text-center text-green font-bold">✓ Standard</td>
                      <td className="p-4 text-center text-green font-bold">✓ 24/7 Priority</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Action</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedTier("basic");
                            setIsBookingModalOpen(true);
                          }}
                          className="rounded-lg border border-navy px-3 py-1.5 font-bold text-navy hover:bg-navy hover:text-white transition"
                        >
                          Book Basic
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedTier("standard");
                            setIsBookingModalOpen(true);
                          }}
                          className="rounded-lg bg-navy px-3 py-1.5 font-bold text-white hover:opacity-90 transition shadow-xs"
                        >
                          Book Standard
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedTier("premium");
                            setIsBookingModalOpen(true);
                          }}
                          className="rounded-lg bg-ochre px-3 py-1.5 font-bold text-white hover:opacity-90 transition shadow-xs"
                        >
                          Book Sprint
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Meet Your Ustaad Section */}
            <section className="rounded-2xl border border-hairline bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>👨‍🏫</span> Meet Your Ustaad
              </h2>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gig.ustaad.avatarGradient} text-xl font-extrabold text-white shadow-md`}
                >
                  {gig.ustaad.initials}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tutors/${gig.ustaad.id}`}
                      className="text-lg font-bold text-ink hover:text-navy transition"
                    >
                      {gig.ustaad.name}
                    </Link>
                    {gig.ustaad.verified && (
                      <span className="rounded-md bg-green-tint px-2 py-0.5 text-[10px] font-bold text-green">
                        ✓ Verified Credentials
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate font-medium">
                    {gig.ustaad.title}
                  </p>
                  <p className="text-xs text-ochre font-semibold">
                    🎓 {gig.ustaad.education}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate leading-relaxed pt-2 font-normal">
                {gig.ustaad.bio}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4 text-xs">
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Location</p>
                  <p className="font-bold text-ink mt-0.5">{gig.ustaad.city}, PK</p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Languages</p>
                  <p className="font-bold text-ink mt-0.5">{gig.ustaad.languages.join(", ")}</p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Avg. Response</p>
                  <p className="font-bold text-ink mt-0.5">{gig.ustaad.responseTime}</p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Completion Rate</p>
                  <p className="font-bold text-green mt-0.5">{gig.ustaad.completionRate}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/tutors/${gig.ustaad.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-ochre transition"
                >
                  View Full Academic Profile & Experience →
                </Link>
              </div>
            </section>

            {/* Student Reviews */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                  <span>💬</span> Student Reviews & Feedback
                </h2>
                <div className="flex items-center gap-1 text-sm font-bold text-ink">
                  <span className="text-ochre font-black">★ {gig.ustaad.rating.toFixed(2)}</span>
                  <span className="text-slate font-normal">({gig.reviews.length} reviews)</span>
                </div>
              </div>

              <div className="space-y-3">
                {gig.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-hairline bg-white p-5 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                          {rev.studentInitials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">{rev.studentName}</p>
                          <p className="text-[10px] text-slate">Verified Student · {rev.studentCity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ochre">
                        {"★".repeat(rev.rating)}
                        <span className="text-slate ml-1 text-[11px]">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>❓</span> Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                {gig.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-hairline bg-white overflow-hidden shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-ink hover:text-navy transition"
                    >
                      <span>{faq.question}</span>
                      <span className="ml-2 text-slate font-bold">
                        {openFaq === idx ? "−" : "+"}
                      </span>
                    </button>
                    {openFaq === idx && (
                      <div className="border-t border-hairline p-4 text-xs text-slate leading-relaxed bg-paper">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Enrollment Box (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              {/* Enrollment Card */}
              <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-xl">
                {/* 3 Tier Selector Tabs */}
                <div className="grid grid-cols-3 border-b border-hairline text-center text-xs font-bold">
                  {(["basic", "standard", "premium"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`py-3.5 capitalize transition ${
                        selectedTier === tier
                          ? "border-b-2 border-navy bg-paper text-navy"
                          : "text-slate hover:text-ink hover:bg-paper/50"
                      }`}
                    >
                      {tier === "basic" ? "Diagnostic" : tier === "standard" ? "Unit Mastery" : "Sprint"}
                    </button>
                  ))}
                </div>

                {/* Selected Package Details */}
                <div className="p-6 space-y-5">
                  {/* Price Row */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate">
                      {activePackage.name} Mentorship Plan
                    </span>
                    <span className="text-3xl font-black text-navy">
                      Rs. {activePackage.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      {activePackage.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate leading-relaxed">
                      {activePackage.description}
                    </p>
                  </div>

                  {/* Duration & Delivery Meta */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate border-y border-hairline py-3">
                    <div className="flex items-center gap-1.5">
                      <span>⏱️</span>
                      <span>{activePackage.durationMinutes} mins total</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>{activePackage.sessionsCount} {activePackage.sessionsCount === 1 ? "Session" : "Sessions"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🚀</span>
                      <span>{activePackage.deliveryDays}d plan</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate">
                      What&apos;s Included:
                    </p>
                    {activePackage.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-ink font-medium">
                        <span className="text-green font-bold">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Primary CTA */}
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full rounded-xl bg-navy py-3.5 text-center text-sm font-bold text-white shadow-md shadow-navy/10 transition hover:bg-navy/90 hover:-translate-y-0.5"
                  >
                    Enroll in this Plan (Rs. {activePackage.price.toLocaleString()})
                  </button>

                  {/* Secondary CTA */}
                  <Link
                    href={`/student-dashboard/messages?tutor=${gig.ustaad.id}`}
                    className="block w-full rounded-xl border border-hairline bg-paper py-3 text-center text-xs font-bold text-navy transition hover:bg-white hover:border-navy"
                  >
                    💬 Ask {gig.ustaad.name.split(" ")[0]} a Question
                  </Link>

                  {/* Escrow Guarantee Box */}
                  <div className="rounded-xl border border-green-tint bg-green-tint/60 p-3.5 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-green">
                      <span>🛡️</span>
                      <span>Ustaad SafePay Protection</span>
                    </div>
                    <p className="text-slate leading-relaxed">
                      Your tuition fee is securely retained by Ustaad.com until your lesson takes place. 100% money-back guarantee if a class is missed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Callouts */}
              <div className="rounded-2xl border border-hairline bg-white p-5 text-xs text-slate space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-ochre font-bold">✓</span>
                  <span>Free session rescheduling with 6 hours notice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ochre font-bold">✓</span>
                  <span>100% verified academic degrees & marksheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ochre font-bold">✓</span>
                  <span>Zero hidden platform surcharge for students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Booking & Escrow Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-hairline bg-white p-7 shadow-2xl text-ink">
            <button
              onClick={resetModal}
              className="absolute right-4 top-4 text-slate hover:text-ink text-sm font-bold"
            >
              ✕
            </button>

            {!bookingSuccess ? (
              <form onSubmit={handleBookingConfirm} className="space-y-4">
                <div className="border-b border-hairline pb-3">
                  <span className="rounded bg-ochre-tint px-2 py-0.5 text-[10px] font-bold text-ochre">
                    Step 1 of 2: Schedule Session
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-ink">
                    Book &ldquo;{activePackage.title}&rdquo;
                  </h3>
                  <p className="text-xs text-slate">
                    Mentor: {gig.ustaad.name} · {activePackage.name} Tier
                  </p>
                </div>

                {/* Slot Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate mb-1.5">
                    Select First Class Time Slot
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2.5 text-xs text-ink font-semibold focus:border-navy focus:bg-white focus:outline-none"
                  >
                    <option>Today at 5:00 PM</option>
                    <option>Tomorrow at 11:00 AM</option>
                    <option>Tomorrow at 5:00 PM</option>
                    <option>Day after Tomorrow at 4:00 PM</option>
                    <option>Saturday at 3:00 PM</option>
                    <option>Sunday at 6:00 PM</option>
                  </select>
                </div>

                {/* Classroom Type */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate mb-1.5">
                    Classroom Format
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2.5 text-xs text-ink font-semibold focus:border-navy focus:bg-white focus:outline-none"
                  >
                    <option>Google Meet (Virtual Whiteboard)</option>
                    <option>Zoom Classroom (Screen Share)</option>
                    <option>In-Person (Tutor Campus / Student Home)</option>
                  </select>
                </div>

                {/* Learning Focus */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate mb-1.5">
                    Specific Learning Goal or Past Paper Year (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    placeholder="e.g. Please help me review kinematics graphs and CIE 2023 Paper 2..."
                    className="w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-xs text-ink placeholder-slate/50 focus:border-navy focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Fee Breakdown */}
                <div className="rounded-xl border border-hairline bg-paper p-4 text-xs space-y-2">
                  <div className="flex justify-between text-slate">
                    <span>Program Tuition:</span>
                    <span className="font-semibold text-ink">Rs. {activePackage.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate">
                    <span>Escrow Custody Fee:</span>
                    <span className="text-green font-bold">Free (0%)</span>
                  </div>
                  <div className="border-t border-hairline pt-2 flex justify-between font-extrabold text-ink text-sm">
                    <span>Total Deposit:</span>
                    <span className="text-navy">Rs. {activePackage.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-navy py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                >
                  Confirm & Place Deposit in Escrow
                </button>
              </form>
            ) : (
              /* Success State */
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-tint text-2xl text-green font-black">
                  ✓
                </div>
                <h3 className="text-xl font-extrabold text-ink">Session Confirmed & Reserved!</h3>
                <p className="text-xs text-slate max-w-sm mx-auto leading-relaxed">
                  Your class with <strong className="text-ink">{gig.ustaad.name}</strong> is scheduled for <strong className="text-navy">{selectedDate}</strong> via {selectedPlatform}.
                </p>
                <div className="rounded-xl border border-hairline bg-paper p-3 text-xs text-slate space-y-1">
                  <p>Escrow Reference: <strong className="text-ink">UST-{Math.floor(100000 + Math.random() * 900000)}</strong></p>
                  <p className="text-[11px] text-green font-bold">🛡️ Funds placed safely in Escrow until session completion.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetModal}
                    className="flex-1 rounded-lg border border-hairline bg-white py-2.5 text-xs font-bold text-slate hover:text-ink"
                  >
                    Done
                  </button>
                  <Link
                    href="/student-dashboard/orders"
                    className="flex-1 rounded-lg bg-navy py-2.5 text-center text-xs font-bold text-white hover:opacity-90"
                  >
                    View in Orders →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
