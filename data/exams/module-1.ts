// data/exams/module-1.ts

import { Exam } from "@/types/exam";

export const module1Exam: Exam = {
  id: "exam-module-1",
  moduleId: "module-1",
  title: "Module 1 Exam — Company & Culture",
  description:
    "This video assessment tests your understanding of Marketing Sweet and Quodo's company culture, values, and identity. You'll be asked to demonstrate your knowledge of who we are, why clients trust us, our leadership philosophy, and how to confidently represent the company in real conversations. There are no right or wrong answers — we're looking for genuine understanding and confidence.",
  passingScore: 0,
  willoLink: "https://app.willotalent.com/invite/5W5gyA/",
  willoDescription:
    "Record short video responses demonstrating your understanding of our company culture, values, and how you would communicate them to clients.",
  questions: [], // Willo-only exam — no multiple choice questions
};

// Calculate total possible points
export const module1TotalPoints = 0;
