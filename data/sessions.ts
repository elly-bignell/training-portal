// data/sessions.ts
//
// Real session content for Marketing Sweet's Sales Training Portal.
//   • Session 02 — Big Energy, Better Research, Stop Hunting Excuses
//                  (Friday 8 May 2026)
//   • Session 01 — Pitch High, Show the Stack, Let the Customer Choose
//                  (Thursday 7 May 2026)
//
// PDF debriefs are committed to /public/sample-content/. Audio/video assets
// are hosted externally (placeholder URLs below — replace with real CDN /
// Vercel Blob / Drive embed URLs when those are set up).

import { Session } from "@/types/sessions";

// Set this to the URL where the audio/video are eventually hosted.
// While unset (empty string), the players will 404 — that's fine for a UI
// preview but obviously the real ones need to be plugged in.
const MEDIA_BASE = ""; // e.g. "https://cdn.marketingsweet.com.au/sales-training"

export const sessions: Session[] = [
  {
    id: "session-02-big-energy",
    number: "02",
    date: "2026-05-08",
    title: "Big Energy, Better Research, Stop Hunting Excuses",
    summary:
      "The same scripts in a low-energy, under-researched, under-believing rep produce nothing. The deal is mostly won before you walk in the room — by your preparation, your belief, and the energy you bring.",
    keyTakeaway:
      "The same scripts in a low-energy, under-researched, under-believing rep produce nothing. The deal is mostly won before you walk in the room — by your preparation, your belief, and the energy you bring.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "12 min read",
        url: "/sample-content/session-02-big-energy/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "5 min reference",
        url: "/sample-content/session-02-big-energy/toolkit.pdf",
      },
      {
        kind: "podcast",
        estimate: "~30 min listen",
        url: `${MEDIA_BASE}/session-02-big-energy/podcast.m4a`,
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "~15 min watch",
        url: `${MEDIA_BASE}/session-02-big-energy/presentation.mp4`,
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "10 questions · ~10 min",
        passMark: 80,
        questions: [
          {
            id: "s2-q1",
            type: "multiple-choice",
            prompt: "After a lost deal, your only allowed next thought should be:",
            topic: "Solutions vs excuses",
            options: [
              "Why the prospect was a bad fit",
              "What you will do differently next time",
              "Whether the market is bad right now",
              "Whether the price was wrong",
            ],
            correctAnswer: 1,
            rationale:
              "Your brain auto-generates reasons (\"excuses\") to protect your ego. Override it. The only allowed thought is one specific behaviour you will change — about your own actions, not the prospect, the market, or the price.",
          },
          {
            id: "s2-q2",
            type: "multiple-choice",
            prompt:
              "In the energy-magnet metaphor, the two magnets you must keep running every day are:",
            topic: "Energy management",
            options: [
              "Pull customers in / push competitors away",
              "Pull success in / push failure away",
              "Pull money in / push debt away",
              "Pull leads in / push admin away",
            ],
            correctAnswer: 1,
            rationale:
              "Pull the right people, energy, information and beliefs toward you. Push reasons, doubt, and toxic influences away. Both magnets, every day. Without curation, you end up with \"a mixture of everything\" — exhausting, and it shows in your close rate.",
          },
          {
            id: "s2-q3",
            type: "multiple-choice",
            prompt: "What does the \"5 P's\" stand for?",
            topic: "Research and preparation",
            options: [
              "Pitch, Price, Product, Process, People",
              "Plan, Prepare, Practice, Pitch, Persist",
              "Prior Preparation Prevents Poor Performance",
              "Probe, Pitch, Pause, Pivot, Push",
            ],
            correctAnswer: 2,
            rationale:
              "Prior Preparation Prevents Poor Performance. If you can't recite the prospect's turnover, staff count, average job value, and main competitor — postpone the meeting. Don't wing it.",
          },
          {
            id: "s2-q4",
            type: "multiple-choice",
            prompt:
              "A prospect tells you their monthly turnover. Your default rule of thumb is:",
            topic: "Estimating prospect numbers",
            options: [
              "Trust the number they give you",
              "Subtract 20% to be conservative",
              "Multiply by approximately 2x",
              "Ignore turnover, focus only on jobs per day",
            ],
            correctAnswer: 2,
            rationale:
              "Reps under-state their numbers to salespeople. Multiply by ~2x as a baseline. And on every estimate where you don't have hard data — default to the TOP of the plausible range. There is no upside to going in low.",
          },
          {
            id: "s2-q5",
            type: "multiple-choice",
            prompt: "The pre-meeting confirmation call should be:",
            topic: "Pre-meeting confirmation call",
            options: [
              "Five minutes, comprehensive review of the whole pitch",
              "60 seconds, three quick questions, you hang up first",
              "However long the prospect needs",
              "Replaced with an email instead",
            ],
            correctAnswer: 1,
            rationale:
              "High energy. Three questions max. You hang up first — if they say \"I've got to go\" before you wrap, you've overstayed. The whole point is to set Friday's tone and gather the last data points you need.",
          },
          {
            id: "s2-q6",
            type: "multiple-choice",
            prompt:
              "Which of these is a \"7/10 word\" Corie wants you to replace with a stronger power word?",
            topic: "Power words",
            options: ["Perfect", "Excellent", "Amazing", "Superb"],
            correctAnswer: 1,
            rationale:
              "\"Excellent\" is polite but carries no force — Corie called it a 7/10 word. Replace with \"perfect,\" \"amazing,\" \"incredible,\" or \"superb opportunity.\" Words that land.",
          },
          {
            id: "s2-q7",
            type: "multiple-choice",
            prompt: "The principle behind the \"silly me\" recovery is:",
            topic: "Price recovery",
            options: [
              "Customers warm to quirky salespeople",
              "When you panic-drop the price you confirm the original was inflated; when you re-engineer the package you confirm the original was real",
              "It's the fastest way to negotiate",
              "It's legally required to discount this way",
            ],
            correctAnswer: 1,
            rationale:
              "Same final price, completely different relationship. Re-engineering arrives at a lower number with you as the expert solving their problem cleverly. Panic-dropping arrives at the same number with you as a tentative seller. Authority preserved either way? Only one way.",
          },
          {
            id: "s2-q8",
            type: "multiple-choice",
            prompt:
              "A prospect tells you they need to run it past their business coach first. The right play is:",
            topic: "Handling third-party objections",
            options: [
              "Argue that business coaches are biased against this kind of decision",
              "Drop the price significantly to undercut the coach's recommendation",
              "Plant a seed of doubt about the coach, predict the timeline, concede gracefully",
              "Email the coach directly to make your case",
            ],
            correctAnswer: 2,
            rationale:
              "Lose the battle today, win the war in 6 months. Plant the seed (\"coaches don't love this kind of thing — focused on getting fees out of you\"), predict the timeline (\"three to six months in you'll be back\"), then concede gracefully and don't pursue. The seed does the work.",
          },
          {
            id: "s2-q9",
            type: "short-answer",
            prompt:
              "Why is real belief in the product non-negotiable, even with a perfect script? (2–3 sentences)",
            topic: "Belief in the product",
            modelAnswer:
              "Sales is energy transfer. If you don't fully believe the product solves the prospect's problem, the customer will feel the doubt regardless of what you say — and they'll treat your hesitation as a signal that something is wrong with the offer. A belief gap is a research problem, not a sales problem. Fix it before the next pitch by talking to delivery, seeing the work, and getting clarity on the case studies.",
            keywords: [
              "belief",
              "energy",
              "feel",
              "doubt",
              "research",
              "delivery",
              "case studies",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "Belief leaks through every word, pause, and inflection. The customer is reading you, not just listening to you — and a belief gap is felt instantly. The fix is research and exposure to delivery, not better wording.",
          },
          {
            id: "s2-q10",
            type: "short-answer",
            prompt:
              "Define what Corie means by \"real rapport\" and explain how you build it before a meeting.",
            topic: "Rapport",
            modelAnswer:
              "Real rapport is when information that was already in the prospect's head comes out of YOUR mouth — facts about their business they assumed only they knew (turnover, average job value, main competitor, monthly volume). It's built through research before the meeting (the 5 P's) — not through small talk. Reflecting their own data back to them collapses trust into the conversation in seconds.",
            keywords: [
              "rapport",
              "research",
              "head",
              "mouth",
              "business",
              "turnover",
              "trust",
              "preparation",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "Rapport is not small talk. It's reflecting back facts only they thought they knew. That requires homework, not charm. Two minutes of well-aimed research outperforms ten minutes of weather chat every time.",
          },
        ],
      },
    ],
  },

  {
    id: "session-01-pitch-high",
    number: "01",
    date: "2026-05-07",
    title: "Pitch High, Show the Stack, Let the Customer Choose",
    summary:
      "Stop pitching down out of fear. Show three priced options, pitch high, and let the customer reveal what they can afford by what they choose — not by what they say.",
    keyTakeaway:
      "Stop pitching down out of fear. Show three priced options, pitch high, and let the customer reveal what they can afford by what they choose — not by what they say.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "12 min read",
        url: "/sample-content/session-01-pitch-high/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "5 min reference",
        url: "/sample-content/session-01-pitch-high/toolkit.pdf",
      },
      {
        kind: "podcast",
        estimate: "~30 min listen",
        url: `${MEDIA_BASE}/session-01-pitch-high/podcast.m4a`,
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "~15 min watch",
        url: `${MEDIA_BASE}/session-01-pitch-high/presentation.mp4`,
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "9 questions · ~10 min",
        passMark: 80,
        questions: [
          {
            id: "s1-q1",
            type: "multiple-choice",
            prompt: "When pricing a website rebuild, which approach does Corie recommend?",
            topic: "Pitching the stack",
            options: [
              "Start with the lowest tier so you don't scare them off",
              "Match what you think their budget is",
              "Pitch the highest tier first and let the customer work down",
              "Avoid talking price entirely until they ask",
            ],
            correctAnswer: 2,
            rationale:
              "Buyers always negotiate down — nobody walks a price up. Your starting number sets the ceiling. Pitching medium gets you low; pitching high gets you medium.",
          },
          {
            id: "s1-q2",
            type: "multiple-choice",
            prompt:
              "After showing the prospect three priced website examples, what is the right question to ask?",
            topic: "The three-website demo",
            options: [
              "\"What's your budget?\"",
              "\"Can you afford the top tier?\"",
              "\"Which one do you like the look of best?\"",
              "\"Which one fits your needs?\"",
            ],
            correctAnswer: 2,
            rationale:
              "Asking visual preference reveals price tolerance without ever asking budget. Corie called \"what's your budget?\" offensive and lazy. The customer's pick is their real spend tolerance — they self-qualify.",
          },
          {
            id: "s1-q3",
            type: "multiple-choice",
            prompt:
              "When a prospect says \"I need to think about it,\" the diagnostic categorises this objection into three real causes. Which is NOT one of them?",
            topic: "Handling \"I need to think\"",
            options: [
              "Price",
              "Trust",
              "Spouse / partner approval",
              "They genuinely need more product detail",
            ],
            correctAnswer: 3,
            rationale:
              "\"I need to think\" is almost never about thinking. It's price (most common — recoverable), trust (you said something off — usually unrecoverable in the call), or spouse approval (genuine — easy to handle).",
          },
          {
            id: "s1-q4",
            type: "multiple-choice",
            prompt:
              "You've negotiated a website price down. The prospect asked for $800. Why is $825 a stronger close than $800?",
            topic: "Closing on odd numbers",
            options: [
              "Round numbers feel more honest to customers",
              "The extra $25 covers admin costs",
              "Odd numbers signal \"best I could do\"; round numbers signal you had room",
              "Customers psychologically prefer odd-numbered prices",
            ],
            correctAnswer: 2,
            rationale:
              "Round prices say \"I had more wiggle room.\" Odd prices say \"I genuinely squeezed every drop.\" The slight regret tone — \"sorry I couldn't quite get there\" — does the closing work.",
          },
          {
            id: "s1-q5",
            type: "multiple-choice",
            prompt:
              "A prospect with money tells you they need a full week to think about it. The recommended approach is:",
            topic: "Drop the rope",
            options: [
              "Call them every day until they decide",
              "Drop the price to incentivise action",
              "Don't chase — drop the rope and let them come back if they're real",
              "Send them more case studies to address their concerns",
            ],
            correctAnswer: 2,
            rationale:
              "A full week from a real-money prospect translates to: \"I don't trust you yet.\" You can't recover that on the call. The most offensive thing on earth is a salesperson making it clear the prospect is valuable. Pull back. Their reaction tells you if it was real.",
          },
          {
            id: "s1-q6",
            type: "multiple-choice",
            prompt:
              "In the Charlotte Tilbury vs $12.50 foundation example, what does cheap pricing trigger in the customer's brain?",
            topic: "Price psychology",
            options: [
              "Excitement at finding a bargain",
              "Distrust, suspicion, and questions about ingredients",
              "Loyalty to the cheaper brand",
              "Increased likelihood of trying the product",
            ],
            correctAnswer: 1,
            rationale:
              "Cheap = unsafe = suspicious. The customer interrogates ingredients, longevity, and outcomes. High price reads as quality and safety — like the $370 collagen. When you walk in with a $3,000 website quote, the prospect hears \"cheap and risky.\"",
          },
          {
            id: "s1-q7",
            type: "multiple-choice",
            prompt:
              "When delivering the line \"best I could do is $825,\" what tone should you use?",
            topic: "Closing on odd numbers",
            options: [
              "Triumphant — celebrate the close",
              "Relieved — the negotiation is finally done",
              "Slightly disappointed — like you've let them down a little",
              "Casual and matter-of-fact",
            ],
            correctAnswer: 2,
            rationale:
              "Triumph signals you had the room all along. Slight regret sells the squeeze — the customer feels like they pulled the maximum out of you, not the other way around.",
          },
          {
            id: "s1-q8",
            type: "short-answer",
            prompt:
              "A prospect tells you \"I just need to talk to my husband/wife before deciding.\" Outline the recommended response in 2–3 sentences.",
            topic: "Handling \"I need to think\"",
            modelAnswer:
              "Treat it as a buying signal, not an objection. Reassure them, give your direct number for any questions, and reverse the timeline — they asked for one day, you give them four. Book the follow-up call right then (e.g. \"I'll call Monday at 11\"). About 80% close on the next contact.",
            keywords: [
              "buying signal",
              "reassure",
              "direct",
              "number",
              "reverse",
              "timeline",
              "book",
              "follow-up",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "Spousal approval is not an objection — it's a buying signal. Don't argue. Reassure, give them more time than they asked for, and book the next call. ~80% close on contact two.",
          },
          {
            id: "s1-q9",
            type: "short-answer",
            prompt:
              "Why do we show the prospect three websites at three different price points instead of just one tailored to their stated budget?",
            topic: "The three-website demo",
            modelAnswer:
              "To the customer, all three websites look \"fine\" — they can't actually tell quality apart. What they're really doing when they pick one is telling you which price feels safe. Showing three tiers lets the prospect self-select their real spend without us ever having to ask budget. Plus the high tier reframes the lower tiers as bargains.",
            keywords: [
              "three",
              "tiers",
              "self-select",
              "anchor",
              "budget",
              "price",
              "feel",
              "safe",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "The customer can't tell the websites apart on quality. They're really telling you which price feels safe. The high tier anchors. The three-tier display does the qualifying for you, without an offensive budget question.",
          },
        ],
      },
    ],
  },
];

/** Look-up by id (used by /sessions/[id] route). */
export function getSessionById(id: string): Session | undefined {
  return sessions.find((s) => s.id === id);
}

/** Get the quiz asset off a session, or undefined. */
export function getQuiz(session: Session) {
  return session.assets.find((a) => a.kind === "quiz");
}
