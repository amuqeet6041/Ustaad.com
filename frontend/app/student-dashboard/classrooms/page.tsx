"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import ClassroomCard from "@/components/student/ClassroomCard";
import ClassroomHeader from "@/components/student/ClassroomHeader";
import EmptyState from "@/components/student/EmptyState";
import { Classroom } from "@/components/student/classroom";
import { CalendarIcon, CheckIcon, CompassIcon, GraduationCapIcon } from "@/components/student/icons";

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<Classroom[]>("/classrooms");
      setClassrooms(data);
    } catch {
      setClassrooms(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount =
    classrooms?.filter((c) => c.status === "active").length ?? null;
  const completedCount =
    classrooms?.filter((c) => c.status === "completed").length ?? null;

  const stats = [
    { label: "Active Classrooms", value: activeCount, icon: GraduationCapIcon },
    { label: "Completed", value: completedCount, icon: CheckIcon },
    // Upcoming sessions need a global session endpoint that does not exist yet
    // (Step 7 scope is per-classroom sessions). We deliberately show null rather
    // than fabricating a number.
    { label: "Upcoming Sessions", value: null, icon: CalendarIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <ClassroomHeader
        eyebrow="Student Classroom"
        title="My Classrooms"
        subtitle="Manage your learning spaces and stay connected with your Ustaads."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-[#D18A4A] ring-1 ring-white/10 transition group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/45">
                {stat.label}
              </p>
              <p
                className={`mt-1 text-2xl font-extrabold tracking-tight ${
                  stat.value === null ? "text-white/30" : "text-white"
                }`}
              >
                {stat.value === null ? "—" : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <GraduationCapIcon className="h-5 w-5 text-[#D18A4A]" />
          <h2 className="text-base font-bold text-white">Your Classrooms</h2>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B5651D] border-t-transparent" />
            <p className="text-sm font-semibold text-white/55">Loading classrooms...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <p className="text-base font-bold text-white">Unable to load classrooms</p>
            <p className="mt-1.5 text-sm text-white/50">Please try again in a moment.</p>
            <button
              type="button"
              onClick={load}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#B5651D] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#B5651D]/20 transition hover:-translate-y-0.5 hover:bg-[#9E581C]"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && classrooms !== null && classrooms.length === 0 && (
          <EmptyState
            icon={<GraduationCapIcon className="h-7 w-7" />}
            title="No classrooms yet"
            description="Once you enroll with a Ustaad, your classroom will appear here."
          >
            <Link
              href="/browse"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#B5651D] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#B5651D]/20 transition hover:-translate-y-0.5 hover:bg-[#9E581C]"
            >
              <CompassIcon className="h-4 w-4" />
              Find an Ustaad
            </Link>
          </EmptyState>
        )}

        {!loading && !error && classrooms !== null && classrooms.length > 0 && (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {classrooms.map((classroom) => (
              <ClassroomCard key={classroom.id} classroom={classroom} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}