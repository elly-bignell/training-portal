// data/exams/module-3.ts

import { Exam } from "@/types/exam";

export const module3Exam: Exam = {
  id: "exam-module-3",
  moduleId: "module-3",
  title: "Module 3 Exam: Quodo",
  description:
    "Test your knowledge of Quodo's plan ladder, pricing structure, and how to match clients to the right plan. This module also includes a Willo video questionnaire.",
  passingScore: 80,
  willoLink: "", // TODO: Add Willo questionnaire link
  willoDescription:
    "Record video responses explaining Quodo plans, recommending solutions for client scenarios, and distinguishing when to use Marketing Sweet vs Quodo.",
  questions: [
    {
      id: "m3-q1",
      question:
        "What is Quodo's core purpose compared to Marketing Sweet?",
      options: [
        "A. Quodo focuses on social media while Marketing Sweet handles websites",
        "B. Quodo replaces websites with new builds while Marketing Sweet supports existing ones",
        "C. Quodo is the premium brand while Marketing Sweet is the budget option",
        "D. Quodo handles interstate clients while Marketing Sweet serves local ones",
        "E. Quodo provides ongoing support while Marketing Sweet does one-off projects",
      ],
      correctAnswer: 1, // B
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m3-q2",
      question: "How many plan tiers does Quodo offer?",
      options: [
        "A. Three — Bronze, Silver, and Gold",
        "B. Four — Silver, Gold, Platinum, and Diamond",
        "C. Five — Bronze, Silver, Gold, Platinum, and Diamond",
        "D. Six — Starter, Bronze, Silver, Gold, Platinum, and Diamond",
        "E. Two — Standard and Premium with customisation options",
      ],
      correctAnswer: 2, // C
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m3-q3",
      question:
        "What is the quoting and sales system used for Quodo products?",
      options: [
        "A. M-Quote — the Marketing Sweet quoting and presentation platform",
        "B. Salesforce — the company's enterprise CRM and quoting system",
        "C. Q-Quote — the Quodo quoting and presentation platform",
        "D. Canva — the design tool used for creating client presentations",
        "E. HubSpot — the integrated marketing and sales pipeline tool",
      ],
      correctAnswer: 2, // C
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m3-q4",
      question:
        "Which Quodo plan would be most suitable for a small business that needs a simple, professional online presence with a few key pages?",
      options: [
        "A. Bronze — as the entry-level plan suited to straightforward requirements",
        "B. Silver — because small businesses should always start at the second tier",
        "C. Gold — as the middle option that balances features and investment",
        "D. Platinum — for a premium result that will set them apart from competitors",
        "E. Diamond — to ensure they get the most comprehensive solution possible",
      ],
      correctAnswer: 0, // A
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m3-q5",
      question:
        "A growing business says they need a comprehensive website with multiple service pages, a blog, and room to scale. Which plan tier would best match their needs?",
      options: [
        "A. Bronze — they can always upgrade later as their business grows",
        "B. Silver — it provides a solid foundation with room for some growth",
        "C. Gold or Platinum — for a more comprehensive site matching their scale",
        "D. Diamond — the only plan that accommodates business growth needs",
        "E. They should stay with Marketing Sweet rather than moving to Quodo",
      ],
      correctAnswer: 2, // C
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m3-q6",
      question:
        "What information does the sitemap for each plan help you understand?",
      options: [
        "A. The technical hosting specifications and server requirements",
        "B. The page structure and layout showing what's included in each plan",
        "C. The monthly pricing breakdown and payment schedule details",
        "D. The timeline for delivery from design approval to website launch",
        "E. The SEO keyword strategy that will be implemented on the site",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m3-q7",
      question:
        "A prospect already has a website but it's very outdated and not performing. When would you suggest Quodo over Marketing Sweet?",
      options: [
        "A. When the client's budget is limited and they want a low-cost option",
        "B. When the website needs a complete replacement rather than updates",
        "C. When the client only needs minor content changes and fresh images",
        "D. When the client is focused solely on improving search engine rankings",
        "E. When the client wants to add a blog to their existing website",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m3-q8",
      question:
        "What is a key selling point that distinguishes the Diamond plan from lower tiers?",
      options: [
        "A. Diamond is the only plan that includes a mobile-responsive design",
        "B. Diamond is the only plan that comes with any form of SEO setup",
        "C. Diamond provides the most comprehensive site with the most features and pages",
        "D. Diamond is the only plan that includes a contact form on the website",
        "E. Diamond is exclusively available to enterprise-level business clients",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m3-q9",
      question:
        "When presenting Quodo plans, why is it important to show the client the sitemap?",
      options: [
        "A. It's a legal requirement before any website project can commence",
        "B. It helps the client visualise exactly what they'll receive in their plan",
        "C. It allows the client to make technical hosting decisions for the site",
        "D. It replaces the need for a formal written proposal or quote document",
        "E. It demonstrates the back-end coding structure of the new website",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m3-q10",
      question:
        "A client says: \"I just need something basic — maybe 3-5 pages with my services and contact info.\" Which plan aligns with this request?",
      options: [
        "A. Bronze — it's designed for straightforward sites with essential pages",
        "B. Silver — because 3-5 pages is too many for the Bronze plan",
        "C. Gold — to ensure they have room for future content and growth",
        "D. Platinum — for a professional result that exceeds their expectations",
        "E. Diamond — to future-proof their investment from the very start",
      ],
      correctAnswer: 0, // A
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m3-q11",
      question:
        "How does Quodo's service walkthrough help during the sales process?",
      options: [
        "A. It automatically generates a signed contract for the client",
        "B. It replaces the need for any follow-up communication with the client",
        "C. It gives the client an interactive preview of what they'll receive",
        "D. It calculates the exact ROI the client will receive from their website",
        "E. It provides the client's competitors' website analytics and data",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m3-q12",
      question:
        "A client is torn between two adjacent plan tiers. What is the best approach?",
      options: [
        "A. Always push the higher plan to maximise your commission per sale",
        "B. Choose the cheaper option for them so they feel you're on their side",
        "C. Tell them to think about it and call back when they've decided",
        "D. Walk through both plans' sitemaps and help them see the value difference",
        "E. Offer a custom hybrid plan that falls between the two standard tiers",
      ],
      correctAnswer: 3, // D
      difficulty: "hard",
      points: 3,
    },
  ],
};

// Calculate total possible points
export const module3TotalPoints = module3Exam.questions.reduce(
  (sum, q) => sum + q.points,
  0
);
