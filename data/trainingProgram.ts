// data/trainingProgram.ts

import { Module } from "@/types";

export const trainingProgram: Module[] = [
  {
    id: "module-1",
    title: "MODULE 1 — Company & Culture (Estimated: 70 mins)",
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
        estimatedTime: "2 mins",
      },
      {
        id: "m1-item2",
        label: "Read: Part 1 - Our Leader",
        link: "https://docs.google.com/presentation/d/1j9Fn0MgnvEtSOTBDeoA_ykcMM4zT2Jzdlym6PxpKuao/edit?usp=drive_link",
        estimatedTime: "12 mins",
      },
      {
        id: "m1-item2a",
        label: "Watch the Presentation: Part 1 - Our Leader",
        link: "https://youtu.be/0oLYq0ivsQM",
        estimatedTime: "12 mins",
      },
      {
        id: "m1-item2b",
        label: "Listen to the Podcast: Part 1 - Our Leader",
        audioLink: "https://drive.google.com/file/d/1ZyG_-s2xUFYb1ndtjVlH97B7DqTDVrhR/view",
        estimatedTime: "15 mins",
      },
      {
        id: "m1-item3",
        label: "Read: Part 2 - Our People",
        link: "https://docs.google.com/presentation/d/1XWb8y9V24Vs33LGHbVcXQfY8JCkO5sgPICnj6VZBFO4/edit?usp=drive_link",
        estimatedTime: "12 mins",
      },
      {
        id: "m1-item3a",
        label: "Watch the Presentation: Part 2 - Our People",
        link: "https://youtu.be/AEC89q8ky-c",
        estimatedTime: "12 mins",
      },
      {
        id: "m1-item3b",
        label: "Listen to the Podcast: Part 2 - Our People",
        audioLink: "https://drive.google.com/file/d/14b-aZput68-m31o5O0eClFuR7goKWNih/view?usp=drive_link",
        estimatedTime: "15 mins",
      },
      {
        id: "m1-item4",
        label: "Read: Part 3 - Our Company",
        link: "https://docs.google.com/presentation/d/1Ikb2YP96r-QwZPkpsYqS2QBaB-_qQ6qNbFfRl81jq2A/edit?usp=drive_link",
        estimatedTime: "10 mins",
      },
      {
        id: "m1-item4a",
        label: "Watch the Presentation: Part 3 - Our Company",
        link: "https://youtu.be/sPEEv1yx3I8",
        estimatedTime: "10 mins",
      },
      {
        id: "m1-item4b",
        label: "Listen to the Podcast: Part 3 - Our Company",
        audioLink: "https://drive.google.com/file/d/15R1PfzWSm-v0I4hY2t18pbT8Hsq8d38v/view?usp=drive_link",
        estimatedTime: "15 mins",
      },
      {
        id: "m1-item5",
        label: "Read some of our Google Reviews",
        link: "https://sweetgroup.marketingsweet.com.au/google-reviews",
        estimatedTime: "15 mins",
      },
    ],
    resources: [
      { label: "Marketing Sweet Website", url: "https://marketingsweet.com.au/" },
      { label: "Quodo Website", url: "https://www.quodo.com.au/" },
    ],
    questionnaires: [
      {
        id: "q-m1",
        title: "Module 1 Questionnaire: Company & Culture",
        description: "Record a short video response to each question demonstrating your understanding of who we are, what we do, and why clients trust us.",
        afterItemId: "m1-item5",
        questionCount: 6,
      },
    ],
  },
  {
    id: "module-2",
    title: "MODULE 2 — Marketing Sweet: Our Brand for Existing Websites (Estimated: 5 hrs 8 mins)",
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
        label: "🔐 Launch M-Quote to complete this module (Password: MQuote0101)",
        link: "https://app.m-quote.com.au/login?redirect=%2F",
      },
      {
        id: "m2-section1",
        label: "Section 1: Our Memberships",
        isSection: true,
      },
      {
        id: "m2-sub-web",
        label: "1. Web Support",
        isSection: true,
      },
      {
        id: "m2-item2",
        label: "View the PDF Breakdown",
        link: "https://app.m-quote.com.au/pdf/Web-Support.pdf#zoom=150",
        estimatedTime: "2 mins",
      },
      {
        id: "m2-item3",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item4",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "2 mins",
      },
      {
        id: "m2-item5",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "12 mins",
      },
      {
        id: "m2-item6",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 mins",
      },
      {
        id: "m2-item7",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/web-support",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-seo",
        label: "2. SEO Support",
        isSection: true,
      },
      {
        id: "m2-item8",
        label: "View the PDF Breakdown",
        link: "https://app.m-quote.com.au/pdf/SEO-Support.pdf#zoom=150",
        estimatedTime: "2 mins",
      },
      {
        id: "m2-item9",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item10",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "2 mins",
      },
      {
        id: "m2-item11",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "13 mins",
      },
      {
        id: "m2-item12",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "6 mins",
      },
      {
        id: "m2-item13",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/seo-support",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-digital",
        label: "3. Digital Support",
        isSection: true,
      },
      {
        id: "m2-item14",
        label: "View the PDF Breakdown",
        link: "https://app.m-quote.com.au/pdf/Digital-Support.pdf#zoom=150",
        estimatedTime: "2 mins",
      },
      {
        id: "m2-item15",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item16",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "2 mins",
      },
      {
        id: "m2-item17",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "14 mins",
      },
      {
        id: "m2-item18",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "6 mins",
      },
      {
        id: "m2-item19",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/digital-support",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-section2",
        label: "Section 2: Our Extras & Once-Off Products",
        isSection: true,
      },
      {
        id: "m2-sub-extras",
        label: "Extras",
        isSection: true,
      },
      {
        id: "m2-sub-webchanges",
        label: "1. Web Changes",
        isSection: true,
      },
      {
        id: "m2-item22",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item23",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item24",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "13 mins",
      },
      {
        id: "m2-item25",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 mins",
      },
      {
        id: "m2-item26",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/web-changes",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-seobacklinking",
        label: "2. SEO Backlinking",
        isSection: true,
      },
      {
        id: "m2-item27",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item28",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item29",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "11 mins",
      },
      {
        id: "m2-item30",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "6 mins",
      },
      {
        id: "m2-item31",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/seo-backlinking",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-seopagebuilding",
        label: "3. SEO Page Building",
        isSection: true,
      },
      {
        id: "m2-item32",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item33",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item34",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "11 mins",
      },
      {
        id: "m2-item35",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "6 mins",
      },
      {
        id: "m2-item36",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/seo-page-building",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-googleads",
        label: "4. Google Ads",
        isSection: true,
      },
      {
        id: "m2-item37",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item38",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item39",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "14 mins",
      },
      {
        id: "m2-item40",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "6 mins",
      },
      {
        id: "m2-item41",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/google-ads",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-onceoffs",
        label: "Once Offs",
        isSection: true,
      },
      {
        id: "m2-sub-onceoff-pagebuilding",
        label: "1. Page Building",
        isSection: true,
      },
      {
        id: "m2-item42",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item43",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item44",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "12 mins",
      },
      {
        id: "m2-item45",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 mins",
      },
      {
        id: "m2-item46",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/once-off-page-building",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-onceoff-webchanges",
        label: "2. Web Changes",
        isSection: true,
      },
      {
        id: "m2-item47",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item48",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item49",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-item50",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "5 mins",
      },
      {
        id: "m2-item51",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/web-changes-hourly",
        estimatedTime: "10 mins",
      },
      {
        id: "m2-sub-onceoff-seooverhaul",
        label: "3. SEO Overhaul",
        isSection: true,
      },
      {
        id: "m2-item52",
        label: "Read the Short Description",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item53",
        label: "Listen to the Explainer",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "1 min",
      },
      {
        id: "m2-item54",
        label: "Listen to the Podcast",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "13 mins",
      },
      {
        id: "m2-item55",
        label: "Watch the Presentation",
        link: "https://app.m-quote.com.au/",
        estimatedTime: "6 mins",
      },
      {
        id: "m2-item56",
        label: "Read the Long Description",
        link: "https://app.m-quote.com.au/seo-overhaul",
        estimatedTime: "10 mins",
      },
    ],
    resources: [
      { label: "M-Quote Login", url: "https://app.m-quote.com.au/login?redirect=%2F" },
    ],
    questionnaires: [
      {
        id: "q-m2-s1",
        title: "Section 1 Questionnaire: Our Memberships",
        description: "Record a short video response to each question demonstrating your understanding of Web Support, SEO Support, and Digital Support memberships.",
        afterItemId: "m2-item19",
        questionCount: 8,
      },
      {
        id: "q-m2-s2",
        title: "Section 2 Questionnaire: Extras & Once-Off Products",
        description: "Record a short video response to each question demonstrating your understanding of our extras and once-off products.",
        afterItemId: "m2-item56",
        questionCount: 7,
      },
    ],
  },
  {
    id: "module-3",
    title: "MODULE 3 — Quodo: Our Brand for Replacing Websites (Estimated: 45 mins)",
    purpose:
      "Master the Quodo product offering, understand the plan ladder and pricing, and learn how to match clients to the right plan.",
    proficiency: [
      "Explain what Quodo is and its core value proposition",
      "Navigate Q-Quote confidently",
      "Recall the plan ladder and pricing structure",
      "Choose the appropriate plan for different client scenarios",
    ],
    deliverable:
      "Write a brief summary in the notes section explaining the key differences between Bronze, Silver, Gold, Platinum, and Diamond plans. When would you recommend each?",
    checklist: [
      {
        id: "m3-item1",
        label: "🔐 Launch Q-Quote to complete this module (Password: QQuote0101)",
        link: "https://www.app.quodo.com.au/plans",
      },
      {
        id: "m3-section1",
        label: "Our Plans",
        isSection: true,
      },
      {
        id: "m3-sub-bronze",
        label: "1. Bronze",
        isSection: true,
      },
      {
        id: "m3-item2",
        label: "Play the Service Walkthrough",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "3 mins",
      },
      {
        id: "m3-item3",
        label: "See the Sitemap",
        link: "https://www.app.quodo.com.au/sitemaps/bronze-sitemap.png",
        estimatedTime: "2 mins",
      },
      {
        id: "m3-item4",
        label: "Play the Payment Options",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "4 mins",
      },
      {
        id: "m3-sub-silver",
        label: "2. Silver",
        isSection: true,
      },
      {
        id: "m3-item5",
        label: "Play the Service Walkthrough",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "3 mins",
      },
      {
        id: "m3-item6",
        label: "See the Sitemap",
        link: "https://www.app.quodo.com.au/sitemaps/silver-sitemap.png",
        estimatedTime: "2 mins",
      },
      {
        id: "m3-item7",
        label: "Play the Payment Options",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "4 mins",
      },
      {
        id: "m3-sub-gold",
        label: "3. Gold",
        isSection: true,
      },
      {
        id: "m3-item8",
        label: "Play the Service Walkthrough",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "3 mins",
      },
      {
        id: "m3-item9",
        label: "See the Sitemap",
        link: "https://www.app.quodo.com.au/sitemaps/gold-sitemap.png",
        estimatedTime: "2 mins",
      },
      {
        id: "m3-item10",
        label: "Play the Payment Options",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "4 mins",
      },
      {
        id: "m3-sub-platinum",
        label: "4. Platinum",
        isSection: true,
      },
      {
        id: "m3-item11",
        label: "Play the Service Walkthrough",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "3 mins",
      },
      {
        id: "m3-item12",
        label: "See the Sitemap",
        link: "https://www.app.quodo.com.au/sitemaps/gold-sitemap.png",
        estimatedTime: "2 mins",
      },
      {
        id: "m3-item13",
        label: "Play the Payment Options",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "4 mins",
      },
      {
        id: "m3-sub-diamond",
        label: "5. Diamond",
        isSection: true,
      },
      {
        id: "m3-item14",
        label: "Play the Service Walkthrough",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "3 mins",
      },
      {
        id: "m3-item15",
        label: "See the Sitemap",
        link: "https://www.app.quodo.com.au/sitemaps/diamond-sitemap.png",
        estimatedTime: "2 mins",
      },
      {
        id: "m3-item16",
        label: "Play the Payment Options",
        link: "https://www.app.quodo.com.au/plans",
        estimatedTime: "4 mins",
      },
    ],
    resources: [
      { label: "Q-Quote Login", url: "https://www.app.quodo.com.au/plans" },
    ],
    questionnaires: [
      {
        id: "q-m3",
        title: "Module 3 Questionnaire: Quodo Plans",
        description: "Record a short video response to each question demonstrating your understanding of the Quodo plan ladder and how to match clients to the right plan.",
        afterItemId: "m3-item16",
        questionCount: 7,
      },
    ],
  },
];

export function getTotalChecklistItems(): number {
  return trainingProgram.reduce(
    (total, module) => total + module.checklist.filter(item => !item.isSection).length,
    0
  );
}
