// data/exams/module-2.ts

import { Exam } from "@/types/exam";

export const module2Exam: Exam = {
  id: "exam-module-2",
  moduleId: "module-2",
  title: "Module 2 Exam: Marketing Sweet",
  description:
    "Test your knowledge of Marketing Sweet memberships, extras, and once-off products. You should be able to distinguish between products and recommend the right solution for different client scenarios. This module also includes a Willo video questionnaire.",
  passingScore: 80,
  willoLink: "", // TODO: Add Willo questionnaire link
  willoDescription:
    "Record video responses explaining Marketing Sweet products and recommending solutions for client scenarios.",
  questions: [
    // --- Section 1: Memberships (7 questions) ---
    {
      id: "m2-q1",
      question: "What is the primary focus of the Web Support membership?",
      options: [
        "A. Improving a client's search engine rankings through keyword optimisation",
        "B. Managing and maintaining the client's existing website and its content",
        "C. Running paid advertising campaigns across Google and social media",
        "D. Building brand new websites from scratch for small business clients",
        "E. Creating and managing social media content and posting schedules",
      ],
      correctAnswer: 1, // B
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m2-q2",
      question:
        "Which membership would you recommend for a client who says \"I want to rank higher on Google for my services\"?",
      options: [
        "A. Web Support, because it includes all website-related services",
        "B. Digital Support, because it covers the broadest range of activities",
        "C. SEO Support, because it specifically targets search engine visibility",
        "D. Web Changes, because they need their website updated for rankings",
        "E. Google Ads, because paid ads will get them to the top immediately",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q3",
      question:
        "What makes Digital Support different from Web Support and SEO Support?",
      options: [
        "A. Digital Support is the cheapest option and includes fewer services",
        "B. Digital Support only covers social media marketing and content creation",
        "C. Digital Support combines website and SEO services for a comprehensive approach",
        "D. Digital Support is exclusively for e-commerce businesses and online stores",
        "E. Digital Support replaces both and is only available as a once-off project",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q4",
      question:
        "A client has a well-functioning website but wants more organic traffic. Which membership is the best starting point?",
      options: [
        "A. Web Support — to ensure their site is properly maintained first",
        "B. SEO Support — to focus specifically on improving search visibility",
        "C. Digital Support — to cover all bases with a full-service approach",
        "D. Google Ads — to get immediate traffic while waiting for organic results",
        "E. SEO Backlinking — to start building authority with external links",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q5",
      question:
        "A small business owner says: \"My website looks outdated and I'm not getting any enquiries from it.\" They want to keep their current website. What would you recommend?",
      options: [
        "A. SEO Support, because better rankings will drive more enquiries",
        "B. A Quodo plan, because they need a completely new website built",
        "C. Google Ads, because paid traffic will compensate for the outdated design",
        "D. Web Support, because they need their existing site refreshed and maintained",
        "E. SEO Page Building, because they likely need more content pages",
      ],
      correctAnswer: 3, // D
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q6",
      question:
        "What is the quoting and sales system used for Marketing Sweet products?",
      options: [
        "A. Q-Quote — the Quodo quoting and presentation platform",
        "B. Salesforce — the company's enterprise CRM and quoting system",
        "C. M-Quote — the Marketing Sweet quoting and presentation platform",
        "D. HubSpot — the integrated marketing and sales pipeline tool",
        "E. Xero — the accounting and invoicing platform for client billing",
      ],
      correctAnswer: 2, // C
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m2-q7",
      question:
        "When presenting membership options, what is the best approach for helping a client choose?",
      options: [
        "A. Always recommend the most expensive option to maximise revenue",
        "B. Recommend the cheapest option first so they feel no pressure",
        "C. Present only one option so the client doesn't feel overwhelmed",
        "D. Understand their needs first and recommend the most appropriate fit",
        "E. Let the client choose without any guidance to avoid being pushy",
      ],
      correctAnswer: 3, // D
      difficulty: "medium",
      points: 2,
    },
    // --- Section 2: Extras (4 questions) ---
    {
      id: "m2-q8",
      question: "What is the purpose of the Web Changes extra?",
      options: [
        "A. Building entirely new pages and sections for the client's website",
        "B. Making specific updates and modifications to an existing website",
        "C. Completely overhauling the SEO structure of the client's website",
        "D. Setting up and managing Google Ads campaigns for the client",
        "E. Creating backlinks from external websites to improve authority",
      ],
      correctAnswer: 1, // B
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m2-q9",
      question:
        "A client on SEO Support asks: \"Can you also build some links from other websites to mine?\" Which extra would you recommend?",
      options: [
        "A. Web Changes — to update their site with new outbound link pages",
        "B. SEO Page Building — to create new landing pages with link content",
        "C. Google Ads — to generate paid links that boost their SEO ranking",
        "D. SEO Overhaul — to restructure their entire SEO link strategy",
        "E. SEO Backlinking — to build quality external links to their website",
      ],
      correctAnswer: 4, // E
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q10",
      question:
        "What is SEO Page Building designed to help clients with?",
      options: [
        "A. Redesigning and restructuring the visual layout of existing pages",
        "B. Creating new content-rich pages to target additional search terms",
        "C. Building external backlinks from third-party directory websites",
        "D. Setting up Google Ads landing pages for paid advertising campaigns",
        "E. Migrating website pages from one hosting provider to a new one",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q11",
      question:
        "Which extra would be appropriate for a client who wants to start advertising on Google?",
      options: [
        "A. SEO Support — because it will help them show up in Google results",
        "B. Web Changes — because they'll need a landing page for the ads",
        "C. Google Ads — because it's specifically designed for paid search advertising",
        "D. SEO Backlinking — because Google favours sites with strong links",
        "E. Digital Support — because it includes everything Google-related",
      ],
      correctAnswer: 2, // C
      difficulty: "easy",
      points: 1,
    },
    // --- Section 3: Once-Offs (2 questions) ---
    {
      id: "m2-q12",
      question:
        "What is the key difference between an \"extra\" and a \"once-off\" product?",
      options: [
        "A. Extras are cheaper than once-off products across the board",
        "B. Once-off products are only available to new clients on their first order",
        "C. There is no real difference — the terms are used interchangeably",
        "D. Extras are ongoing add-ons while once-offs are single project deliverables",
        "E. Once-offs require a minimum 12-month commitment before purchase",
      ],
      correctAnswer: 3, // D
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q13",
      question:
        "A client says they want a complete refresh of their website's SEO foundation, but as a one-time project rather than ongoing. Which product fits?",
      options: [
        "A. SEO Support membership — for ongoing optimisation and monitoring",
        "B. SEO Backlinking extra — to build links from external websites",
        "C. SEO Page Building extra — to add new content pages to the site",
        "D. Digital Support membership — for complete digital marketing coverage",
        "E. SEO Overhaul once-off — for a comprehensive one-time SEO restructure",
      ],
      correctAnswer: 4, // E
      difficulty: "hard",
      points: 3,
    },
    // --- Section 4: Cross-Product Scenarios (2 questions) ---
    {
      id: "m2-q14",
      question:
        "A prospect has an existing website that's working okay, but they want better Google rankings AND some updates to their site content. What combination would you explore?",
      options: [
        "A. Web Support + Google Ads to cover website updates and paid traffic",
        "B. SEO Support + Web Changes to address both needs independently",
        "C. Quodo Gold plan to replace their website with a fully optimised one",
        "D. Digital Support, because it combines web and SEO services together",
        "E. SEO Overhaul once-off to fix everything in a single large project",
      ],
      correctAnswer: 3, // D
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q15",
      question:
        "Which of the following is NOT a Marketing Sweet membership?",
      options: [
        "A. Web Support — for website maintenance and content management",
        "B. SEO Support — for search engine optimisation and visibility",
        "C. Digital Support — for combined web and SEO service delivery",
        "D. Bronze Plan — for entry-level website builds and management",
        "E. All of the above are Marketing Sweet memberships",
      ],
      correctAnswer: 3, // D (Bronze is Quodo)
      difficulty: "easy",
      points: 1,
    },
  ],
};

// Calculate total possible points
export const module2TotalPoints = module2Exam.questions.reduce(
  (sum, q) => sum + q.points,
  0
);
