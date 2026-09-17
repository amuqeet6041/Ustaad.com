"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login/teacher");
      return;
    }
    if (user.role !== "teacher") {
      router.replace(user.role === "student" ? "/student-dashboard/overview" : "/login/teacher");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060D18]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B5651D] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "teacher") return null;

  return <>{children}</>;
}
