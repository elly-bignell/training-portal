// types/exam.ts

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

export interface Exam {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScore: number; // Percentage needed to pass
  questions: ExamQuestion[];
  willoLink?: string; // Optional Willo questionnaire link
  willoDescription?: string;
}

export interface ExamSubmission {
  id?: string;
  examId: string;
  traineeSlug: string;
  traineeName: string;
  answers: Record<string, number>; // questionId -> selected option index
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}
