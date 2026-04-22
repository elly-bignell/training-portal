// data/checklistTemplate.ts
//
// Shared checklist template used by every Lead Genner.
// The structure mirrors the Google Sheets layout:
//   - Three time sections: 9:00AM, 12:30PM, 5:00PM
//   - Within each section, optional sub-headings (e.g. "Before Starting Cold Calling")
//   - Two standalone "divider" rows that are visual-only (no checkboxes)

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

export const BOOKERS: { slug: string; name: string; shortName: string }[] = [
  { slug: "krishna-patel",               name: "Krishna Patel",    shortName: "Krishna" },
  { slug: "cindy-rose-rondez-manrique",  name: "Cindy Manrique",   shortName: "Cindy"   },
  { slug: "sydney-arnold",               name: "Sydney Arnold",    shortName: "Sydney"  },
  { slug: "riley-kerrison",              name: "Riley Kerrison",   shortName: "Riley"   },
];

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "morning",
    time: "9:00AM CHECKLIST",
    rows: [
      { kind: "item", id: "am-1",  number: 1, label: "Morning Mindset Video" },
      { kind: "item", id: "am-2",  number: 2, label: "Alarms set for 15 min scheduled meetings" },
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
      { kind: "item", id: "pm-11", number: 11, label: "All No shows/Reschedules added to next day rebooking schedule" },
      { kind: "item", id: "pm-12", number: 12, label: "Review meetings for tomorrow" },
      { kind: "item", id: "pm-13", number: 13, label: "Discuss pipeline with Buddy (to be closed & upcoming meetings)" },
      { kind: "item", id: "pm-14", number: 14, label: "Add questions / problems for the day to Question box (URL TBA)" },
      { kind: "item", id: "pm-15", number: 15, label: "EOD Discord message sent" },
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
