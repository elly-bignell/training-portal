// data/trainingProgram.ts

import { Module } from "@/types";

export const trainingProgram: Module[] = [
  {
    id: "module-1",
    title: "MODULE 1 — Company & Culture",
    purpose:
      "Build belief and understanding of company context. Learn who we are, why clients trust us, and our approach to success.",
    proficiency: [
      "Explain who Marketing Sweet and Quodo are",
      "Articulate why clients trust us",
      "Summarize key points from reviews, core strengths, and company direction video",
    ],
    deliverable:
      "Write a '60-second company explanation' in the notes section below. This should be a brief pitch you could give to a potential client or colleague explaining who we are and what makes us different.",
    checklist: [
      {
        id: "m1-item1",
        label: "Read: Welcome to The Core Strength Series",
        link: "https://docs.google.com/presentation/d/1hz1VSOp9BizaKimvXe-vlzNhPIqFryTXyhOuEAwY2I0/edit?usp=sharing",
        estimatedTime: "10 min",
      },
      {
        id: "m1-item2",
        label: "Read: Part 1 - Our Leader",
        link: "https://docs.google.com/presentation/d/1j9Fn0MgnvEtSOTBDeoA_ykcMM4zT2Jzdlym6PxpKuao/edit?usp=drive_link",
        estimatedTime: "10 min",
      },
      {
        id: "m1-item3",
        label: "Read: Part 2 - Our People",
        link: "https://docs.google.com/presentation/d/1XWb8y9V24Vs33LGHbVcXQfY8JCkO5sgPICnj6VZBFO4/edit?usp=drive_link",
        estimatedTime: "10 min",
      },
      {
        id: "m1-item4",
        label: "Read: Part 3 - Our Company",
        link: "https://docs.google.com/presentation/d/1Ikb2YP96r-QwZPkpsYqS2QBaB-_qQ6qNbFfRl81jq2A/edit?usp=drive_link",
        estimatedTime: "10 min",
      },
      {
        id: "m1-item5",
        label: "Read some of our Google Reviews",
        link: "https://sweetgroup.marketingsweet.com.au/google-reviews",
        estimatedTime: "10 min",
      },
      {
        id: "m1-item6",
        label: "Watch this Video About Our Company in 2026",
        link: "https://www.youtube.com/watch?v=KjBs0Kl-gkM",
        estimatedTime: "15 min",
      },
      {
        id: "m1-item7",
        label: "Complete your 60-second company explanation (deliverable)",
        estimatedTime: "30 min",
      },
    ],
    resources: [
      { label: "Marketing Sweet Website", url: "#" },
      { label: "Quodo Website", url: "#" },
      { label: "Company Values Document", url: "#" },
    ],
  },
  {
    id: "module-2",
    title: "MODULE 2 — Marketing Sweet: Our Brand for Existing Websites",
    purpose:
      "Learn about our membership products and extras through M-Quote, our quoting and sales system.",
    proficiency: [
      "Navigate M-Quote confidently",
      "Distinguish between Web Support, SEO Support, and Digital Support memberships",
      "Explain the benefits and ideal client for each membership type",
      "Recommend the appropriate membership based on a client scenario",
    ],
    deliverable:
      "Create a short comparison table in the notes section comparing Web Support vs SEO Support vs Digital Support. Include: target client, key features, and when to recommend each.",
    checklist: [
      {
        id: "m2-item1",
        label: "🔐 Explore M-Quote: Our Quoting & Sales System (Password: MQuote0101)",
        link: "https://app.m-quote.com.au/login?redirect=%2F",
        estimatedTime: "15 min",
      },
      {
        id: "m2-section1",
        label: "Section 1: Our Memberships",
        isSection: true,
      },
      {
        id: "m2-sub-web",
        label: "Web Support",
        isSection: true,
      },
      {
        id: "m2-item2",
        label: "View the PDF Breakdown",
        link: "https://app.m-quote.com.au/pdf/Web-Support.pdf#zoom=150",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item3",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 min",
      },
      {
        id: "m2-item4",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 min",
      },
      {
        id: "m2-item5",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item6",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item7",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/web-support",
        estimatedTime: "10 min",
      },
      {
        id: "m2-sub-seo",
        label: "SEO Support",
        isSection: true,
      },
      {
        id: "m2-item8",
        label: "View the PDF Breakdown",
        link: "https://app.m-quote.com.au/pdf/SEO-Support.pdf#zoom=150",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item9",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 min",
      },
      {
        id: "m2-item10",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 min",
      },
      {
        id: "m2-item11",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item12",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item13",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/seo-support",
        estimatedTime: "10 min",
      },
      {
        id: "m2-sub-digital",
        label: "Digital Support",
        isSection: true,
      },
      {
        id: "m2-item14",
        label: "View the PDF Breakdown",
        link: "https://app.m-quote.com.au/pdf/Digital-Support.pdf#zoom=150",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item15",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 min",
      },
      {
        id: "m2-item16",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 min",
      },
      {
        id: "m2-item17",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item18",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "10 min",
      },
      {
        id: "m2-item19",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/digital-support",
        estimatedTime: "10 min",
      },
      {
        id: "m2-section2",
        label: "Section 2: Our Extras & Once-Off Products",
        isSection: true,
      },
      {
        id: "m2-item20",
        label: "🚧 Coming soon - Section 2 content",
      },
      {
        id: "m2-item21",
        label: "Create your comparison table (deliverable)",
        estimatedTime: "30 min",
      },
    ],
    resources: [
      { label: "M-Quote Login", url: "https://app.m-quote.com.au/login?redirect=%2F" },
    ],
  },
  {
    id: "module-3",
    title: "MODULE 3 — Add-ons & Boosters (Extras + Once-offs)",
    purpose:
      "Learn the difference between ongoing extras and one-time boosters, and identify opportunities to add value through upselling.",
    proficiency: [
      "Explain the difference between ongoing extras and one-time boosters",
      "List common add-ons and their benefits",
      "Identify upsell triggers during client conversations",
      "Articulate when and how to suggest additional services",
    ],
    deliverable:
      "Answer the following questions in the notes section: 1) What is the difference between an 'extra' and a 'booster'? 2) Give 3 examples of each. 3) Describe a scenario where you would suggest an add-on to a client.",
    checklist: [
      {
        id: "m3-item1",
        label: "Read the Extras & Add-ons overview document",
        link: "#",
        estimatedTime: "15 min",
      },
      {
        id: "m3-item2",
        label: "Read the Boosters (Once-offs) overview document",
        link: "#",
        estimatedTime: "15 min",
      },
      {
        id: "m3-item3",
        label: "Watch the 'Identifying Upsell Opportunities' training video",
        link: "#",
        estimatedTime: "25 min",
      },
      {
        id: "m3-item4",
        label: "Review the Add-ons pricing sheet",
        link: "#",
        estimatedTime: "10 min",
      },
      {
        id: "m3-item5",
        label: "Study the 'Trigger Phrases' cheat sheet for upselling",
        link: "#",
        estimatedTime: "15 min",
      },
      {
        id: "m3-item6",
        label: "Complete your deliverable answers in the notes section",
        estimatedTime: "20 min",
      },
    ],
    resources: [
      { label: "Add-ons Catalog", url: "#" },
      { label: "Upselling Best Practices Guide", url: "#" },
    ],
  },
  {
    id: "module-4",
    title: "MODULE 4 — Quodo Product & Plans",
    purpose:
      "Master the Quodo product offering, understand the plan ladder and pricing, and learn how to match clients to the right plan.",
    proficiency: [
      "Explain what Quodo is and its core value proposition",
      "Recall the plan ladder and pricing structure",
      "Choose the appropriate plan for different client scenarios",
      "Share the correct post-meeting link with prospects",
    ],
    deliverable:
      "Write roleplay script notes in the notes section: Prepare a brief script for introducing Quodo to a prospect who currently uses no CRM or automation tools.",
    checklist: [
      {
        id: "m4-item1",
        label: "Watch the Quodo product demo video",
        link: "#",
        estimatedTime: "30 min",
      },
      {
        id: "m4-item2",
        label: "Read the Quodo features overview",
        link: "#",
        estimatedTime: "20 min",
      },
      {
        id: "m4-item3",
        label: "Study the plan ladder and pricing structure",
        link: "#",
        estimatedTime: "15 min",
      },
      {
        id: "m4-item4",
        label: "Review the post-meeting link process",
        link: "#",
        estimatedTime: "10 min",
      },
      {
        id: "m4-item5",
        label: "Practice scenario: Recommend a plan for a solo consultant",
        estimatedTime: "15 min",
      },
      {
        id: "m4-item6",
        label: "Practice scenario: Recommend a plan for a 10-person agency",
        estimatedTime: "15 min",
      },
      {
        id: "m4-item7",
        label: "Write your roleplay script (deliverable)",
        estimatedTime: "30 min",
      },
    ],
    resources: [
      { label: "Quodo Website", url: "#" },
      { label: "Plan Comparison Chart", url: "#" },
      { label: "Post-Meeting Link Generator", url: "#" },
    ],
  },
  {
    id: "module-5",
    title: "MODULE 5 — Sales Admin + Execution Readiness",
    purpose:
      "Demonstrate the complete end-to-end sales flow and understand key sales mindset concepts for success.",
    proficiency: [
      "Demonstrate the end-to-end flow from cold call to booking to admin steps",
      "Explain key sales mindset concepts",
      "Navigate the CRM and booking systems confidently",
      "Complete all required admin tasks accurately",
    ],
    deliverable:
      "In the notes section, write: 1) Your 5-step sales flow from initial contact to closed deal. 2) Mock booking entry notes for a fictional prospect.",
    checklist: [
      {
        id: "m5-item1",
        label: "Watch the 'Cold Call to Close' process video",
        link: "#",
        estimatedTime: "30 min",
      },
      {
        id: "m5-item2",
        label: "Read the Sales Admin checklist document",
        link: "#",
        estimatedTime: "15 min",
      },
      {
        id: "m5-item3",
        label: "Complete CRM navigation tutorial",
        link: "#",
        estimatedTime: "25 min",
      },
      {
        id: "m5-item4",
        label: "Review the booking system walkthrough",
        link: "#",
        estimatedTime: "20 min",
      },
      {
        id: "m5-item5",
        label: "Read the 'Sales Mindset' article",
        link: "#",
        estimatedTime: "15 min",
      },
      {
        id: "m5-item6",
        label: "Watch the 'Handling Objections' training video",
        link: "#",
        estimatedTime: "25 min",
      },
      {
        id: "m5-item7",
        label: "Practice: Complete a mock booking in the CRM",
        estimatedTime: "20 min",
      },
      {
        id: "m5-item8",
        label: "Write your 5-step sales flow + mock booking entry (deliverable)",
        estimatedTime: "30 min",
      },
    ],
    resources: [
      { label: "CRM Login", url: "#" },
      { label: "Booking System", url: "#" },
      { label: "Sales Playbook", url: "#" },
      { label: "Objection Handling Guide", url: "#" },
    ],
  },
];

export function getTotalChecklistItems(): number {
  return trainingProgram.reduce(
    (total, module) => total + module.checklist.length,
    0
  );
}
