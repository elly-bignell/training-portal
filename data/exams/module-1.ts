// data/exams/module-1.ts

import { Exam } from "@/types/exam";

export const module1Exam: Exam = {
  id: "exam-module-1",
  moduleId: "module-1",
  title: "Module 1 Exam: Company & Culture",
  description:
    "Test your understanding of Marketing Sweet, Quodo, our leadership, our people, and what makes us different. This module also includes a Willo video questionnaire — make sure to complete both parts.",
  passingScore: 80,
  willoLink: "", // TODO: Add Willo questionnaire link
  willoDescription:
    "Record short video responses demonstrating your understanding of our company culture, values, and how you would communicate them to clients.",
  questions: [
    {
      id: "m1-q1",
      question:
        "What is the relationship between Marketing Sweet and Quodo?",
      options: [
        "A. Marketing Sweet is a subsidiary company that Quodo acquired in 2023",
        "B. They are separate competing agencies targeting different market segments",
        "C. Quodo is a product and service offering that operates under Marketing Sweet",
        "D. Marketing Sweet handles creative work while Quodo manages client accounts",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q2",
      question: "What is the primary purpose of The Core Strength Series?",
      options: [
        "A. To outline the company's five-year strategic business growth plan",
        "B. To provide technical training on marketing tools and software platforms",
        "C. To document HR policies, procedures, and employee benefit structures",
        "D. To build understanding of who we are as a company and our foundation",
      ],
      correctAnswer: 3, // D
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q3",
      question:
        "According to our training materials, what is a key reason clients trust us?",
      options: [
        "A. Our proven track record demonstrated through client results and reviews",
        "B. We consistently offer the lowest pricing in the Australian market",
        "C. We have the largest team of any marketing agency in South Australia",
        "D. We provide unlimited revisions on all deliverables at no extra cost",
      ],
      correctAnswer: 0, // A
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q4",
      question:
        "Why is reading our Google Reviews included as part of the training program?",
      options: [
        "A. To learn the standard templates for responding to negative feedback",
        "B. To memorise specific phrases that can be used during sales calls",
        "C. To understand real client experiences and what they value about us",
        "D. To identify which competitors are mentioned most frequently by clients",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q5",
      question:
        "As a new team member in sales, why is understanding company culture critical?",
      options: [
        "A. Culture knowledge is optional and not formally assessed in your role",
        "B. It helps you authentically communicate our values and build client trust",
        "C. Understanding culture is primarily important for senior management only",
        "D. Sales performance is measured purely by numbers, not cultural alignment",
      ],
      correctAnswer: 1, // B
      difficulty: "hard",
      points: 3,
    },
  ],
};

// Calculate total possible points
export const module1TotalPoints = module1Exam.questions.reduce(
  (sum, q) => sum + q.points,
  0
);
