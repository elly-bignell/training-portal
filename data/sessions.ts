// data/sessions.ts
//
// Seed sessions for the Sales Training Portal. Three placeholder sessions
// based on the product-brief examples:
//   • Session 00 — Foundations of Selling   (1 May 2026)
//   • Session 01 — Pitch High, Show the Stack, Let Them Choose (7 May 2026)
//   • Session 02 — Big Energy, Better Outcomes (8 May 2026 — NEW)
//
// Asset URLs point at /public/sample-content/... — placeholder PDFs/audio/video
// can be added there later. The admin upload form (Phase 2) will replace these
// with real uploaded assets.

import { Session } from "@/types/sessions";

export const sessions: Session[] = [
  {
    id: "session-02-big-energy",
    number: "02",
    date: "2026-05-08",
    title: "Big Energy, Better Outcomes",
    summary:
      "Bring the energy on every call. The director who picks up the phone with conviction sets the tone for everything that follows.",
    keyTakeaway:
      "The energy you bring sets the ceiling for the call. If you sound bored, the prospect feels bored. If you sound certain, the prospect feels safe. Match the energy of the result you want.",
    director: "Corie Dawson",
    totalTime: "~45 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-02/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "5 min reference",
        url: "/sample-content/session-02/toolkit.pdf",
      },
      {
        kind: "podcast",
        estimate: "20 min listen",
        url: "/sample-content/session-02/podcast.mp3",
        durationSeconds: 1200,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: "/sample-content/session-02/presentation.mp4",
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "9 questions · ~10 min",
        passMark: 80,
        questions: [
          {
            id: "s2-q1",
            type: "multiple-choice",
            prompt:
              "What does 'matching the energy of the result you want' mean in practice?",
            topic: "Energy on the call",
            options: [
              "Talk faster than the prospect to keep momentum",
              "Carry yourself with the conviction of someone who already knows the deal works",
              "Match whatever energy the prospect brings — high or low",
              "Use a louder voice to project confidence",
            ],
            correctAnswer: 1,
            rationale:
              "Energy isn't about volume or speed — it's the quiet conviction that this product solves their problem. Reps who carry that conviction give the prospect permission to feel the same.",
          },
          {
            id: "s2-q2",
            type: "multiple-choice",
            prompt:
              "A prospect says 'I'll need to think about it.' What's the energy mistake to avoid?",
            topic: "Handling stalls",
            options: [
              "Pushing back hard and demanding a decision",
              "Going quiet and letting them off the call without follow-up",
              "Matching their hesitation by softening your tone",
              "Asking a clarifying question with the same conviction you opened with",
            ],
            correctAnswer: 2,
            rationale:
              "Softening your energy when they hesitate signals you also have doubts. The fix is to ask a confident clarifying question — not to plead, not to retreat.",
          },
          {
            id: "s2-q3",
            type: "multiple-choice",
            prompt:
              "Which behaviour most consistently sets a low ceiling on a call?",
            topic: "Energy on the call",
            options: [
              "Sticking too closely to the script",
              "Sounding apologetic or uncertain in the first 30 seconds",
              "Asking too many discovery questions",
              "Jumping into pricing too early",
            ],
            correctAnswer: 1,
            rationale:
              "The prospect calibrates their belief in you in the first 30 seconds. Apologetic openers ('Sorry to bother you...') tell them you don't think this is worth their time — and they'll agree.",
          },
          {
            id: "s2-q4",
            type: "multiple-choice",
            prompt:
              "Big energy is NOT the same as which of the following?",
            topic: "Energy on the call",
            options: [
              "Conviction in the product",
              "Aggressive or pushy salesmanship",
              "Speaking with intent",
              "Being fully present on the call",
            ],
            correctAnswer: 1,
            rationale:
              "Big energy is conviction, not pressure. Pushy reps feel desperate; energetic reps feel certain. Prospects can tell the difference.",
          },
          {
            id: "s2-q5",
            type: "multiple-choice",
            prompt:
              "If you've taken three rejections in a row, what's the energy reset rule?",
            topic: "Energy management",
            options: [
              "Power through — the next call is the one",
              "Stop, reset for 60 seconds, then dial — never carry the last call into the next",
              "Take the rest of the day off",
              "Switch to admin work for an hour",
            ],
            correctAnswer: 1,
            rationale:
              "Carrying rejection energy into the next call almost guarantees you'll lose it too. A 60-second reset — water, deep breath, smile — is the cheapest performance lever in the playbook.",
          },
          {
            id: "s2-q6",
            type: "multiple-choice",
            prompt:
              "Which is the strongest opening line of the four?",
            topic: "Openers",
            options: [
              "Sorry to bother you, do you have a quick second?",
              "Hi — is now an okay time?",
              "Hi [Name], it's [Rep] from Marketing Sweet — I've got something specific for you, do you have two minutes?",
              "Hi, I'm calling from Marketing Sweet about your enquiry — can I just confirm a few details?",
            ],
            correctAnswer: 2,
            rationale:
              "The strong opener names the prospect, names you, gives a reason for the call, and gives them an out — all without apologising for existing.",
          },
          {
            id: "s2-q7",
            type: "short-answer",
            prompt:
              "In your own words, describe what 'big energy' looks like on a discovery call vs a closing call. How does it shift, if at all?",
            topic: "Energy on the call",
            modelAnswer:
              "On a discovery call big energy is curious and engaged — leaning in, asking sharp questions, sounding like you actually want to understand the business. On a closing call it's calm conviction — fewer questions, more statements, quieter but more certain. The energy doesn't drop, it concentrates.",
            keywords: [
              "discovery",
              "curious",
              "questions",
              "closing",
              "conviction",
              "certain",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "Energy isn't a single setting. Discovery rewards curiosity and engagement; closing rewards calm certainty. Both are 'big' — they just point in different directions.",
          },
          {
            id: "s2-q8",
            type: "multiple-choice",
            prompt:
              "What's the cleanest tell that a rep is 'phoning it in' on a call?",
            topic: "Energy on the call",
            options: [
              "They take a long time to get to the point",
              "Their tone doesn't change — every sentence has the same flat melody",
              "They use too many filler words",
              "They don't take notes",
            ],
            correctAnswer: 1,
            rationale:
              "Flat melody = flat conviction. Engaged reps go up and down — emphasis, surprise, agreement. Disengaged reps sound like they're reading a script in a language they don't speak.",
          },
          {
            id: "s2-q9",
            type: "short-answer",
            prompt:
              "Give an example of something you'll do tomorrow — a specific habit or trigger — to bring bigger energy into your first three calls of the day.",
            topic: "Energy management",
            modelAnswer:
              "Stand up for the first three calls. Smile before dialling. Have my opener written on a post-it. Reset for 60 seconds between calls if I take a hit. Drink water before each one. Anything specific and physical.",
            keywords: [
              "stand",
              "smile",
              "opener",
              "reset",
              "water",
              "post-it",
              "specific",
              "physical",
            ],
            keywordsRequired: 2,
            softMinChars: 150,
            rationale:
              "Energy is a physical thing — the reps who manage it deliberately (standing up, smiling, breathing) outperform the reps who try to manage it mentally.",
          },
        ],
      },
    ],
  },

  {
    id: "session-01-pitch-high",
    number: "01",
    date: "2026-05-07",
    title: "Pitch High, Show the Stack, Let Them Choose",
    summary:
      "Stop pitching down out of fear. Show three priced options, pitch the top one with conviction, and let the prospect reveal the budget by which one they pick.",
    keyTakeaway:
      "Stop pitching down out of fear. Show three priced options, pitch high, and let the customer reveal what they can afford by which one they choose.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "12 min read",
        url: "/sample-content/session-01/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "5 min reference",
        url: "/sample-content/session-01/toolkit.pdf",
      },
      {
        kind: "podcast",
        estimate: "22 min listen",
        url: "/sample-content/session-01/podcast.mp3",
        durationSeconds: 1320,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: "/sample-content/session-01/presentation.mp4",
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 80,
        questions: [
          {
            id: "s1-q1",
            type: "multiple-choice",
            prompt:
              "Why do we pitch the highest tier first instead of the middle one?",
            topic: "The three-website demo",
            options: [
              "It anchors the price — every tier below it now feels reasonable",
              "It earns more commission per deal",
              "It's the only tier that includes everything",
              "It scares price-sensitive buyers away early",
            ],
            correctAnswer: 0,
            rationale:
              "Pricing is relative. Pitching the top tier first sets the anchor; the prospect then evaluates the cheaper tiers against it instead of against $0.",
          },
          {
            id: "s1-q2",
            type: "multiple-choice",
            prompt:
              "What does 'let them choose' actually require from the rep?",
            topic: "The three-website demo",
            options: [
              "Reading all three options at the same volume and energy",
              "Pitching the top tier with conviction, then presenting the others without down-selling",
              "Always defaulting to recommending the middle tier",
              "Refusing to give a recommendation when asked",
            ],
            correctAnswer: 1,
            rationale:
              "The whole method falls apart if you pitch the top tier flatly. Conviction on the top + neutral presentation of the others = real choice for the prospect.",
          },
          {
            id: "s1-q3",
            type: "multiple-choice",
            prompt:
              "A prospect interrupts and asks 'just tell me the cheapest one' — what's the right move?",
            topic: "Handling price-led prospects",
            options: [
              "Drop straight to the cheapest tier and close",
              "Refuse and only show the top tier",
              "Acknowledge it, then show all three so they can see what 'cheapest' costs them in features",
              "End the call — they're not the right fit",
            ],
            correctAnswer: 2,
            rationale:
              "If you skip straight to cheapest you've removed the comparison that makes the choice meaningful. Show all three — the prospect can still pick cheapest, but now they're picking it on purpose.",
          },
          {
            id: "s1-q4",
            type: "multiple-choice",
            prompt:
              "Which is NOT a reason reps fall into pitching down?",
            topic: "Mindset — why pitching down happens",
            options: [
              "Fear of being told no",
              "Sympathy with the prospect's budget concerns",
              "Lack of belief in the top tier's value",
              "The top tier is genuinely overpriced for most prospects",
            ],
            correctAnswer: 3,
            rationale:
              "The first three are real, common drivers of pitching down. The fourth is what reps tell themselves to justify it — but the price isn't the problem, the conviction is.",
          },
          {
            id: "s1-q5",
            type: "multiple-choice",
            prompt:
              "After presenting all three options, what's the next thing out of your mouth?",
            topic: "The three-website demo",
            options: [
              "'So... what do you think?'",
              "'Which of those three feels most like the business you want to build?'",
              "'I'd recommend the middle one for someone like you.'",
              "Silence — wait for them to speak first",
            ],
            correctAnswer: 1,
            rationale:
              "The right question forces a choice tied to outcomes, not price. 'What do you think' invites a brush-off. Recommending middle defeats the point. Silence works only sometimes.",
          },
          {
            id: "s1-q6",
            type: "short-answer",
            prompt:
              "Walk through how you'd present the three-tier stack to a small-business owner who's clearly nervous about price. What changes vs your default delivery?",
            topic: "The three-website demo",
            modelAnswer:
              "I'd still pitch high first and pitch it with conviction — the anchor is more important when they're price-anxious. I'd slow down on the value points of the top tier. I'd present the cheaper tiers neutrally without phrases like 'this one's more affordable'. I'd end with the same outcome-framed question.",
            keywords: [
              "pitch high",
              "conviction",
              "anchor",
              "value",
              "neutral",
              "outcome",
              "slow down",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "The instinct with nervous prospects is to soften and pitch lower — exactly the wrong move. The fix is to keep the structure and slow down the conviction so they feel the value before they feel the price.",
          },
          {
            id: "s1-q7",
            type: "multiple-choice",
            prompt:
              "When the prospect picks the cheapest tier, the deal is...",
            topic: "Reading the choice",
            options: [
              "A loss — we should have closed the top tier",
              "A win — they've revealed budget, the deal is theirs to make work",
              "Conditional — needs manager approval",
              "A signal to upsell aggressively next call",
            ],
            correctAnswer: 1,
            rationale:
              "The whole point of the method is to let them reveal the budget. Cheapest tier is real, signed business. Treat it as a win and the upsell happens naturally on the next campaign.",
          },
          {
            id: "s1-q8",
            type: "multiple-choice",
            prompt:
              "Which language pattern signals to a prospect that you don't believe in the top tier?",
            topic: "Mindset — why pitching down happens",
            options: [
              "'Most people in your position go for...'",
              "'This is the one we'd recommend if you want X outcome.'",
              "'Obviously this one's a bit much, but...'",
              "'The top tier includes everything in the others, plus...'",
            ],
            correctAnswer: 2,
            rationale:
              "The word 'obviously' is the tell. The moment you concede that the top tier is 'a bit much,' the prospect agrees — and the deal slides downward.",
          },
        ],
      },
    ],
  },

  {
    id: "session-00-foundations",
    number: "00",
    date: "2026-05-01",
    title: "Foundations of Selling",
    summary:
      "The non-negotiables every rep at Marketing Sweet starts from: belief, structure, and the discipline to follow up.",
    keyTakeaway:
      "Selling at Marketing Sweet rests on three foundations — belief in what you're offering, a repeatable call structure, and the discipline to follow up until you get a yes or a no. None of the three is optional.",
    director: "Corie Dawson",
    totalTime: "~40 min",
    assets: [
      {
        kind: "debrief",
        estimate: "8 min read",
        url: "/sample-content/session-00/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "4 min reference",
        url: "/sample-content/session-00/toolkit.pdf",
      },
      {
        kind: "podcast",
        estimate: "18 min listen",
        url: "/sample-content/session-00/podcast.mp3",
        durationSeconds: 1080,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: "/sample-content/session-00/presentation.mp4",
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "6 questions · ~7 min",
        passMark: 80,
        questions: [
          {
            id: "s0-q1",
            type: "multiple-choice",
            prompt: "What are the three foundations from this session?",
            topic: "The three foundations",
            options: [
              "Belief, structure, follow-up",
              "Energy, scripts, automation",
              "Discovery, demo, close",
              "Volume, conversion, retention",
            ],
            correctAnswer: 0,
            rationale:
              "Belief — in the product. Structure — a repeatable call shape. Follow-up — the discipline to chase to a yes or a no.",
          },
          {
            id: "s0-q2",
            type: "multiple-choice",
            prompt:
              "What's the cost of skipping follow-up on a 'maybe' lead?",
            topic: "Follow-up discipline",
            options: [
              "You preserve the relationship for later",
              "You leave 30-50% of revenue on the table — most deals close on contact 3+",
              "You free up time for fresh leads",
              "Nothing meaningful in the medium term",
            ],
            correctAnswer: 1,
            rationale:
              "Industry data and our own pipeline both show the same thing: most deals close on the third or later contact. Skipping follow-up is the single largest leak in a rep's funnel.",
          },
          {
            id: "s0-q3",
            type: "multiple-choice",
            prompt:
              "Why does belief matter more than the script?",
            topic: "Belief in the product",
            options: [
              "Prospects can hear the difference between conviction and recital",
              "Scripts are illegal to deviate from",
              "Belief makes objections disappear automatically",
              "It's faster to talk without a script",
            ],
            correctAnswer: 0,
            rationale:
              "A great script delivered by an unbelieving rep dies in the first 30 seconds. A clumsy delivery from a believing rep often closes. Belief leaks through every word choice and pause.",
          },
          {
            id: "s0-q4",
            type: "multiple-choice",
            prompt:
              "Which of these is NOT part of the standard call structure?",
            topic: "Repeatable call structure",
            options: [
              "Opener with reason for call",
              "Discovery questions tied to outcomes",
              "Pricing reveal in the first two minutes",
              "Clear next step before hanging up",
            ],
            correctAnswer: 2,
            rationale:
              "Pricing in the first two minutes short-circuits the value conversation. Pricing comes after discovery, after the prospect can see why the value lands.",
          },
          {
            id: "s0-q5",
            type: "short-answer",
            prompt:
              "If you had to coach a brand-new rep on day one, which of the three foundations would you start with and why?",
            topic: "Coaching the foundations",
            modelAnswer:
              "Belief, because everything else collapses without it. A new rep with belief but a shaky structure still sounds engaged and gets second calls. A new rep with perfect structure but no belief sounds like an answering machine and gets ignored. Structure and follow-up can be built on top; belief has to come first.",
            keywords: [
              "belief",
              "first",
              "structure",
              "follow-up",
              "engaged",
              "conviction",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "Belief is the load-bearing foundation. Without it the structure sounds hollow and the follow-up feels desperate. With it, the other two are coachable in weeks.",
          },
          {
            id: "s0-q6",
            type: "multiple-choice",
            prompt:
              "What's the discipline test for follow-up?",
            topic: "Follow-up discipline",
            options: [
              "You stop following up when the prospect says 'maybe'",
              "You stop following up after three attempts regardless of response",
              "You stop following up only on a clear yes or a clear no",
              "You stop following up when the rep on the next desk gives up",
            ],
            correctAnswer: 2,
            rationale:
              "The standard is binary: yes or no. 'Maybe' is not an outcome — it's a signal to follow up again. Stopping early on 'maybe' is how reps under-perform without realising why.",
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
