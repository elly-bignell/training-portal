// data/exams/module-4.ts

import { Exam } from "@/types/exam";

export const module4Exam: Exam = {
  id: "exam-module-4",
  moduleId: "module-4",
  title: "Module 4 Exam: Call Scripts & Sales Resources",
  description:
    "Test your understanding of the cold call script structure, sales communication templates, and how to handle common scenarios. This module also includes a Willo video questionnaire.",
  passingScore: 80,
  willoLink: "", // TODO: Add Willo questionnaire link
  willoDescription:
    "Record video responses demonstrating your cold call delivery, objection handling, and understanding of the sales communication process.",
  questions: [
    {
      id: "m4-q1",
      question: "What is the primary purpose of the cold call script?",
      options: [
        "A. To read word-for-word to every prospect without any variation",
        "B. To provide a consistent framework that can be adapted to each call",
        "C. To replace the need for any product knowledge during sales calls",
        "D. To guarantee a booking from every single cold call that is made",
        "E. To collect personal information from prospects for our database",
      ],
      correctAnswer: 1, // B
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m4-q2",
      question:
        "According to the training materials, how should you approach the cold call script?",
      options: [
        "A. Memorise it exactly and never deviate from the written words",
        "B. Use it as a loose guideline and mostly improvise on every call",
        "C. Follow the structure confidently while adapting to each conversation",
        "D. Only use the script for the first week then develop your own approach",
        "E. Skip the introduction section and go straight to the product pitch",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m4-q3",
      question:
        "Why are there separate email and text templates for Marketing Sweet and Quodo?",
      options: [
        "A. Because the legal disclaimers are different for each brand entity",
        "B. Because each brand has different products, messaging, and value propositions",
        "C. Because Marketing Sweet clients prefer email while Quodo clients prefer text",
        "D. Because the templates are identical — they're separated for filing only",
        "E. Because Marketing Sweet templates are for new clients and Quodo for existing",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m4-q4",
      question:
        "When should you use the email templates during the sales process?",
      options: [
        "A. Only after a prospect has signed a contract and made their first payment",
        "B. Only as a last resort when you've been unable to reach them by phone",
        "C. At specific touchpoints in the follow-up process to maintain engagement",
        "D. As a replacement for phone calls since email is more professional",
        "E. Only when your manager specifically instructs you to send an email",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m4-q5",
      question:
        "What is the purpose of the sales presentations (Canva decks) for each brand?",
      options: [
        "A. They replace the need for verbal explanations during client meetings",
        "B. They are internal documents only meant for team training sessions",
        "C. They provide a professional visual overview to share with prospects",
        "D. They are legal documents that must be signed before sales proceed",
        "E. They contain pricing information that cannot be shared until approved",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m4-q6",
      question:
        "How many times does the training recommend you practice the cold call script aloud?",
      options: [
        "A. Once — reading it through is sufficient preparation for calls",
        "B. At least twice — to build familiarity and confidence with delivery",
        "C. Five times — before you're allowed to make any live calls",
        "D. Ten times — the company requires a specific minimum repetition count",
        "E. Practice is optional — natural delivery is more important than rehearsal",
      ],
      correctAnswer: 1, // B
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m4-q7",
      question:
        "What is the best way to handle common objections during a cold call?",
      options: [
        "A. Agree with the prospect and end the call immediately to respect their time",
        "B. Ignore the objection completely and continue with the prepared script",
        "C. Transfer the call directly to a senior team member or your manager",
        "D. Use the objection handling framework from the script to respond confidently",
        "E. Offer an immediate discount to overcome the prospect's hesitation",
      ],
      correctAnswer: 3, // D
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m4-q8",
      question:
        "When adapting the script for different client scenarios, what should remain consistent?",
      options: [
        "A. Nothing — every call should be completely unique and unscripted",
        "B. Only the greeting at the start of the call should stay the same",
        "C. The core structure and key talking points, while personalising the delivery",
        "D. Every word must remain identical regardless of the client scenario",
        "E. Only the closing statement and call-to-action at the end of the call",
      ],
      correctAnswer: 2, // C
      difficulty: "hard",
      points: 3,
    },
  ],
};

// Calculate total possible points
export const module4TotalPoints = module4Exam.questions.reduce(
  (sum, q) => sum + q.points,
  0
);
