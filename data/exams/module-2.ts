// data/exams/module-2.ts

import { Exam } from "@/types/exam";

export const module2Exam: Exam = {
  id: "exam-module-2",
  moduleId: "module-2",
  title: "Module 2 Exam: Marketing Sweet",
  description:
    "Test your knowledge of Marketing Sweet memberships, extras, and once-off products. You'll need to match the right solutions to real client scenarios and demonstrate your understanding of pricing, inclusions, and the value of 24-month agreements. All prices referenced are excluding GST.",
  passingScore: 80,
  willoLink: "", // TODO: Add Willo questionnaire link
  willoDescription:
    "Record video responses explaining Marketing Sweet products and recommending solutions for client scenarios.",
  questions: [
    {
      id: "m2-q1",
      question:
        "A client says: \"I want to focus on improving my Google rankings, but I'd also like the option to make small updates to my website every now and then.\" What would you recommend?",
      options: [
        "A. Web Support membership — it covers website changes and that should help with rankings too",
        "B. SEO Support membership + Web Changes extra — SEO Support targets rankings, and the Web Changes extra gives them 3 hours of updates per quarter",
        "C. Digital Support membership — it's the only option that covers both SEO and website updates",
        "D. SEO Backlinking extra + Web Changes extra — these two extras cover both needs without a membership",
        "E. SEO Support membership + SEO Page Building extra — building new pages will cover the website updates they need",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q2",
      question:
        "What is the monthly cost of SEO Support on a 24-month agreement?",
      options: [
        "A. $500 per month — the price is the same regardless of contract length",
        "B. $400 per month — clients save $100 per month on a 24-month agreement",
        "C. $450 per month — clients save $50 per month on a 24-month agreement",
        "D. $290 per month — the 24-month discount applies to all memberships equally",
        "E. $475 per month — the discount is $25 per month on longer agreements",
      ],
      correctAnswer: 2, // C
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m2-q3",
      question:
        "A client wants their existing website maintained and regularly updated, but they've also mentioned wanting to rank for 3 specific service keywords in their area. What combination would you explore?",
      options: [
        "A. Web Support membership + SEO Backlinking extra — maintains their site and targets their 3 keywords",
        "B. SEO Support membership — it already includes backlinking for 2 keywords which is close enough",
        "C. Digital Support membership — it's the only way to get both website maintenance and SEO",
        "D. Web Support membership + SEO Overhaul once-off — overhaul their SEO once and maintain the site ongoing",
        "E. Web Support membership + SEO Page Building extra — building new pages will help them rank",
      ],
      correctAnswer: 0, // A
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q4",
      question:
        "A client signs up for Digital Support on a 24-month agreement and adds the Web Changes extra. What is their total monthly cost (excluding GST and setup fee)?",
      options: [
        "A. $690 per month — Digital Support $640 + Web Changes $50",
        "B. $640 per month — the Web Changes extra is included in Digital Support",
        "C. $590 per month — the 24-month discount covers the cost of the Web Changes extra",
        "D. $640 per month — Digital Support $590 (24-month) + Web Changes $50",
        "E. $740 per month — Digital Support $640 + Web Changes $50 + backlinking $50",
      ],
      correctAnswer: 3, // D — $590 + $50 = $640
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q5",
      question:
        "Web Support dedicates 50% of its monthly hours to website changes. What does the other 50% cover?",
      options: [
        "A. SEO Google Rankings (38%) and Copywriting (12%)",
        "B. Phone & Email Support/Advice (38%) and Copywriting (12%)",
        "C. Research & Insights (38%) and Google Business Profile (12%)",
        "D. SEO Backlinking (25%) and SEO Page Building (25%)",
        "E. AdWords Management (30%) and Social Media (20%)",
      ],
      correctAnswer: 1, // B — Support & Advice 38% + Copywriting 12%
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q6",
      question:
        "A client needs comprehensive support: they want SEO work, website updates, copywriting, and backlinking for multiple keywords. They don't want to manage multiple add-ons. Which single membership best fits?",
      options: [
        "A. Web Support — it covers everything website-related including SEO",
        "B. SEO Support — it includes backlinking for 2 keywords and covers all SEO needs",
        "C. Digital Support — it combines web and SEO services including 3-keyword backlinking, website changes, and copywriting",
        "D. Web Support + SEO Support together — you need both memberships to cover all these areas",
        "E. None of the memberships cover all of this — they'd need a custom package",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q7",
      question:
        "How much does a client save in total over the full term if they choose a 24-month agreement instead of paying the 12-month rate for 24 months?",
      options: [
        "A. $600 — they save $50 per month for 12 months",
        "B. $1,200 — they save $50 per month for 24 months",
        "C. $250 — the setup fee is waived on 24-month agreements",
        "D. $2,400 — they save $100 per month for 24 months",
        "E. $50 — it's a one-time discount applied at signup",
      ],
      correctAnswer: 1, // B — $50 × 24 = $1,200
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q8",
      question:
        "A client on SEO Support wants 5 brand new service pages built for their website as a one-time project. What would you recommend and what's the cost?",
      options: [
        "A. SEO Page Building extra at $125/month — it builds 3 pages per month so they'll have 5 within 2 months",
        "B. Page Building once-off at $450 per page — 5 pages would be $2,250 +GST as a one-time project",
        "C. Web Changes extra at $50/month — the 3 hours per quarter can be used to build new pages",
        "D. Web Changes once-off at $185/hour — estimate 2 hours per page so around $1,850 total",
        "E. SEO Overhaul once-off at $1,500 — it includes page building as part of the 12-hour project",
      ],
      correctAnswer: 1, // B — $450 × 5 = $2,250
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q9",
      question:
        "A client is currently on Web Support and says: \"I'm happy with the website maintenance, but I've noticed my competitors are outranking me on Google. Can you help?\" What's the most appropriate upsell?",
      options: [
        "A. Add the SEO Backlinking extra (+$100/month for 3 keywords) to start building their search visibility",
        "B. Suggest they switch to SEO Support instead since Web Support doesn't help with rankings at all",
        "C. Add the AdWords extra so they can appear at the top of Google through paid ads",
        "D. Recommend an SEO Overhaul once-off to fix everything in one go",
        "E. Upgrade them to Digital Support — it's the only way to get SEO with website maintenance",
      ],
      correctAnswer: 0, // A — targeted upsell that addresses the specific need
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q10",
      question:
        "What is the once-off setup fee for all Marketing Sweet memberships?",
      options: [
        "A. $100 +GST — a standard onboarding fee",
        "B. $250 +GST — applied to all memberships regardless of tier",
        "C. $500 +GST — it covers the initial audit and account setup",
        "D. There is no setup fee — the monthly price covers everything",
        "E. It varies by membership — Web Support is $150, SEO Support is $250, Digital Support is $350",
      ],
      correctAnswer: 1, // B
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m2-q11",
      question:
        "A client wants SEO Support on a 24-month agreement, plus the SEO Backlinking extra and the Web Changes extra. What is their total monthly cost (excluding GST and setup)?",
      options: [
        "A. $650 per month — SEO Support $500 + Backlinking $100 + Web Changes $50",
        "B. $600 per month — SEO Support $450 (24-month) + Backlinking $100 + Web Changes $50",
        "C. $550 per month — the 24-month discount applies to the extras as well",
        "D. $500 per month — Backlinking is already included in SEO Support so only Web Changes is extra",
        "E. $700 per month — SEO Support $500 + Backlinking $100 + Web Changes $50 + setup fee spread monthly",
      ],
      correctAnswer: 1, // B — $450 + $100 + $50 = $600
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q12",
      question:
        "What does Digital Support include that neither Web Support nor SEO Support offer individually?",
      options: [
        "A. Phone and email support — this is exclusive to the Digital Support tier",
        "B. A combination of website changes, SEO rankings work, 3-keyword backlinking, research, and copywriting in one membership",
        "C. Access to extras and once-off products — lower-tier memberships can't add these",
        "D. A dedicated account manager — Web and SEO Support clients share a general support team",
        "E. Google Business Profile management — this is only available at the Digital Support level",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q13",
      question:
        "A client has a budget of around $400 per month. They primarily need help maintaining and updating their website. Which option gives them the best value?",
      options: [
        "A. Web Support on a 12-month agreement at $340/month — fits their budget with room for an extra if needed",
        "B. SEO Support on a 24-month agreement at $450/month — it's close to budget and covers more",
        "C. Digital Support on a 24-month agreement at $590/month — best value per dollar",
        "D. Web Support on a 24-month agreement at $290/month — saves them $50/month and leaves $110 for extras",
        "E. Web Support at $340/month + SEO Backlinking at $100/month — maximises their budget with two services",
      ],
      correctAnswer: 3, // D — best value: $290 leaves room for extras within budget
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q14",
      question:
        "A client's website SEO is in poor shape — broken meta tags, no keyword strategy, outdated content structure. They want it fixed properly before committing to ongoing support. What do you recommend first?",
      options: [
        "A. SEO Support membership — the ongoing work will gradually fix everything over time",
        "B. SEO Backlinking extra — building external links will compensate for the on-site issues",
        "C. SEO Overhaul once-off ($1,500 +GST, 12 hours) to rebuild the SEO foundation, then transition to an ongoing membership",
        "D. Digital Support membership — the comprehensive approach will address all the issues",
        "E. SEO Page Building extra — creating new pages will replace the ones with broken SEO",
      ],
      correctAnswer: 2, // C
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q15",
      question:
        "What is the difference between the Web Changes extra and the Web Changes once-off?",
      options: [
        "A. They're the same service — \"extra\" and \"once-off\" are just different billing terms",
        "B. The extra is $50/month for 3 hours per quarter on an ongoing basis; the once-off is $185/hour for a one-time project",
        "C. The extra is for small visual changes; the once-off is for structural website rebuilds",
        "D. The extra requires a membership; the once-off is available to anyone without a membership",
        "E. The extra is billed monthly; the once-off is billed annually at a discounted hourly rate",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q16",
      question:
        "A client signs up for Digital Support on a 12-month agreement and wants to run Google Ads with a $2,000 monthly ad spend. What is their total monthly cost (excluding GST and setup)?",
      options: [
        "A. $890 per month — Digital Support $640 + AdWords $250",
        "B. $1,140 per month — Digital Support $640 + AdWords $500 (2 × $250 per $1K spend)",
        "C. $940 per month — Digital Support $640 + AdWords $300 for $2K spend",
        "D. $1,390 per month — Digital Support $640 + AdWords $250 + the $2,000 ad spend is added to the invoice",
        "E. $640 per month — AdWords management is included in Digital Support",
      ],
      correctAnswer: 1, // B — $640 + ($250 × 2) = $1,140
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q17",
      question:
        "How many hours of website changes does a client receive per quarter with the Web Changes extra?",
      options: [
        "A. 1 hour per quarter — small updates only",
        "B. 3 hours per quarter — enough for regular minor updates",
        "C. 5 hours per quarter — a substantial allocation for ongoing changes",
        "D. 3 hours per month — totalling 9 hours per quarter",
        "E. Unlimited hours — the $50/month covers as many changes as needed",
      ],
      correctAnswer: 1, // B
      difficulty: "easy",
      points: 1,
    },
    {
      id: "m2-q18",
      question:
        "A client on SEO Support wants to target more keywords beyond what's included. They ask: \"Can I rank for 3 additional keywords?\" What do you recommend and what will it cost them?",
      options: [
        "A. Upgrade to Digital Support — it includes 3-keyword backlinking which covers their extra keywords",
        "B. Add the SEO Backlinking extra at $100/month for 3 additional keywords",
        "C. Add the SEO Page Building extra at $125/month — new pages will help them rank for more keywords",
        "D. It's not possible — SEO Support is capped at the keywords included in the membership",
        "E. Add the AdWords extra at $250/month — paid ads will cover the additional keyword targets",
      ],
      correctAnswer: 1, // B
      difficulty: "medium",
      points: 2,
    },
    {
      id: "m2-q19",
      question:
        "Digital Support costs $300 more per month than Web Support (on 12-month agreements). What additional services does that $300 get the client?",
      options: [
        "A. SEO Google Rankings (10.5 hrs), Research & Insights (1.5 hrs), Google Business Profile, 3-keyword backlinking, and an extra hour of copywriting — offset by fewer website change hours",
        "B. Just SEO work and backlinking — everything else stays the same between the two memberships",
        "C. A dedicated account manager, priority support, and faster turnaround times",
        "D. Access to the extras and once-off products — Web Support clients can't add these",
        "E. Double the website change hours, plus copywriting and phone support",
      ],
      correctAnswer: 0, // A
      difficulty: "hard",
      points: 3,
    },
    {
      id: "m2-q20",
      question:
        "A prospect has an existing website and tells you: \"I need someone to look after my website, help me rank on Google, make occasional content updates, and I want to try Google Ads with a $1,000 budget. I'm happy to commit for 2 years if it saves me money.\" What package and monthly cost would you recommend?",
      options: [
        "A. Digital Support 24-month ($590) + AdWords extra ($250) = $840/month — Digital Support covers web, SEO, and content; AdWords handles the paid ads; 24-month saves $50/month",
        "B. SEO Support 24-month ($450) + Web Changes extra ($50) + AdWords extra ($250) = $750/month — covers all their needs at a lower total",
        "C. Web Support 24-month ($290) + SEO Backlinking ($100) + AdWords ($250) = $640/month — the cheapest way to tick every box",
        "D. Digital Support 12-month ($640) + AdWords extra ($250) = $890/month — 12-month is safer for a first-time client",
        "E. Digital Support 24-month ($590) + Web Changes extra ($50) + AdWords extra ($250) = $890/month — add Web Changes for the content updates",
      ],
      correctAnswer: 0, // A — Digital Support already includes web changes and copywriting, so no need for the Web Changes extra
      difficulty: "hard",
      points: 3,
    },
  ],
};

// Calculate total possible points
export const module2TotalPoints = module2Exam.questions.reduce(
  (sum, q) => sum + q.points,
  0
);
