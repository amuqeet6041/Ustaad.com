"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login/student");
      return;
    }
    if (user.role !== "student") {
      router.replace(user.role === "teacher" ? "/teacher-dashboard/overview" : "/login/student");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060D18]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B5651D] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "student") return null;

  const handleLogout = () => {
    logout();
    router.push("/login/student");
  };

  return (
    <div className="relative min-h-screen bg-[#0D172B] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#B5651D]/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-[#14213D] blur-[110px]" />
        <div className="absolute -bottom-60 left-1/3 h-[450px] w-[450px] rounded-full bg-[#B5651D]/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <StudentSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="relative flex min-h-screen flex-col lg:pl-72">
        <StudentHeader user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}