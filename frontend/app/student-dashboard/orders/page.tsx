"use client";

import { useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  tutorName: string;
  tutorTitle: string;
  tutorInitials: string;
  subject: string;
  planTitle: string;
  tier: "Diagnostic" | "Unit Mastery" | "Exam Sprint";
  price: number;
  scheduledTime: string;
  platform: string;
  meetingLink: string;
  status: "upcoming" | "completed" | "cancelled";
  escrowStatus: "Held in Escrow" | "Released to Tutor" | "Refunded";
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "UST-849201",
    tutorName: "Dr. Ahmed Khan",
    tutorTitle: "Senior Cambridge O/A-Level Mathematics & Physics Specialist",
    tutorInitials: "AK",
    subject: "Physics",
    planTitle: "Concept Diagnostic & 1 Topic Focus",
    tier: "Diagnostic",
    price: 2000,
    scheduledTime: "Tomorrow at 5:00 PM PKT",
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/ust-phys-849",
    status: "upcoming",
    escrowStatus: "Held in Escrow",
  },
  {
    id: "ord-2",
    orderNumber: "UST-631092",
    tutorName: "Sara Ahmed",
    tutorTitle: "Certified IELTS Master Coach (Band 8.5)",
    tutorInitials: "SA",
    subject: "IELTS & English",
    planTitle: "1 Mock Speaking Interview + 1 Essay Evaluation",
    tier: "Diagnostic",
    price: 1800,
    scheduledTime: "Completed 3 days ago",
    platform: "Zoom Video Room",
    meetingLink: "",
    status: "completed",
    escrowStatus: "Released to Tutor",
  },
];

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [releasedToast, setReleasedToast] = useState<string | null>(null);

  const handleReleaseEscrow = (orderId: string, tutorName: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "completed", escrowStatus: "Released to Tutor" }
          : o
      )
    );
    setReleasedToast(`Session marked complete! Funds released to ${tutorName}.`);
    setTimeout(() => setReleasedToast(null), 5000);
  };

  const displayedOrders = orders.filter((o) => {
    if (filter === "upcoming") return o.status === "upcoming";
    if (filter === "completed") return o.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-paper p-6 sm:p-10 text-ink">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ochre">
              <Link href="/student-dashboard/overview" className="hover:underline">Dashboard</Link>
              <span>/</span>
              <span>My Classes</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-ink">
              My Booked Sessions & Orders
            </h1>
            <p className="mt-1 text-sm text-slate">
              Track your upcoming 1-on-1 classes, access virtual whiteboards, and manage escrow releases.
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
          >
            + Browse More Ustaads
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "upcoming", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition ${
                filter === tab
                  ? "bg-navy text-white shadow-xs"
                  : "bg-white border border-hairline text-slate hover:text-ink"
              }`}
            >
              {tab} ({orders.filter((o) => (tab === "all" ? true : o.status === tab)).length})
            </button>
          ))}
        </div>

        {/* Toast Alert */}
        {releasedToast && (
          <div className="rounded-xl border border-green-tint bg-green-tint p-4 text-xs font-bold text-green flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>{releasedToast}</span>
            </div>
            <button onClick={() => setReleasedToast(null)} className="text-slate hover:text-ink">✕</button>
          </div>
        )}

        {/* Orders List */}
        {displayedOrders.length > 0 ? (
          <div className="space-y-4">
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-hairline bg-white p-6 shadow-sm transition hover:border-navy/20"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
                  {/* Tutor Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-extrabold text-white">
                      {order.tutorInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-ink">{order.tutorName}</h3>
                        <span className="rounded bg-paper px-2 py-0.5 text-[11px] font-bold text-navy border border-hairline">
                          {order.subject}
                        </span>
                      </div>
                      <p className="text-xs text-slate">{order.planTitle}</p>
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate">Order #{order.orderNumber}</p>
                      <p className="text-sm font-black text-navy">Rs. {order.price.toLocaleString()}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === "upcoming"
                          ? "bg-ochre-tint text-ochre"
                          : "bg-green-tint text-green"
                      }`}
                    >
                      {order.status === "upcoming" ? "Scheduled" : "Completed"}
                    </span>
                  </div>
                </div>

                {/* Session Details Row */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 text-xs text-slate">
                    <p className="flex items-center gap-1.5 font-medium text-ink">
                      <span>📅</span>
                      <span>Scheduled: <strong className="text-navy">{order.scheduledTime}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span>💻</span>
                      <span>Platform: {order.platform}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>Escrow Custody: <strong className="text-green font-semibold">{order.escrowStatus}</strong></span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {order.status === "upcoming" && (
                      <>
                        <a
                          href={order.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition"
                        >
                          Launch Virtual Class →
                        </a>

                        <button
                          onClick={() => handleReleaseEscrow(order.id, order.tutorName)}
                          className="rounded-xl border border-green px-4 py-2.5 text-xs font-bold text-green hover:bg-green-tint transition"
                        >
                          Mark Completed & Release Fee
                        </button>
                      </>
                    )}

                    {order.status === "completed" && (
                      <Link
                        href={`/gigs/gig-1`}
                        className="rounded-xl border border-hairline bg-paper px-4 py-2.5 text-xs font-bold text-navy hover:bg-white transition"
                      >
                        Book Another Session
                      </Link>
                    )}

                    <Link
                      href={`/student-dashboard/messages`}
                      className="rounded-xl border border-hairline bg-paper px-3.5 py-2.5 text-xs font-bold text-slate hover:text-ink transition"
                    >
                      💬 Message
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-hairline bg-white p-12 text-center">
            <p className="text-sm font-bold text-slate">No sessions in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
