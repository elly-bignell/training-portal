// data/checklistTemplate.ts
//
// Shared checklist template used by every active lead-gen trainee.
// The structure mirrors the Google Sheets layout:
//   - Three time sections: 9:00AM, 12:30PM, 5:00PM
//   - Within each section, optional sub-headings (e.g. "Before Starting Cold Calling")
//   - Two standalone "divider" rows that are visual-only (no checkboxes)

import { trainees } from "@/data/trainees";
import { LEAD_GEN_SLUGS } from "@/data/leadGen";

export type ChecklistRow =
  | {
      kind: "item";
      id: string;              // stable id used as the Airtable key
      number: number;          // display number (1, 2, 3, ...)
      label: string;
    }
  | {
      kind: "subheading";
      id: string;
      label: string;
    }
  | {
      kind: "divider";
      id: string;
      label: string;           // e.g. "COLD CALLING TO START BY 9:30AM"
    };

export interface ChecklistSection {
  id: string;
  time: string;                // displayed header, e.g. "9:00AM CHECKLIST"
  rows: ChecklistRow[];
}

// BOOKERS is derived automatically from LEAD_GEN_SLUGS in data/leadGen.ts.
// To add a new person's checklist: add their slug to LEAD_GEN_SLUGS (they
// also need to exist in data/trainees.ts). No edits to this file required.
//
// `shortName` defaults to the first word of the trainee's name; override
// in SHORT_NAME_OVERRIDES if a different label is wanted on the tab strip.
const SHORT_NAME_OVERRIDES: Record<string, string> = {
  "cindy-rose-rondez-manrique": "Cindy",
};

const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  "cindy-rose-rondez-manrique": "Cindy Manrique",
};

export const BOOKERS: { slug: string; name: string; shortName: string }[] =
  LEAD_GEN_SLUGS.map((slug) => {
    const trainee = trainees.find((t) => t.slug === slug);
    if (!trainee) {
      // Loud failure at module load — easier to spot than a silently
      // missing checklist tab.
      throw new Error(
        `LEAD_GEN_SLUGS contains "${slug}" but no matching entry in data/trainees.ts`
      );
    }
    return {
      slug,
      name: DISPLAY_NAME_OVERRIDES[slug] ?? trainee.name,
      shortName: SHORT_NAME_OVERRIDES[slug] ?? trainee.name.split(" ")[0],
    };
  });

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "morning",
    time: "9:00AM CHECKLIST",
    rows: [
      { kind: "item", id: "am-1",  number: 1, label: "Morning Mindset Video" },
      { kind: "item", id: "am-2",  number: 2, label: "Alarms set for 15 mins prior to all scheduled meetings" },
      { kind: "item", id: "am-3",  number: 3, label: "12:30pm alarm set for checklist update" },
      { kind: "item", id: "am-4",  number: 4, label: "Send Confirmed Meetings Texts (all confirmed meetings for the day)" },
      { kind: "subheading", id: "am-sub-1", label: "Before Starting Cold Calling" },
      { kind: "item", id: "am-5",  number: 5, label: "All unconfirmed bookings for today called to confirm / cancel attendance" },
      { kind: "item", id: "am-6",  number: 6, label: "Yesterday's rebooking calls completed (Reschedules/No Shows) & ticked in Booking Sheet" },
      { kind: "item", id: "am-7",  number: 7, label: "Clickup Updated for unconfirmed & rebooking calls" },
      { kind: "divider", id: "am-div", label: "COLD CALLING TO START BY 9:30AM" },
    ],
  },
  {
    id: "midday",
    time: "12:30PM CHECKLIST",
    rows: [
      { kind: "subheading", id: "md-sub-1", label: "Booking Admin (morning bookings):" },
      { kind: "item", id: "md-1",  number: 1, label: "All Calendar Invites sent" },
      { kind: "item", id: "md-2",  number: 2, label: "All Validation Forms submitted" },
      { kind: "item", id: "md-3",  number: 3, label: "All Clickup Forms submitted" },
      { kind: "item", id: "md-4",  number: 4, label: "All booking emails sent" },
      { kind: "item", id: "md-5",  number: 5, label: "All booking texts sent" },
      { kind: "subheading", id: "md-sub-2", label: "Scorecard:" },
      { kind: "item", id: "md-6",  number: 6, label: "Calls & Bookings up to date" },
      { kind: "item", id: "md-7",  number: 7, label: "Meetings Attended up to date" },
      { kind: "item", id: "md-8",  number: 8, label: "Deal (U & $) up to date" },
      { kind: "divider", id: "md-div", label: "COLD CALLING TO BE COMPLETED BY 5:30PM" },
    ],
  },
  {
    id: "evening",
    time: "5:00PM CHECKLIST",
    rows: [
      { kind: "subheading", id: "pm-sub-1", label: "Booking Admin (afternoon bookings):" },
      { kind: "item", id: "pm-1",  number: 1,  label: "All Calendar Invites sent" },
      { kind: "item", id: "pm-2",  number: 2,  label: "All Validation Forms submitted" },
      { kind: "item", id: "pm-3",  number: 3,  label: "All Clickup Forms submitted" },
      { kind: "item", id: "pm-4",  number: 4,  label: "All emails sent" },
      { kind: "item", id: "pm-5",  number: 5,  label: "All texts sent" },
      { kind: "subheading", id: "pm-sub-2", label: "Scorecard:" },
      { kind: "item", id: "pm-6",  number: 6,  label: "Calls & Bookings up to date" },
      { kind: "item", id: "pm-7",  number: 7,  label: "Meetings Attended up to date" },
      { kind: "item", id: "pm-8",  number: 8,  label: "Deal (U & $) up to date" },
      { kind: "subheading", id: "pm-sub-3", label: "Follow Up Admin:" },
      { kind: "item", id: "pm-9",  number: 9,  label: "All Follow up booking emails sent" },
      { kind: "item", id: "pm-10", number: 10, label: "Clickup updated (Email sent)" },
      { kind: "subheading", id: "pm-sub-4", label: "Other:" },
      { kind: "item", id: "pm-cd-dollars", number: 11, label: "CD Dollars up to date in trays" },
      { kind: "item", id: "pm-11", number: 12, label: "All No shows/Reschedules added to next day rebooking schedule" },
      { kind: "item", id: "pm-12", number: 13, label: "Review meetings for tomorrow" },
      { kind: "item", id: "pm-13", number: 14, label: "Discuss pipeline with Buddy (to be closed & upcoming meetings)" },
      { kind: "item", id: "pm-14", number: 15, label: "Add questions / problems for the day to Question Box (https://training-portal-mauve.vercel.app/question-box)" },
      { kind: "item", id: "pm-15", number: 16, label: "EOD Discord message sent" },
    ],
  },
];

export const DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
];

// Flat list of all real (tickable) item ids — useful for progress counters.
export const ALL_ITEM_IDS: string[] = CHECKLIST_SECTIONS.flatMap((s) =>
  s.rows.filter((r): r is Extract<ChecklistRow, { kind: "item" }> => r.kind === "item").map((r) => r.id)
);

export type ItemStatus = "complete" | "na" | null;

export interface ItemState {
  status: ItemStatus;
  note?: string;
}

// Shape of the `data` JSON blob stored in Airtable.
// Keyed first by day (mon/tue/...) then by item id.
export type WeekData = {
  [day: string]: {
    [itemId: string]: ItemState;
  };
};
