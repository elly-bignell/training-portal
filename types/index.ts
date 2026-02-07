// types/index.ts

export interface ChecklistItem {
  id: string;
  label: string;
  link?: string;
  audioLink?: string; // Google Drive or direct audio URL for embedded player
  estimatedTime?: string;
  isSection?: boolean;
}

export interface Resource {
  label: string;
  url: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  afterItemId: string; // render this questionnaire block after this checklist item
  willoLink?: string; // will be added when Willo quizzes are created
  questionCount?: number;
}

export interface Module {
  id: string;
  title: string;
  purpose: string;
  proficiency: string[];
  deliverable: string;
  checklist: ChecklistItem[];
  resources?: Resource[];
  questionnaires?: Questionnaire[];
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

// Re-export exam types
export * from "./exam";
