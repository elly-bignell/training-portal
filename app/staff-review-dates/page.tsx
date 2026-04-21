// app/staff-review-dates/page.tsx

"use client";

import React from "react";
import Link from "next/link";
import { trainees } from "@/data/trainees";
import PasswordGate from "@/components/PasswordGate";

// ─── Recruits to show on this page (display order) ───
const RECRUIT_SLUGS: { slug: string; displayName: string }[] = [
  { slug: "cindy-rose-rondez-manrique", displayName: "Cindy Rose Rondez Manrique" },
  { slug: "krishna-patel",              displayName: "Krishna Patel" },
  { slug: "sydney-arnold",              displayName: "Sydney Arnold" },
  { slug: "riley-kerrison",             displayName: "Riley Kerrison" },
  { slug: "emma-ward",                  displayName: "Emma Ward" },
];

// ─── Review milestone definitions ───
const MILESTONES: { label: string; months: number }[] = [
  { label: "Month 1", months: 1 },
  { label: "Month 2", months: 2 },
  { label: "Month 4", months: 4 },
  { label: "Month 6", months: 6 },
];

// ─── Date helpers (UTC-based to avoid TZ drift on milestone math) ───
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addMonthsISO(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  return dt.toISOString().slice(0, 10);
}

function fmtLong(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtShort(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getTodayISO(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((parseISO(toISO).getTime() - parseISO(fromISO).getTime()) / 86400000);
}

// ─── Status classifications ───
type Status = "passed" | "thisWeek" | "upcoming" | "future";

function getStatus(milestoneISO: string, todayISO: string): Status {
  const days = daysBetween(todayISO, milestoneISO);
  if (days < 0) return "passed";
  if (days <= 7) return "thisWeek";
  if (days <= 30) return "upcoming";
  return "future";
}

interface StatusStyle {
  cellBg: string;
  accent: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dot: string;
  label: string;
}

function statusStyle(s: Status): StatusStyle {
  switch (s) {
    case "passed":
      return {
        cellBg: "bg-slate-50",
        accent: "border-slate-200",
        accentText: "text-slate-500",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-600",
        badgeBorder: "border-slate-200",
        dot: "bg-slate-300",
        label: "Passed",
      };
    case "thisWeek":
      return {
        cellBg: "bg-amber-50",
        accent: "border-amber-300",
        accentText: "text-amber-700",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-800",
        badgeBorder: "border-amber-300",
        dot: "bg-amber-500",
        label: "Due this week",
      };
    case "upcoming":
      return {
        cellBg: "bg-blue-50",
        accent: "border-blue-200",
        accentText: "text-blue-700",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-800",
        badgeBorder: "border-blue-200",
        dot: "bg-blue-500",
        label: "Upcoming",
      };
    case "future":
      return {
        cellBg: "bg-white",
        accent: "border-gray-200",
        accentText: "text-gray-500",
        badgeBg: "bg-gray-50",
        badgeText: "text-gray-600",
        badgeBorder: "border-gray-200",
        dot: "bg-gray-300",
        label: "Scheduled",
      };
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StaffReviewDatesContent() {
  const todayISO = getTodayISO();

  const rows = RECRUIT_SLUGS.map((r) => {
    const t = trainees.find((x) => x.slug === r.slug);
    return {
      slug: r.slug,
      name: r.displayName,
      startDate: t?.startDate || "",
    };
  });

  // Summary tally — how many milestones fall within the next 30 days?
  const upcomingSoon = rows.flatMap((row) => {
    if (!row.startDate) return [];
    return MILESTONES.map((m) => {
      const iso = addMonthsISO(row.startDate, m.months);
      const status = getStatus(iso, todayISO);
      return { slug: row.slug, name: row.name, label: m.label, iso, status };
    }).filter((m) => m.status === "thisWeek" || m.status === "upcoming");
  }).sort((a, b) => a.iso.localeCompare(b.iso));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-slate-700" aria-label="Back to home">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Staff Review Dates</h1>
            <p className="text-sm text-slate-500">
              Month 1, 2, 4 &amp; 6 review milestones for new recruits · Today: {fmtLong(todayISO)}
            </p>
          </div>
        </div>

        {/* Heads-up panel: milestones due in the next 30 days */}
        {upcomingSoon.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Next 30 days
              </span>
              <span className="text-xs text-slate-400">
                ({upcomingSoon.length} milestone{upcomingSoon.length !== 1 ? "s" : ""} due)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingSoon.map((m) => {
                const s = statusStyle(m.status);
                const days = daysBetween(todayISO, m.iso);
                return (
                  <div
                    key={`${m.slug}-${m.label}`}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${s.badgeBg} ${s.badgeText} ${s.badgeBorder}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
                    <span className="font-semibold">{m.name.split(" ")[0]}</span>
                    <span>· {m.label}</span>
                    <span className="opacity-70">· {fmtShort(m.iso)}</span>
                    <span className="opacity-70">· {days === 0 ? "today" : `in ${days}d`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 mb-6">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Passed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Due this week (≤7d)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Upcoming (≤30d)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span> Scheduled (&gt;30d)
          </span>
        </div>

        {/* Recruit cards */}
        <div className="space-y-4">
          {rows.map((row) => {
            if (!row.startDate) {
              return (
                <div key={row.slug} className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{row.name}:</span> no start date on file yet.
                </div>
              );
            }

            const startPassed = daysBetween(todayISO, row.startDate) < 0;
            const milestones = MILESTONES.map((m) => {
              const iso = addMonthsISO(row.startDate, m.months);
              const status = getStatus(iso, todayISO);
              const days = daysBetween(todayISO, iso);
              return { ...m, iso, status, days };
            });

            return (
              <div
                key={row.slug}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Recruit header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {initials(row.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {startPassed ? "Started" : "Starting"} {fmtLong(row.startDate)}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/admin/snapshot"
                    className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                  >
                    Trainee Summary →
                  </Link>
                </div>

                {/* Timeline grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                  {/* Start cell */}
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mb-2">
                      Start
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      {fmtLong(row.startDate)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {startPassed ? `${Math.abs(daysBetween(todayISO, row.startDate))}d ago` : `In ${daysBetween(todayISO, row.startDate)}d`}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Day 0
                    </div>
                  </div>

                  {/* Milestone cells */}
                  {milestones.map((m) => {
                    const s = statusStyle(m.status);
                    return (
                      <div key={m.label} className={`p-4 ${s.cellBg}`}>
                        <div className={`text-[10px] uppercase tracking-wide font-semibold mb-2 ${s.accentText}`}>
                          {m.label}
                        </div>
                        <div className="text-sm font-semibold text-slate-800">
                          {fmtLong(m.iso)}
                        </div>
                        <div className={`text-[11px] mt-1 ${s.accentText}`}>
                          {m.status === "passed" && `${Math.abs(m.days)}d ago`}
                          {m.status === "thisWeek" && (m.days === 0 ? "Today" : `In ${m.days}d`)}
                          {m.status === "upcoming" && `In ${m.days}d`}
                          {m.status === "future" && `In ${m.days}d`}
                        </div>
                        <div
                          className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.badgeBg} ${s.badgeText} ${s.badgeBorder}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-500">
          Review milestones are calculated as calendar months from each recruit&apos;s start date.
          Performance data will be layered on in stage 2.
        </div>
      </div>
    </main>
  );
}

export default function StaffReviewDatesPage() {
  return (
    <PasswordGate requireMaster>
      <StaffReviewDatesContent />
    </PasswordGate>
  );
}
