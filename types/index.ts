// types/index.ts

export interface ChecklistItem {
  id: string;
  label: string;
  link?: string;
  estimatedTime?: string;
  isSection?: boolean;
}

export interface Resource {
  label: string;
  url: string;
}

export interface Module {
  id: string;
  title: string;
  purpose: string;
  proficiency: string[];
  deliverable: string;
  checklist: ChecklistItem[];
  resources?: Resource[];
}

export interface Trainee {
  id: string;
  name: string;
  slug: string;
  startDate: string;
}

export interface TraineeProgress {
  checkedItems: Record<string, boolean>;
  notes: Record<string, string>;
  lastUpdated: string;
}
