"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { ApiError } from "@/lib/api";
import { clearAuth, getUser } from "@/lib/auth";
import { getGigById } from "@/services/gigService";
import { createEnrollment } from "@/services/enrollmentService";
import type { Gig, GigPackage } from "@/services/gigService";
import {
  formatCategory,
  formatPrice,
  formatTeachingMode,
  formatTier,
  getInitials,
} from "@/lib/marketplaceFormatters";

type LoadState = "loading" | "notfound" | "error" | "success";

export default function GigDetailPage() {
  const params = useParams();
  const gigId = params?.id as string;

  const [gig, setGig] = useState<Gig | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let cancelled = false;
    if (!gigId) {
      setLoadState("notfound");
      return;
    }
    setLoadState("loading");
    getGigById(gigId)
      .then((data) => {
        if (cancelled) return;
        setGig(data);
        setSelectedPackageId(data.packages[0]?.id ?? "");
        setOpenFaq(0);
        setLoadState("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const is404 = err instanceof ApiError && err.status === 404;
        setLoadState(is404 ? "notfound" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [gigId]);

  const activePackage: GigPackage | null = useMemo(() => {
    if (!gig) return null;
    return (
      gig.packages.find((p) => p.id === selectedPackageId) ??
      gig.packages[0] ??
      null
    );
  }, [gig, selectedPackageId]);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 flex-1">
        {loadState === "loading" && (
          <div className="space-y-6">
            <div className="h-4 w-40 animate-pulse rounded bg-hairline" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-hairline" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-hairline" />
            <div className="grid grid-cols-1 gap-10 pt-4 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-5">
                <div className="h-44 animate-pulse rounded-2xl bg-white" />
                <div className="h-24 animate-pulse rounded-2xl bg-white" />
                <div className="h-24 animate-pulse rounded-2xl bg-white" />
              </div>
              <div className="lg:col-span-5">
                <div className="h-96 animate-pulse rounded-2xl bg-white" />
              </div>
            </div>
          </div>
        )}

        {loadState === "notfound" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-white p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-2xl text-slate">
              🔍
            </div>
            <h1 className="mt-4 text-xl font-bold text-ink">Gig not found</h1>
            <p className="mt-1.5 max-w-sm text-sm text-slate">
              This learning program does not exist or is no longer publicly
              available.
            </p>
            <Link
              href="/browse"
              className="mt-6 rounded-xl bg-navy px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Browse marketplace
            </Link>
          </div>
        )}

        {loadState === "error" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-white p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper text-2xl text-slate">
              ⚠️
            </div>
            <h1 className="mt-4 text-xl font-bold text-ink">
              Unable to load this program.
            </h1>
            <p className="mt-1.5 max-w-sm text-sm text-slate">
              Please try again.
            </p>
            <Link
              href="/browse"
              className="mt-6 rounded-xl bg-navy px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Back to marketplace
            </Link>
          </div>
        )}

        {loadState === "success" && gig && (
          <GigDetailBody
            gig={gig}
            activePackage={activePackage}
            selectedPackageId={selectedPackageId}
            onSelectPackage={setSelectedPackageId}
            openFaq={openFaq}
            onToggleFaq={setOpenFaq}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

interface DetailBodyProps {
  gig: Gig;
  activePackage: GigPackage | null;
  selectedPackageId: string;
  onSelectPackage: (id: string) => void;
  openFaq: number | null;
  onToggleFaq: (idx: number | null) => void;
}

function GigDetailBody({
  gig,
  activePackage,
  selectedPackageId,
  onSelectPackage,
  openFaq,
  onToggleFaq,
}: DetailBodyProps) {
  const teacher = gig.teacher;
  const category = formatCategory(gig.category);
  const hasPackages = gig.packages.length > 0;
  const tabCount = Math.min(gig.packages.length, 3);

  const retryQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (gig.subject) params.set("category", gig.category ?? "");
    return params.toString();
  }, [gig]);

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate">
        <Link href="/" className="hover:text-navy transition">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-navy transition">Marketplace</Link>
        {gig.category && (
          <>
            <span>/</span>
            <Link
              href={`/browse${retryQuery ? `?${retryQuery}` : ""}`}
              className="hover:text-navy transition"
            >
              {category}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink font-semibold truncate max-w-xs">
          {gig.subject || "Learning Program"}
        </span>
      </nav>

      {/* Top Header: Title & Teacher Summary */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl leading-snug">
          {gig.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          {teacher && (
            <span className="flex items-center gap-2.5 rounded-full border border-hairline bg-white py-1 pl-1 pr-3 shadow-2xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#14213D] to-[#1E3A8A] text-xs font-bold text-white">
                {getInitials(teacher.name)}
              </span>
              <span className="font-bold text-ink">{teacher.name}</span>
            </span>
          )}

          {gig.category && (
            <span className="rounded-full bg-ochre-tint px-2.5 py-1 text-[11px] font-bold text-ochre">
              {category}
            </span>
          )}

          {gig.subject && (
            <span className="rounded-full bg-paper border border-hairline px-2.5 py-1 text-[11px] font-bold text-ink">
              {gig.subject}
            </span>
          )}

          {gig.city && (
            <span className="text-slate font-medium">📍 {gig.city}</span>
          )}

          {teacher?.teaching_mode && (
            <span className="text-slate font-medium">
              · {formatTeachingMode(teacher.teaching_mode)}
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT COLUMN: Content, Syllabus, Teacher, FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          {/* Editorial Highlight Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white p-7 shadow-xs">
            <div className="flex items-center flex-wrap gap-2 justify-between">
              <span className="rounded-md bg-navy px-3 py-1 text-xs font-bold text-white">
                {category} · {gig.subject || "Tutoring"}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 text-xs text-slate">
              {gig.city && (
                <span className="rounded-md bg-paper px-3 py-1.5 border border-hairline font-medium text-ink">
                  📍 {gig.city}
                </span>
              )}
              {teacher?.teaching_mode && (
                <span className="rounded-md bg-paper px-3 py-1.5 border border-hairline font-medium text-ink">
                  🎓 {formatTeachingMode(teacher.teaching_mode)}
                </span>
              )}
              {teacher?.education && (
                <span className="rounded-md bg-paper px-3 py-1.5 border border-hairline font-medium text-ink">
                  🎓 {teacher.education.split("·")[0].trim()}
                </span>
              )}
            </div>
          </div>

          {/* Program Overview */}
          {gig.overview && (
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>📖</span> Program Overview
              </h2>
              <p className="text-sm leading-relaxed text-slate sm:text-base">
                {gig.overview}
              </p>
            </section>
          )}

          {/* What You Will Gain */}
          {gig.learning_outcomes && gig.learning_outcomes.length > 0 && (
            <section className="rounded-2xl border border-hairline bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                <span>🎯</span> What You Will Learn
              </h2>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {gig.learning_outcomes.map((outcome, idx) => (
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
          )}

          {/* Curriculum Breakdown */}
          {gig.syllabus && gig.syllabus.length > 0 && (
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
                      <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-xs text-slate pl-10 leading-relaxed font-normal">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prerequisites */}
          {gig.prerequisites && gig.prerequisites.length > 0 && (
            <section className="rounded-2xl border border-hairline bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>🎒</span> Recommended Before You Start
              </h2>
              <ul className="space-y-2.5">
                {gig.prerequisites.map((prereq, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink/80 font-medium">
                    <span className="mt-0.5 text-ochre font-bold">•</span>
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Compare Mentorship Plans */}
          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
              <span>📊</span> Compare Mentorship Plans
            </h2>
            {hasPackages ? (
              <div className="overflow-x-auto rounded-2xl border border-hairline bg-white shadow-xs">
                <table className="w-full text-left text-xs text-ink">
                  <thead className="border-b border-hairline bg-paper text-[11px] uppercase tracking-wider text-slate">
                    <tr>
                      <th className="p-4">Plan</th>
                      {gig.packages.map((p) => (
                        <th key={p.id} className="p-4 text-center font-bold text-navy">
                          {formatTier(p.tier)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    <tr>
                      <td className="p-4 font-bold text-ink">Plan Title</td>
                      {gig.packages.map((p) => (
                        <td key={p.id} className="p-4 text-center font-semibold">
                          {p.title}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-ink">Tuition Fee</td>
                      {gig.packages.map((p) => (
                        <td key={p.id} className="p-4 text-center font-black text-navy text-sm">
                          {formatPrice(p.price) ?? "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Total Duration</td>
                      {gig.packages.map((p) => (
                        <td key={p.id} className="p-4 text-center font-semibold">
                          {p.duration_minutes != null ? `${p.duration_minutes} mins` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">1-on-1 Sessions</td>
                      {gig.packages.map((p) => (
                        <td key={p.id} className="p-4 text-center font-semibold">
                          {p.sessions_count != null
                            ? `${p.sessions_count} ${p.sessions_count === 1 ? "Session" : "Sessions"}`
                            : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Delivery Timeline</td>
                      {gig.packages.map((p) => (
                        <td key={p.id} className="p-4 text-center font-semibold">
                          {p.delivery_days != null ? `${p.delivery_days}-day plan` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Includes</td>
                      {gig.packages.map((p) => (
                        <td key={p.id} className="p-4 align-top">
                          <div className="space-y-1.5">
                            {p.features && p.features.length > 0 ? (
                              p.features.map((feat, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-slate text-[11px] text-left">
                                  <span className="text-green font-bold">✓</span>
                                  <span>{feat}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate/50">—</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium text-slate">Select</td>
                      {gig.packages.map((p) => (
                        <td key={p.id} className="p-4 text-center">
                          <button
                            onClick={() => onSelectPackage(p.id)}
                            className={`rounded-lg px-3 py-1.5 font-bold transition ${
                              selectedPackageId === p.id
                                ? "bg-navy text-white shadow-xs"
                                : "border border-navy text-navy hover:bg-navy hover:text-white"
                            }`}
                          >
                            View
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-hairline bg-white p-10 text-center">
                <p className="text-sm text-slate">Packages are currently unavailable.</p>
              </div>
            )}
          </section>

          {/* Meet Your Ustaad Section */}
          {teacher && (
            <section className="rounded-2xl border border-hairline bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
                <span>👨‍🏫</span> Meet Your Ustaad
              </h2>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14213D] to-[#1E3A8A] text-xl font-extrabold text-white shadow-md">
                  {getInitials(teacher.name)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink">{teacher.name}</h3>
                  {teacher.education && (
                    <p className="text-xs text-ochre font-semibold">
                      🎓 {teacher.education}
                    </p>
                  )}
                </div>
              </div>

              {teacher.bio && (
                <p className="text-xs sm:text-sm text-slate leading-relaxed pt-2 font-normal">
                  {teacher.bio}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4 text-xs">
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Location</p>
                  <p className="font-bold text-ink mt-0.5">{teacher.city || "—"}</p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Languages</p>
                  <p className="font-bold text-ink mt-0.5">
                    {teacher.languages && teacher.languages.length > 0
                      ? teacher.languages.join(", ")
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Teaching Mode</p>
                  <p className="font-bold text-ink mt-0.5">
                    {formatTeachingMode(teacher.teaching_mode)}
                  </p>
                </div>
                <div className="rounded-xl border border-hairline bg-paper p-3 text-center">
                  <p className="text-slate text-[11px]">Hourly Rate</p>
                  <p className="font-bold text-ink mt-0.5">
                    {formatPrice(teacher.hourly_rate) ?? "—"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* FAQ Accordion */}
          {gig.faqs && gig.faqs.length > 0 && (
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
                      onClick={() => onToggleFaq(openFaq === idx ? null : idx)}
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
          )}
        </div>

        {/* RIGHT COLUMN: Enrollment Box (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">
            {/* Enrollment Card */}
            <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-xl">
              {hasPackages ? (
                <>
                  {/* Package Selector Tabs */}
                  <div
                    className="grid border-b border-hairline text-center text-xs font-bold"
                    style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}
                  >
                    {gig.packages.slice(0, tabCount).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSelectPackage(p.id)}
                        className={`py-3.5 transition ${
                          selectedPackageId === p.id
                            ? "border-b-2 border-navy bg-paper text-navy"
                            : "text-slate hover:text-ink hover:bg-paper/50"
                        }`}
                      >
                        {formatTier(p.tier)}
                      </button>
                    ))}
                  </div>

                  {/* Selected Package Details */}
                  {activePackage && (
                    <div className="p-6 space-y-5">
                      {/* Price Row */}
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate">
                          {activePackage.name} Mentorship Plan
                        </span>
                        <span className="text-3xl font-black text-navy">
                          {formatPrice(activePackage.price) ?? "Price on request"}
                        </span>
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-sm font-bold text-ink">{activePackage.title}</h3>
                        {activePackage.description && (
                          <p className="mt-1.5 text-xs text-slate leading-relaxed">
                            {activePackage.description}
                          </p>
                        )}
                      </div>

                      {/* Duration & Delivery Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate border-y border-hairline py-3">
                        {activePackage.duration_minutes != null && (
                          <div className="flex items-center gap-1.5">
                            <span>⏱️</span>
                            <span>{activePackage.duration_minutes} mins total</span>
                          </div>
                        )}
                        {activePackage.sessions_count != null && (
                          <div className="flex items-center gap-1.5">
                            <span>📅</span>
                            <span>
                              {activePackage.sessions_count}{" "}
                              {activePackage.sessions_count === 1 ? "Session" : "Sessions"}
                            </span>
                          </div>
                        )}
                        {activePackage.delivery_days != null && (
                          <div className="flex items-center gap-1.5">
                            <span>🚀</span>
                            <span>{activePackage.delivery_days}d plan</span>
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      {activePackage.features && activePackage.features.length > 0 && (
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
                      )}

                      {/* Primary CTA — real enrollment flow */}
                      <EnrollButton
                        gigId={gig.id}
                        packageId={activePackage?.id ?? null}
                        hasPackages
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 space-y-5">
                  <p className="text-sm text-slate">
                    Packages are currently unavailable.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-xl bg-navy/40 py-3.5 text-center text-sm font-bold text-white"
                    title="Packages are currently unavailable"
                  >
                    No packages available
                  </button>
                </div>
              )}
            </div>

            {/* Trust Callouts */}
            <div className="rounded-2xl border border-hairline bg-white p-5 text-xs text-slate space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-ochre font-bold">✓</span>
                <span>Transparent, no-surprise pricing on every plan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ochre font-bold">✓</span>
                <span>Enrolling instantly creates your classroom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type EnrollState = "idle" | "loading" | "success";

interface EnrollButtonProps {
  gigId: string;
  packageId: string | null;
  hasPackages: boolean;
}

function EnrollButton({ gigId, packageId, hasPackages }: EnrollButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<EnrollState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = useCallback(async () => {
    setError(null);

    const user = getUser();
    if (!user) {
      router.push("/login/student");
      return;
    }
    if (user.role !== "student") {
      setError(
        "Only student accounts can enroll in learning programs. Sign in with a student account."
      );
      return;
    }

    setState("loading");
    try {
      const enrollment = await createEnrollment({
        gig_id: gigId,
        package_id: packageId,
      });
      setState("success");
      if (enrollment.classroom_id) {
        // Short confirmation pause, then the student lands in their classroom.
        window.setTimeout(() => {
          router.push(`/student-dashboard/classrooms/${enrollment.classroom_id}`);
        }, 1200);
      }
    } catch (err) {
      setState("idle");
      if (err instanceof ApiError) {
        switch (err.status) {
          case 401:
            clearAuth();
            router.push("/login/student");
            return;
          case 403:
            setError("Only student accounts can enroll in learning programs.");
            return;
          case 404:
            setError(
              "This program or package is no longer available for enrollment."
            );
            return;
          case 409:
            setError(
              "You are already enrolled in this program. Your classroom is ready."
            );
            return;
          case 500:
            setError("Something went wrong while enrolling. Please try again.");
            return;
          default:
            setError("Enrollment could not be completed. Please try again.");
        }
      } else {
        setError("Enrollment could not be completed. Please try again.");
      }
    }
  }, [gigId, packageId, router]);

  if (state === "success") {
    return (
      <div className="rounded-xl bg-green-tint px-4 py-3.5 text-center text-sm font-bold text-green">
        Enrollment confirmed — opening your classroom…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleEnroll}
        disabled={state === "loading" || !hasPackages}
        className="w-full rounded-xl bg-ochre py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {state === "loading" ? "Enrolling…" : "Enroll Now"}
      </button>

      {error && (
        <div className="rounded-lg border border-error-border bg-error-tint px-3 py-2.5 text-xs font-semibold text-error-text">
          {error}
        </div>
      )}

      {!hasPackages && (
        <p className="text-xs text-slate">
          Enrollment requires an available package.
        </p>
      )}
    </div>
  );
}