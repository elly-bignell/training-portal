// data/exams/module-1.ts

import { Exam } from "@/types/exam";

export const module1Exam: Exam = {
  id: "exam-module-1",
  moduleId: "module-1",
  title: "Module 1 Exam: Company & Culture",
  description: "Test your understanding of Marketing Sweet, Quodo, our leadership, our people, and what makes us different.",
  passingScore: 70, // 70% to pass
  willoLink: "", // Add Willo link when ready
  willoDescription: "After completing the multiple choice questions below, you'll also need to complete a short video questionnaire on Willo to demonstrate your understanding in your own words.",
  questions: [
    {
      id: "m1-q1",
      question: "What is the relationship between Marketing Sweet and Quodo?",
      options: [
        "They are competing companies",
        "Quodo is a product/service offering from Marketing Sweet",
        "Marketing Sweet is a subsidiary of Quodo",
        "They have no relationship"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m1-q2",
      question: "What is the name of The Core Strength Series about?",
      options: [
        "Physical fitness training for sales reps",
        "Understanding the foundation of who we are as a company",
        "Technical product training",
        "Customer service protocols"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m1-q3",
      question: "According to our training materials, what is one of the key reasons clients trust us?",
      options: [
        "We are the cheapest option in the market",
        "We have the largest team in Australia",
        "Our proven track record and client results shown in reviews",
        "We offer unlimited revisions on all work"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q4",
      question: "What does 'Part 1 - Our Leader' focus on?",
      options: [
        "The company's financial performance",
        "Understanding the vision and leadership behind the company",
        "Technical product specifications",
        "HR policies and procedures"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m1-q5",
      question: "Why is it important to read our Google Reviews as part of training?",
      options: [
        "To learn how to respond to negative reviews",
        "To understand real client experiences and what they value about working with us",
        "To memorize review responses for sales calls",
        "To identify competitors mentioned in reviews"
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q6",
      question: "What is the purpose of 'Part 2 - Our People'?",
      options: [
        "To provide contact details for all staff",
        "To understand the team culture and the people who make up the company",
        "To outline the company org chart",
        "To list employee benefits"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m1-q7",
      question: "Based on your Module 1 training, which statement best describes our approach to client success?",
      options: [
        "We focus primarily on delivering the cheapest possible service",
        "We take a partnership approach, investing in understanding each client's unique needs",
        "We use a one-size-fits-all template for all clients",
        "We prioritize speed over quality in all deliverables"
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q8",
      question: "What should you be able to do after completing Module 1?",
      options: [
        "Build a complete marketing campaign independently",
        "Explain who Marketing Sweet and Quodo are, and why clients trust us",
        "Handle all customer complaints without supervision",
        "Manage the company's social media accounts"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m1-q9",
      question: "'Part 3 - Our Company' covers which of the following?",
      options: [
        "Only the company's financial history",
        "The broader context of the company, its direction, and market position",
        "Detailed technical product manuals",
        "Individual employee performance reviews"
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m1-q10",
      question: "As a new team member, why is understanding company culture important for your role in sales?",
      options: [
        "It isn't - sales is purely about numbers",
        "It helps you authentically communicate our values and build trust with potential clients",
        "It's only important for senior management",
        "Culture understanding is optional and not assessed"
      ],
      correctAnswer: 1,
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
