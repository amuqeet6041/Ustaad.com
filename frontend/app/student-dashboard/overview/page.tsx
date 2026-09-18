"use client";

import { useAuth } from "@/hooks/useAuth";
import WelcomeCard from "@/components/student/WelcomeCard";
import StudentStats from "@/components/student/StudentStats";
import QuickActions from "@/components/student/QuickActions";
import ClassroomPreview from "@/components/student/ClassroomPreview";
import UpcomingSessions from "@/components/student/UpcomingSessions";
import RecentActivity from "@/components/student/RecentActivity";

export default function StudentOverviewPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B5651D] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <WelcomeCard user={user} />
      <StudentStats />
      <QuickActions />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ClassroomPreview />
          <UpcomingSessions />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}