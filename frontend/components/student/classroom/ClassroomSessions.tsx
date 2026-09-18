"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ClassroomSession, SessionStatus } from "../classroom";
import EmptyState from "../EmptyState";
import { CalendarIcon, ClockIcon, VideoIcon } from "../icons";

const STATUS_STYLES: Record<SessionStatus, string> = {
  scheduled: "bg-[#B5651D]/15 text-[#D18A4A] ring-[#B5651D]/30",
  completed: "bg-[#3A5A40]/20 text-[#9CC5A8] ring-[#3A5A40]/40",
  cancelled: "bg-white/[0.06] text-white/55 ring-white/10",
};

const STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ClassroomSessionsProps {
  classroomId: string;
}

export default function ClassroomSessions({ classroomId }: ClassroomSessionsProps) {
  const [sessions, setSessions] = useState<ClassroomSession[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<ClassroomSession[]>(
        `/sessions/classroom/${classroomId}`
      );
      setSessions(data);
    } catch {
      setSessions(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <VideoIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Sessions</h2>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B5651D] border-t-transparent" />
          <p className="text-sm font-semibold text-white/55">Loading sessions...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center px-4 py-12 text-center">
          <p className="text-base font-bold text-white">Unable to load sessions</p>
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

      {!loading && !error && sessions !== null && sessions.length === 0 && (
        <EmptyState
          icon={<VideoIcon className="h-7 w-7" />}
          title="No sessions scheduled"
          description="Your scheduled learning sessions will appear here."
        />
      )}

      {!loading && !error && sessions !== null && sessions.length > 0 && (
        <div className="space-y-4 p-4 sm:p-5">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="min-w-0 break-words text-base font-bold text-white">
                      {session.title}
                    </h3>
                    <SessionStatusBadge status={session.status} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      {session.session_type === "online" ? "Online" : "In Person"}
                    </span>
                  </div>

                  {session.description && (
                    <p className="mt-2 break-words text-sm leading-relaxed text-white/55">
                      {session.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 shrink-0 text-[#D18A4A]" />
                      {formatDate(session.scheduled_start)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon className="h-4 w-4 shrink-0 text-[#D18A4A]" />
                      {formatTime(session.scheduled_start)} – {formatTime(session.scheduled_end)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {session.status !== "scheduled" ? (
                    <span
                      aria-disabled="true"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-semibold text-white/35"
                    >
                      <VideoIcon className="h-4 w-4" />
                      {session.status === "completed" ? "Session completed" : "Session cancelled"}
                    </span>
                  ) : session.session_type === "in_person" ? (
                    <span
                      aria-disabled="true"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-semibold text-white/35"
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      In Person
                    </span>
                  ) : session.meeting_url ? (
                    <a
                      href={session.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#B5651D] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#B5651D]/20 transition hover:-translate-y-0.5 hover:bg-[#9E581C]"
                    >
                      <VideoIcon className="h-4 w-4" />
                      Join Session
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-semibold text-white/35"
                    >
                      <VideoIcon className="h-4 w-4" />
                      Meeting link not available
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}