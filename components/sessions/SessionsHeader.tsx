// components/sessions/SessionsHeader.tsx
//
// Top bar for every page in the /sessions area. Shows the portal name, current
// rep, and a Switch User link. Visual language matches the brief:
// navy primary (#1F3A5F), gold accent (#D49A30), clean white space.

"use client";

import Link from "next/link";
import { clearSelectedRepSlug } from "@/hooks/useSessionsProgress";

interface Props {
  repName: string;
  /** Optional breadcrumb segments rendered after "Sessions /". */
  breadcrumb?: string;
  /** Right-side slot for page-specific actions. */
  rightSlot?: React.ReactNode;
}

export default function SessionsHeader({ repName, breadcrumb, rightSlot }: Props) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link
          href="/sessions"
          className="font-bold text-[#1F3A5F] text-lg whitespace-nowrap"
        >
          Marketing Sweet
        </Link>
        <nav className="hidden sm:flex items-center gap-1 text-sm text-slate-500">
          <Link href="/sessions" className="hover:text-[#1F3A5F] transition-colors">
            Sessions
          </Link>
          {breadcrumb && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-medium">{breadcrumb}</span>
            </>
          )}
        </nav>
        <div className="flex-1" />
        {rightSlot}
        <div className="hidden sm:flex items-center gap-3 text-sm">
          <span className="text-slate-500">
            Hi,{" "}
            <span className="font-medium text-slate-900">
              {repName.split(" ")[0]}
            </span>
          </span>
          <button
            onClick={() => {
              clearSelectedRepSlug();
              window.location.reload();
            }}
            className="text-slate-400 hover:text-[#1F3A5F] transition-colors"
            title="Switch user"
          >
            Switch
          </button>
        </div>
      </div>
    </header>
  );
}
