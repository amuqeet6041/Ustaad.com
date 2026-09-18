"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { clearAuth } from "@/lib/auth";
import { ArrowLeftIcon, GraduationCapIcon } from "@/components/student/icons";
import { Classroom, ClassroomTabId } from "@/components/student/classroom";
import ClassroomStatusBadge from "@/components/student/ClassroomStatusBadge";
import ClassroomTabs from "@/components/student/ClassroomTabs";
import ClassroomOverview from "@/components/student/classroom/ClassroomOverview";
import ClassroomSessions from "@/components/student/classroom/ClassroomSessions";
import ClassroomChat from "@/components/student/classroom/ClassroomChat";
import ClassroomTasks from "@/components/student/classroom/ClassroomTasks";
import ClassroomNotes from "@/components/student/classroom/ClassroomNotes";
import ClassroomProgress from "@/components/student/classroom/ClassroomProgress";
import ClassroomActivity from "@/components/student/classroom/ClassroomActivity";

type DetailError = "not_found" | "forbidden" | "other";

export default function ClassroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? "";

  const [activeTab, setActiveTab] = useState<ClassroomTabId>("overview");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DetailError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Classroom>(`/classrooms/${id}`);
      setClassroom(data);
    } catch (err) {
      setClassroom(null);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          clearAuth();
          router.replace("/login/student");
          return;
        }
        if (err.status === 404) {
          setError("not_found");
          return;
        }
        if (err.status === 403) {
          setError("forbidden");
          return;
        }
      }
      setError("other");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <ClassroomOverview classroom={classroom ?? undefined} />;
      case "sessions":
        return <ClassroomSessions classroomId={id} />;
      case "chat":
        return <ClassroomChat />;
      case "tasks":
        return <ClassroomTasks />;
      case "notes":
        return <ClassroomNotes />;
      case "progress":
        return <ClassroomProgress />;
      case "activity":
        return <ClassroomActivity />;
      default:
        return <ClassroomOverview classroom={classroom ?? undefined} />;
    }
  };

  if (error) {
    const messages: Record<DetailError, { title: string; description: string }> = {
      not_found: {
        title: "Classroom not found",
        description: "This classroom does not exist or is no longer available.",
      },
      forbidden: {
        title: "You do not have access to this classroom.",
        description: "This classroom belongs to a different student account.",
      },
      other: {
        title: "Unable to load classroom",
        description: "Please try again in a moment.",
      },
    };
    const message = messages[error];
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Link
          href="/student-dashboard/classrooms"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Classrooms
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-16 text-center">
          <p className="text-base font-bold text-white">{message.title}</p>
          <p className="mt-1.5 text-sm text-white/50">{message.description}</p>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#B5651D] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#B5651D]/20 transition hover:-translate-y-0.5 hover:bg-[#9E581C]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        href="/student-dashboard/classrooms"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Classrooms
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D18A4A]">
            Student Classroom
          </p>
          <h1 className="mt-1.5 truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {classroom?.title ?? "Classroom"}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <GraduationCapIcon className="h-4 w-4 shrink-0 text-[#D18A4A]" />
            <span className="truncate">
              {classroom?.teacher?.full_name ?? "Your Ustaad"}
            </span>
          </div>
        </div>
        {loading ? (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-white/40">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#B5651D] border-t-transparent" />
          </span>
        ) : (
          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-white/40">
              #{id.slice(0, 8)}
            </span>
            {classroom && <ClassroomStatusBadge status={classroom.status} />}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B5651D] border-t-transparent" />
          <p className="text-sm font-semibold text-white/55">Loading classroom...</p>
        </div>
      ) : (
        classroom && (
          <>
            <ClassroomTabs active={activeTab} onChange={setActiveTab} />
            {renderTab()}
          </>
        )
      )}
    </div>
  );
}