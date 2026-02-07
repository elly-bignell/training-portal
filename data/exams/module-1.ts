// data/exams/module-1.ts

import { Exam } from "@/types/exam";

export const module1Exam: Exam = {
  id: "exam-module-1",
  moduleId: "module-1",
  title: "Module 1 Exam: Company & Culture",
  description: "Test your understanding of Marketing Sweet, Quodo, our leadership, our people, and what makes us different.",
  passingScore: 100, // 100% to pass - must get all questions correct
  willoLink: "", // Add Willo link when ready
  willoDescription: "After completing the multiple choice questions below, you'll also need to complete a short video questionnaire on Willo to demonstrate your understanding in your own words.",
  questions: [
    {
      id: "m1-q1",
      question: "What is the relationship between Marketing Sweet and Quodo?",
      options: [
        "A. Marketing Sweet is a subsidiary company that Quodo acquired in 2023",
        "B. They are separate competing agencies targeting different market segments",
        "C. Quodo is a product and service offering that operates under Marketing Sweet",
        "D. Marketing Sweet handles creative work while Quodo manages client accounts"
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
        "D. To build understanding of who we are as a company and our foundation"
      ],
      correctAnswer: 3, // D
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q3",
      question: "According to our training materials, what is a key reason clients trust us?",
      options: [
        "A. Our proven track record demonstrated through client results and reviews",
        "B. We consistently offer the lowest pricing in the Australian market",
        "C. We have the largest team of any marketing agency in South Australia",
        "D. We provide unlimited revisions on all deliverables at no extra cost"
      ],
      correctAnswer: 0, // A
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q4",
      question: "What does 'Part 1 - Our Leader' in The Core Strength Series focus on?",
      options: [
        "A. The company's quarterly financial performance and growth metrics",
        "B. Technical specifications of our core product and service offerings",
        "C. Human resources policies including leave entitlements and benefits",
        "D. The vision, values, and leadership philosophy behind the company"
      ],
      correctAnswer: 3, // D
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q5",
      question: "Why is reading our Google Reviews included as part of the training program?",
      options: [
        "A. To learn the standard templates for responding to negative feedback",
        "B. To memorize specific phrases that can be used during sales calls",
        "C. To understand real client experiences and what they value about us",
        "D. To identify which competitors are mentioned most frequently by clients"
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q6",
      question: "What is the main focus of 'Part 2 - Our People' in the training?",
      options: [
        "A. Understanding the team culture and the people who make up our company",
        "B. A comprehensive directory with contact details for all current staff",
        "C. The formal organisational chart showing reporting line structures",
        "D. Details about employee benefits including salary bands and bonuses"
      ],
      correctAnswer: 0, // A
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q7",
      question: "Which statement best describes our approach to client success?",
      options: [
        "A. We prioritize delivering services at the lowest possible cost point",
        "B. We use standardized templates and processes for maximum efficiency",
        "C. We focus primarily on quick turnaround times over final quality",
        "D. We take a partnership approach and invest in understanding each client"
      ],
      correctAnswer: 3, // D
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m1-q8",
      question: "After completing Module 1, what should you be able to confidently do?",
      options: [
        "A. Handle all customer complaints and escalations without any supervision",
        "B. Build and execute a complete marketing campaign independently",
        "C. Explain who Marketing Sweet and Quodo are, and why clients trust us",
        "D. Manage all company social media accounts and content publishing"
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q9",
      question: "What topics does 'Part 3 - Our Company' primarily cover?",
      options: [
        "A. Individual employee performance reviews and development plans",
        "B. Detailed technical manuals for all products and service offerings",
        "C. The company's direction, market position, and broader business context",
        "D. A complete historical record of all company financial statements"
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q10",
      question: "As a new team member in sales, why is understanding company culture critical?",
      options: [
        "A. Culture knowledge is optional and not formally assessed in your role",
        "B. It helps you authentically communicate our values and build client trust",
        "C. Understanding culture is primarily important for senior management only",
        "D. Sales performance is measured purely by numbers, not cultural alignment"
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
