// data/sessions.ts
//
// Real session content for Marketing Sweet's Sales Training Portal.
//   • Session 03 — Obsession is the Multiplier, Balance is the Scam
//                  (Monday 11 May 2026)
//   • Session 02 — Big Energy, Better Research, Stop Hunting Excuses
//                  (Friday 8 May 2026)
//   • Session 01 — Pitch High, Show the Stack, Let the Customer Choose
//                  (Thursday 7 May 2026)
//
// Quiz answer positions are intentionally spread across A/B/C/D so reps
// can't guess from pattern. Pass mark is calculated on MC questions only
// — short-answer responses are stored and reviewed by trainers, not graded.

import { Session } from "@/types/sessions";

// Drive file IDs for podcast and presentation media. We render these as
// iframe embeds via https://drive.google.com/file/d/<id>/preview. Reps
// access them with their existing Marketing Sweet Google Workspace login.
const drivePreview = (id: string) =>
  `https://drive.google.com/file/d/${id}/preview`;

export const sessions: Session[] = [
  // ─── Featured: BONUS SESSION (Client Growth Outreach) ─────────────────────
  // One-off feature session. Single video, no PDF, no quiz, no learning
  // path. Renders as a full-width banner above the normal grid on the home
  // page and uses a stripped-down hero on the detail page. Originally
  // labelled "Session 14" — now reframed as a BONUS so it doesn't collide
  // with the standard Session 14 (Frame It. Don't Spin It., 25 May 2026).
  // The id stays as session-14-client-growth-outreach so existing progress
  // records and URLs continue to work.
  {
    id: "session-14-client-growth-outreach",
    number: "B",
    date: "2026-05-21",
    title: "Client Growth Outreach",
    summary:
      "Watch the full video — the new direction for client outreach across the whole team.",
    keyTakeaway:
      "One video. Watch it end-to-end and understand it. This is the new direction for client growth outreach across the team.",
    director: "Corie Dawson",
    totalTime: "~10 min",
    featured: true,
    bannerLabel: "BONUS SESSION",
    assets: [
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1d8Z3Gip5XqaWwKLT0ZYwfVaYbCnOv3yr"),
        mode: "video",
      },
    ],
  },
  // ─── Session 23 — Sales Competition Strategy. (Jun 2026) ────────────────
  // Sales + Lead Gen (LG #16). CS excluded via salesOnly. Internal strategy
  // note about the redesign of the sales competition itself — full 6-asset
  // set so it reads alongside the regular sessions in the grid.
  {
    id: "session-23-competition-strategy",
    number: "23",
    date: "2026-06-03",
    title: "Sales Competition Strategy. From Bookings to Deals.",
    summary:
      "Why the competition was redesigned: the per-booking incentive grew attendance but didn't push deals. The new structure points reps at deals (sliding-scale bonuses, the wheel with variable rewards) and keeps the booking bonus as a recruitment lever and safety net for the next ten hires.",
    keyTakeaway:
      "Shift the incentive to deals. Keep the booking safety net for recruitment. Spin the wheel for the highs. Build the system for the next ten hires, not just today's team.",
    director: "Corie Dawson",
    totalTime: "~45 min",
    salesOnly: true,
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-23-competition-strategy/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-23-competition-strategy/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: "https://youtu.be/6sckdBVxaas",
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1QeIKKkL4e9k0n2gYdwg5Wwbx9xNSdeS0"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1btL6ZfVO7J_9rqUQ8u5QUHiv7a6BcyrQ"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s23-q1",
            type: "multiple-choice",
            prompt:
              "Why is the headline metric of the new competition deals rather than bookings?",
            topic: "Metric shift",
            options: [
              "Because closers have complained that bookings are too easy",
              "Because deals are the outcome the agency actually wants — paying for bookings encourages reps to value attendance over conversion",
              "Because deals are harder to game than bookings",
              "Because the lead-gen team needs a new challenge",
            ],
            correctAnswer: 1,
            rationale:
              "Pay for the outcome you want. The team noticed it themselves — when the bonus was paid on attendance, reps got hungry for bookings that attended, not bookings that closed. The headline metric shapes behaviour. Shift the metric to deals, and the behaviour follows.",
          },
          {
            id: "s23-q2",
            type: "multiple-choice",
            prompt:
              "Why is the per-booking bonus being kept in the structure — even though experienced reps would happily lose it for a larger deal bonus?",
            topic: "Safety net for recruitment",
            options: [
              "Because it's contractually required",
              "Because the lead-gen team would quit without it",
              "Because it functions as a recruitment lever and a safety net for new hires — they need wins from day one, before they've learned to close",
              "Because removing it would create a tax problem",
            ],
            correctAnswer: 2,
            rationale:
              "The booking bonus is doing two jobs: recruitment lever (\"three layers of income from day one\") and safety net for new hires (wins before they've learned to close). Veterans don't need it; tomorrow's new hire does. The structure has to work for both.",
          },
          {
            id: "s23-q3",
            type: "multiple-choice",
            prompt:
              "The wheel rewards a mix of cash, experiences, mystery prizes, and a small \"booby trap\" reward. Why include the booby trap?",
            topic: "Variable reinforcement",
            options: [
              "To punish reps who didn't deserve a spin",
              "Because predictable upside fades — variable rewards with the possibility of landing on something small keep engagement sticky over time",
              "To save money on the prize pool",
              "Because tradition dictates it",
            ],
            correctAnswer: 1,
            rationale:
              "Variable reinforcement is the principle. The brain stops feeling predictable rewards after a while. Mixing in a small chance of an under-reward keeps the rest of the wheel feeling exciting. The booby trap is novelty, not punishment — and it's the contrast that makes the highs land.",
          },
          {
            id: "s23-q4",
            type: "multiple-choice",
            prompt:
              "The competition has two qualifying paths — an individual spin (three consecutive closes) and a team spin (ten deals across the team in a week). Why two paths?",
            topic: "Two incentive geometries",
            options: [
              "Because the lead-gen team and the closers can't agree on a single path",
              "Because two paths means twice the rewards paid out",
              "Because different incentive geometries drive different behaviours — individual spins reward focused weeks, team spins reward behaviour that benefits both lead-gen and closers",
              "Because some reps work alone and others work in pairs",
            ],
            correctAnswer: 2,
            rationale:
              "Different geometries for different behaviours. The individual spin rewards a rep having a focused week. The team spin rewards lead-gen handing over quality bookings AND closers converting them — both teams have to perform for the team spin to land. One path alone misses one of those behaviours.",
          },
          {
            id: "s23-q5",
            type: "multiple-choice",
            prompt:
              "What's the leadership principle behind the phrase \"give people what they want first, and you'll always get what you want in the end\"?",
            topic: "Give people what they want",
            options: [
              "Pay rises should be automatic to keep reps loyal",
              "Reps will only deliver if they feel financially rewarded first",
              "Designing incentive structures around what the team genuinely values (not just what the company wants extracted) produces durable performance and retention — extracting maximum margin from the incentive backfires in the medium term",
              "Compensation should always lead the market",
            ],
            correctAnswer: 2,
            rationale:
              "The principle is that durable performance comes from designing for what the team values, not from extracting maximum margin from the incentive. Reps who feel the structure was built for them will sustain effort. Reps who feel it was built against them won't — they'll leave or coast. Short-term cost savings, long-term attrition.",
          },
          {
            id: "s23-q6",
            type: "multiple-choice",
            prompt:
              "Why is the competition designed with the next ten hires in mind, not just today's team?",
            topic: "Build for tomorrow's team",
            options: [
              "Because the current team is about to be replaced",
              "Because the agency needs more reps",
              "Because the incentive structure has to work as well for a brand-new rep on day one as it does for a veteran on day 500 — the system is built for the team that will exist in a year, not just the team that exists today",
              "Because new hires get better bonuses than veterans",
            ],
            correctAnswer: 2,
            rationale:
              "The current team will absorb new reps continually. The structure has to work for a brand-new rep on day one (where the safety net matters) and a veteran on day 500 (where the deal bonus matters). Designing only for today's team produces a system that breaks the moment the team changes.",
          },
          {
            id: "s23-q7",
            type: "multiple-choice",
            prompt:
              "What does \"10x via leverage, not skill\" mean in the context of a sales career?",
            topic: "Leverage beats skill",
            options: [
              "Use technology to close ten times more deals per hour",
              "Earning ten times more comes from learning to recruit and develop other reps — not from getting personally better at closing. A rep who doubles their closing skill roughly doubles their income; a rep who learns to onboard others can compound their income",
              "Charge ten times more per deal to existing clients",
              "Spend ten times more hours on the phone",
            ],
            correctAnswer: 1,
            rationale:
              "The maths is stark. A rep who doubles their closing skill roughly doubles their income. A rep who learns to recruit and develop other reps can compound their income — because they multiply outputs across multiple people. The competition is designed to reward that compounding (via the team spin and the recruitment-pitch incentive), not just individual heroics.",
          },
        ],
      },
    ],
  },
  // ─── Session 22 — Genuine Stall vs Smoke. The Reversible Yes. (Tue 2) ────
  // Sales + Lead Gen (LG #15). CS excluded via salesOnly. Full asset set.
  // Same day as Session 21 — pair them together; 21 sets up urgency,
  // 22 is the diagnostic for separating real stalls from polite delays.
  {
    id: "session-22-reversible-yes",
    number: "22",
    date: "2026-06-02",
    title: "Genuine Stall vs Smoke. The Reversible Yes.",
    summary:
      "Buyers stall for two completely different reasons — and treating them the same costs deals. A genuine stall has specifics, a third party, and a booked callback. Smoke has none of those. The diagnostic question (\"just out of interest, which one?\") surfaces the lean. The reversible yes (\"small deposit, swap it later — same product\") moves the real ones forward and reveals the rest.",
    keyTakeaway:
      "Real stalls have specific reasons and booked callbacks. Smoke has neither. The reversible yes tells you which is which — and moves the real ones forward today.",
    director: "Corie Dawson",
    totalTime: "~45 min",
    salesOnly: true,
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-22-reversible-yes/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-22-reversible-yes/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: "https://youtu.be/FodzIZVXfCs",
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("16FAliUPLkWOoe4Tvp1I2d6WHPXVs-iNy"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1ek6LgogYUwPUrpYoEeSlZGaf0Tkx6M0-"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "6 questions · ~7 min",
        passMark: 100,
        questions: [
          {
            id: "s22-q1",
            type: "multiple-choice",
            prompt:
              "Which of the following is the strongest signal that a stall is genuine rather than a smokescreen?",
            topic: "Genuine vs smoke",
            options: [
              "The buyer says they want some time to think about it",
              "The buyer names a specific personal or operational reason and books a specific callback time",
              "The buyer says they need to chat to the team",
              "The buyer asks the rep to email through more information",
            ],
            correctAnswer: 1,
            rationale:
              "Specific reasons + named third parties + booked callback times = real stall. Vague reasons, unnamed \"someones,\" and \"I'll get back to you\" with no fixed time = smoke. The presence of operational or personal detail (rather than generic excuses) is the strongest tell.",
          },
          {
            id: "s22-q2",
            type: "multiple-choice",
            prompt:
              "Before accepting a buyer's request to think about it, what's the most effective single question to ask?",
            topic: "Diagnostic question",
            options: [
              "\"Are you actually serious about moving forward with this?\"",
              "\"What would I need to do to close the deal today?\"",
              "\"Can I lock you in with a small deposit right now?\"",
              "\"Just out of interest — which one are you more likely to go for?\"",
            ],
            correctAnswer: 3,
            rationale:
              "The casual \"just out of interest\" opener disarms the buyer — it signals informal curiosity, not a sales push. Asking which option they're more likely to choose surfaces their lean without demanding a commitment. The other options either push too hard or fail to gather information at all.",
          },
          {
            id: "s22-q3",
            type: "multiple-choice",
            prompt:
              "The buyer says they're leaning toward the up-front payment but want to check with their accountant first. What's the strongest next move?",
            topic: "Mirror and advance",
            options: [
              "Mirror the preference, then offer a small deposit with the explicit option to swap it out later",
              "Drop the price to make the up-front option more attractive",
              "Push for the decision now since they've already named a preference",
              "Send a detailed comparison document and book a follow-up in two weeks",
            ],
            correctAnswer: 0,
            rationale:
              "Mirror the preference back (\"I'd just go up-front too\"), validate it briefly (\"$2,000/month elsewhere, this is only $5,000 once\"), then offer the reversible path (\"small deposit, we can swap if you change your mind\"). This advances the deal without removing the buyer's right to consult their accountant.",
          },
          {
            id: "s22-q4",
            type: "multiple-choice",
            prompt:
              "Why does the reversible-yes move (\"small deposit, we can swap it later\") unlock so many stalled deals?",
            topic: "Reversible yes",
            options: [
              "Because buyers always say yes to the smallest commitment available",
              "Because it lets the rep avoid talking about price",
              "Because most buyers hesitate about commitment, not about the product — reversibility lowers the perceived cost of yes",
              "Because it gives the rep grounds to follow up daily until the buyer commits",
            ],
            correctAnswer: 2,
            rationale:
              "Buyers don't usually hesitate about whether they want the product — they hesitate about whether they can change their mind. Reversibility removes that fear. The buyer is choosing the next step (the small deposit), not the destination — which is a much easier yes.",
          },
          {
            id: "s22-q5",
            type: "multiple-choice",
            prompt:
              "You've offered the reversible-yes move. The buyer enthusiastically agrees but says they'll \"sort it tomorrow.\" What's the right read?",
            topic: "Soft smoke detection",
            options: [
              "Real interest — the deal is essentially closed",
              "Soft smoke — follow up tomorrow but expect attrition; the deal isn't locked in",
              "Hard smoke — write the deal off immediately",
              "Neutral — buyers always need a day to think before committing",
            ],
            correctAnswer: 1,
            rationale:
              "Enthusiastic agreement followed by \"tomorrow\" is soft smoke. Real interest takes the deposit on the call. \"Tomorrow\" is a polite exit dressed in positive language. Follow up tomorrow — but treat the deal as at-risk, not closed. Most soft smoke evaporates by the time tomorrow arrives.",
          },
          {
            id: "s22-q6",
            type: "multiple-choice",
            prompt:
              "A buyer raises two distinct concerns in the same call: \"I need to check with my accountant\" and \"Monday is going to be a write-off because of a staff emergency.\" What's the right approach?",
            topic: "Handle concerns separately",
            options: [
              "Treat both as one general hesitation and offer a discount to resolve both at once",
              "Push past both concerns and ask for the close anyway",
              "Focus only on the accountant concern since the timing one will resolve itself",
              "Handle each concern separately — name it back, address it on its own merits, then move forward",
            ],
            correctAnswer: 3,
            rationale:
              "Two distinct concerns need two distinct responses. Name each one back to confirm understanding, address each on its own merits (accountant = real, needs the diagnostic question + reversible yes; timing = real, accept and apply urgency to the callback), and only then move forward. Conflating concerns into one big \"hesitation\" hides the path to closing.",
          },
        ],
      },
    ],
  },
  // ─── Session 21 — Urgency. Hold the Line. Close the Loop Today. (Tue 2) ──
  // Sales + Lead Gen (LG #14). CS excluded via salesOnly. Full asset set.
  {
    id: "session-21-urgency",
    number: "21",
    date: "2026-06-02",
    title: "Urgency. Hold the Line. Close the Loop Today.",
    summary:
      "Urgency is a tempo, not a panic. When a buyer is engaged, the deal window is the next 60 minutes — not the next week. Hold the line or call back in five with a director-authorised \"one better.\" Close on Monday, not Friday. And learn to find the no fast — it returns your most expensive resource.",
    keyTakeaway:
      "Urgency is a tempo, not a panic. Hold the line. Call back in five. Close on Monday. Find the no fast.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    salesOnly: true,
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-21-urgency/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-21-urgency/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: "https://youtu.be/EEmeIjZEB24",
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1fNZCm50s3ZnLvIwrss6-zR-8AofXnaka"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1I6FPL1_yThZsP_C1QIYqu_Fy2JkBLCYq"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s21-q1",
            type: "multiple-choice",
            prompt:
              "What does urgency mean in a live sales conversation?",
            topic: "Urgency as tempo",
            options: [
              "Pressuring the buyer to commit before they're ready",
              "Getting urgent the moment you sense you might lose the deal",
              "Matching your pace to the speed of a deadline you can't push back — a tempo, not a panic",
              "Working as many leads as possible in the same week",
            ],
            correctAnswer: 2,
            rationale:
              "Urgency is a tempo, not a panic. It's the same intensity a rep would bring to anything that genuinely can't wait. Most reps get urgent at the wrong moment — when they fear losing the deal. The right moment to be urgent is when the buyer is engaged and the deal is live.",
          },
          {
            id: "s21-q2",
            type: "multiple-choice",
            prompt:
              "A buyer asks a question you can't answer instantly. What's the right move?",
            topic: "Hold the line / call in five",
            options: [
              "Tell them you'll get back to them tomorrow once you've checked",
              "Either hold the line while you find out, or call back inside five minutes — keep the deal hot",
              "Make up your best guess and confirm by email later",
              "Pass the question to your manager and step away from the deal",
            ],
            correctAnswer: 1,
            rationale:
              "Two scripts work: \"hold the line, I'll find out now\" or \"I'll call you back in five minutes.\" Both keep the deal hot. Tomorrow is too late — the buyer's interest will have fallen off the cliff by then. The callback itself is the manoeuvre, not the research.",
          },
          {
            id: "s21-q3",
            type: "multiple-choice",
            prompt:
              "What's the practical implication of the \"interest cliff\" — buyer engagement decaying after the call?",
            topic: "Interest cliff",
            options: [
              "Most of the buyer's engagement disappears in the first hour, so the deal window is now, not next week",
              "Buyers usually wait until Friday to make decisions, so plan around that",
              "Interest stays stable for 24 hours then drops sharply",
              "The buyer's interest grows as they have more time to think about it",
            ],
            correctAnswer: 0,
            rationale:
              "Buyer engagement drops sharply in the first hour after hang-up and continues falling. By the next day it's a quarter of what it was; by Friday it's cold. The deal window is the same conversation — or the same day at the latest. Plan to close while the buyer is still hot, not when they've had time to cool.",
          },
          {
            id: "s21-q4",
            type: "multiple-choice",
            prompt:
              "When you call back inside the 5-minute window, what should you open with?",
            topic: "The 'one better' move",
            options: [
              "An apology for the delay and a question to re-engage them",
              "A repeat of the same offer you just gave them",
              "A request to confirm whether they're still interested",
              "A small \"one better\" — a director-authorised bonus the buyer didn't ask for",
            ],
            correctAnswer: 3,
            rationale:
              "The \"one better\" is a director-authorised bonus the buyer didn't ask for. It changes the call from a chase to a small gift. Pair it with a relaxed close (\"no rush — by the end of the week as you planned\") and the buyer reads the rep as professional, generous, and trustworthy — not as a discount machine.",
          },
          {
            id: "s21-q5",
            type: "multiple-choice",
            prompt:
              "A buyer who was hesitant suddenly says \"actually, can I pay the whole thing up front?\" What's the smart response?",
            topic: "Easy yeses can be decoys",
            options: [
              "Take the win — confirm payment details and end the call",
              "Be slightly sceptical — offer the small-deposit path instead, which tests whether the yes is real",
              "Upgrade them to the bigger package while they're feeling positive",
              "Tell them you'll send paperwork and confirm by email tomorrow",
            ],
            correctAnswer: 1,
            rationale:
              "Easy yeses can be polite exit moves. The buyer creates a logistics gap and then doesn't pick up the callback. The test is to remove the gap — offer the small-deposit path that commits them today. Real yeses survive the test. Decoy yeses suddenly need to \"check with someone\" or \"call you back.\"",
          },
          {
            id: "s21-q6",
            type: "multiple-choice",
            prompt:
              "Why is finding out a buyer will say no actually more useful than predicting when they'll say yes?",
            topic: "Find the no fast",
            options: [
              "Because no buyers ever change their mind once they've said yes",
              "Because nos help the rep build a longer pipeline of contacts",
              "Because a clear no returns the rep's time — yeses happen when they happen; nos let the rep stop spending energy on marginal deals",
              "Because hearing no makes the rep tougher emotionally",
            ],
            correctAnswer: 2,
            rationale:
              "Reps spend too much energy trying to predict the yes. A yes happens when it happens. A clear no, on the other hand, returns the rep's most expensive resource — time — which can then be spent on real opportunities. Treat the no as a clean conversation ending, not a personal rejection.",
          },
          {
            id: "s21-q7",
            type: "multiple-choice",
            prompt:
              "Where in the conversation does the close actually get decided?",
            topic: "Close at info stage",
            options: [
              "At the information stage — discovery, alignment, and value framing. The \"close\" itself is a confirmation, not a persuasion move.",
              "At the moment you ask for the deposit",
              "When you offer the discount",
              "On the follow-up email the next day",
            ],
            correctAnswer: 0,
            rationale:
              "The close lives in the information stage. If discovery, alignment, and value framing were done well, the close is just clicking the button. If the close feels hard, that's a signal the info stage was incomplete — go back and fill the gap rather than pushing the close.",
          },
        ],
      },
    ],
  },
  // ─── Sessions 18, 19, 20 — full asset sets + LG access ───────────────────
  // Visible to sales (Lucas/Dylan/Felipe) AND Lead Gen (Cindy/Shian/Riley/
  // Sydney) — wired into LEAD_GEN_SESSION_MAP as their 11, 12, 13. CS still
  // excluded via salesOnly: true (per the user's instruction — they only
  // asked for Lead Gen to be added, not CS).
  // Intros are YouTube (the AssetCard YouTube embed branch handles them).
  {
    id: "session-20-hunt-deals",
    number: "20",
    date: "2026-06-01",
    title: "Count Deals, Not Bookings. Reset the Metric.",
    summary:
      "Once you're past the prove-you-can-pick-up-the-phone phase, bookings stop being the headline metric — money does. Reverse-engineer from the daily income target back to deals required, then to the minimum strong bookings. Phase two thinking on the moments that matter.",
    keyTakeaway:
      "Count deals, not bookings. Reverse-engineer from the money. Phase two on the moments that matter. Find the real win every day.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    salesOnly: true,
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-20-hunt-deals/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-20-hunt-deals/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: "https://youtu.be/E9oTm-ogjSo",
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1esP1TwUI-V1xVU7DBeebPJOsaOWS45Jd"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1x8DdUOrPXLPFQ3VKR4Ub0E0x7P6KaPSs"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s20-q1",
            type: "multiple-choice",
            prompt:
              "Once a rep is past the early-phase \"prove you can pick up the phone\" stage, what's the right primary metric?",
            topic: "Reset the metric",
            options: [
              "Bookings made per day",
              "Money produced per day (and deals required to hit it)",
              "Hours on the phone per day",
              "Conversion rate per week",
            ],
            correctAnswer: 1,
            rationale:
              "Money produced per day is the right primary metric. Bookings are the means — never the end. A rep with 5 bookings and 2 deals beats a rep with 10 bookings and 1 deal. Tracking bookings as the headline number incentivises shallow volume over focused conversion.",
          },
          {
            id: "s20-q2",
            type: "multiple-choice",
            prompt: "What does it mean to \"reverse-engineer from the money\"?",
            topic: "Reverse-engineering",
            options: [
              "Calculate your commission first and ask for it upfront",
              "Work out the cost of each deal before the pitch",
              "Start with the daily income target, divide by commission per deal to get deals required, then work out the minimum strong bookings needed",
              "Reverse the order you pitch your products in",
            ],
            correctAnswer: 2,
            rationale:
              "Reverse-engineering means starting from the money. Daily target ÷ commission per deal = deals required. From there, the minimum strong bookings is what your conversion supports — plus an insurance policy on top. The reverse direction protects against the trap of chasing booking volume.",
          },
          {
            id: "s20-q3",
            type: "multiple-choice",
            prompt:
              "What's the structure of the \"insurance policy\" approach to daily bookings?",
            topic: "Insurance policy",
            options: [
              "Book as many as possible — overflow is always safer",
              "Start with the core minimum (e.g. two). Add two as third-party-only insurance. Add two more as comprehensive insurance. Six strong bookings total.",
              "Make sure every booking has a backup rep assigned",
              "Use a separate insurance product to cover lost commissions",
            ],
            correctAnswer: 1,
            rationale:
              "Layer the bookings, don't pile them. Two core bookings + two third-party + two comprehensive = six strong bookings total. Six well-prepared bookings will convert better than twenty shallow ones because the prep, the confirmation, and the focus all stay intact.",
          },
          {
            id: "s20-q4",
            type: "multiple-choice",
            prompt:
              "Why does the session push back hard against using \"history\" to set your conversion ceiling?",
            topic: "History is history",
            options: [
              "Because history is unreliable — buyers change too fast",
              "Because past conversion ratios were produced under old conditions. New conditions (better prep, sharper pitches, new techniques) produce new ratios — but only if you stop treating the old ratio as fixed.",
              "Because tracking history takes too much time",
              "Because the manager already tracks history, so the rep shouldn't",
            ],
            correctAnswer: 1,
            rationale:
              "History is what was true under old conditions. Treating it as fixed locks the rep into the past. Better prep, sharper pitches, and new techniques produce new ratios — but only if the rep stops assuming the old ratio is permanent. Be willing to aim above your history.",
          },
          {
            id: "s20-q5",
            type: "multiple-choice",
            prompt:
              "What's the difference between phase one and phase two thinking?",
            topic: "Phase one vs phase two",
            options: [
              "Phase one is for beginners, phase two is for senior reps",
              "Phase one is on the phone, phase two is in face-to-face meetings",
              "Phase one is automatic / autopilot responses — most communication, most days. Phase two is considered thinking — used deliberately on the moments that matter.",
              "Phase one is morning energy, phase two is afternoon energy",
            ],
            correctAnswer: 2,
            rationale:
              "Phase one is the autopilot — automatic, reactive, default answers. Most communication runs on it. Phase two is the considered version — pause, think, give the real answer. The skill isn't to live in phase two constantly (exhausting), it's to deliberately step into it on the moments that matter — forecasts, debriefs, key buyer questions.",
          },
          {
            id: "s20-q6",
            type: "multiple-choice",
            prompt:
              "The session described a \"pressure-test\" — asking yourself a question as if the stakes were extreme. What's the purpose?",
            topic: "Pressure-testing",
            options: [
              "To stress-test the deal under real client pressure",
              "To force the brain out of phase one autopilot into phase two considered thinking — which surfaces the real answer rather than the default one",
              "To prepare the rep for high-pressure objections from the buyer",
              "To simulate what would happen if the rep lost the deal",
            ],
            correctAnswer: 1,
            rationale:
              "Pressure-testing artificially raises the imagined stakes to force the brain out of phase one. When the answer matters, the brain stops auto-replying and starts actually thinking. Apply it to forecasts, deal predictions, stalled deals, and buyer pushback — the real answer surfaces fast.",
          },
          {
            id: "s20-q7",
            type: "multiple-choice",
            prompt:
              "What does \"awareness\" mean in the context of this session, and why does it matter?",
            topic: "Awareness",
            options: [
              "Being polite and listening carefully",
              "Knowing your industry well",
              "The ability to see yourself, your situation, and your interactions from outside — which is the skill underneath every other technique. Without it, techniques run blind.",
              "Being aware of the company's policies and procedures",
            ],
            correctAnswer: 2,
            rationale:
              "Awareness is the meta-skill. It's the ability to step outside yourself and observe what's actually happening — in your pitch, in your tone, in your pipeline, in your own decision-making. Without it, even the best techniques run blind. With it, every other skill compounds.",
          },
        ],
      },
    ],
  },
  {
    id: "session-19-reheat-the-meeting",
    number: "19",
    date: "2026-05-29",
    title: "Reheat the Pie. Sell the Appointment Twice.",
    summary:
      "Bookings inherited from the lead-gen team go cold — fast. The day-before confirmation call reheats the pie: re-energises the buyer, asks for a small prep task, and frames the meeting as 5–10 minutes. Sell the appointment twice — and the next step is the close.",
    keyTakeaway:
      "Bookings go cold. Reheat the pie. Sell the appointment twice. Confidence without pressure. The next step is the close.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    salesOnly: true,
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-19-reheat-the-meeting/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-19-reheat-the-meeting/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: "https://youtu.be/KNNYVKyIOJM",
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1m67wrDmmfuHxbDyH7FhENq6OyH0NwL7S"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1bpv95PJaBPX-LIJrNKVXuLCkTljgFGjI"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s19-q1",
            type: "multiple-choice",
            prompt:
              "Why do bookings inherited from the lead-gen team often go cold by the time the meeting happens?",
            topic: "Cold pie",
            options: [
              "Because lead-gen books too many meetings per day",
              "Because the buyer's emotional engagement decays over time — the deal is the same, but the buyer's belief in attending isn't",
              "Because the lead-gen reps oversell the meeting",
              "Because buyers always have second thoughts after a sales conversation",
            ],
            correctAnswer: 1,
            rationale:
              "The pie is the same. The buyer's engagement isn't. Once the lead-gen call ends, the buyer's energy starts decaying — they move on to other priorities, and the meeting goes from a curiosity to a calendar item. The longer the gap, the more reheating is needed.",
          },
          {
            id: "s19-q2",
            type: "multiple-choice",
            prompt: "When should the confirmation call be made?",
            topic: "Day-before call",
            options: [
              "Immediately after the lead-gen team books the meeting",
              "On the morning of the meeting",
              "The day before the meeting — early enough that the buyer can prep, late enough that the meeting feels imminent",
              "Whenever the rep has time, before the meeting",
            ],
            correctAnswer: 2,
            rationale:
              "The day before is the sweet spot. Earlier and the meeting still feels distant; on the day itself, the buyer's already scheduled around it (or skipped it). The day before is when the buyer's awareness can be reactivated and prep can be requested.",
          },
          {
            id: "s19-q3",
            type: "multiple-choice",
            prompt:
              "Why does framing a meeting as \"5–10 minutes\" work — even when the actual meeting will run longer?",
            topic: "Asymmetric time frame",
            options: [
              "Because buyers respect a rep who keeps things brief",
              "Because it commits the rep to short calls, which improves conversion",
              "Because it's asymmetric risk — the short frame defuses the buyer's biggest objection, and if the meeting runs longer, the buyer extends it themselves",
              "Because most meetings genuinely should be 5–10 minutes",
            ],
            correctAnswer: 2,
            rationale:
              "It's asymmetric risk. The buyer's #1 objection — \"I don't have time\" — gets defused. If the meeting runs short, the buyer is delighted. If it runs long, the buyer extended it themselves — and won't get angry. Never literal; always the frame.",
          },
          {
            id: "s19-q4",
            type: "multiple-choice",
            prompt: "\"Sell the appointment twice\" — what does this mean?",
            topic: "Sell the appointment twice",
            options: [
              "Pitch the same product to the same buyer in two separate meetings",
              "Lead-gen sells the booking once. The receiving rep needs to sell it again on the confirmation call — re-establishing value before the meeting happens",
              "Always have two sales reps on every meeting to build trust",
              "Try the close twice in the same conversation",
            ],
            correctAnswer: 1,
            rationale:
              "Lead-gen does the first sell. The receiving rep does the second sell on the confirmation call — reframing the value, asking for a small prep task, and resetting the buyer's belief in why the meeting matters. Skip the second sell, and the buyer arrives flat.",
          },
          {
            id: "s19-q5",
            type: "multiple-choice",
            prompt:
              "What's wrong with looking at a full calendar of bookings and thinking \"some will fall out, that's normal\"?",
            topic: "Full-calendar trap",
            options: [
              "Nothing — that's a realistic expectation",
              "The internal expectation shapes the outcome — accepting attrition as normal causes attrition to rise to match. The work has just begun, not finished.",
              "It encourages reps to book more meetings than they can handle",
              "It signals to the manager that the rep isn't focused",
            ],
            correctAnswer: 1,
            rationale:
              "The internal expectation shapes the outcome. The moment a rep accepts attrition as normal, attrition rises to match. A full calendar isn't the finish line — it's the starting line. The job becomes preparing well enough to convert all of them, not most of them.",
          },
          {
            id: "s19-q6",
            type: "multiple-choice",
            prompt:
              "What's the difference between \"sounds like you're ready to go the next step\" as a statement versus as a question?",
            topic: "The next-step close",
            options: [
              "There's no difference — both work equally well",
              "The question version is more polite and works better with senior buyers",
              "Said as a statement (flat intonation, no question mark), the buyer can't politely exit. Said as a question, they default to \"let me think\"",
              "The statement version only works on the phone, not in person",
            ],
            correctAnswer: 2,
            rationale:
              "The statement form (flat intonation, no rising tone) removes the buyer's clean exit. The question form invites \"let me think about it.\" The vocabulary is identical — the delivery is the whole technique. Practise the flat tone out loud.",
          },
          {
            id: "s19-q7",
            type: "multiple-choice",
            prompt:
              "A buyer says \"I don't want to be pressured.\" What's the most effective response?",
            topic: "Apology close",
            options: [
              "Defend — \"I'm not pressuring you, I'm just being thorough.\"",
              "Drop the price to ease the tension",
              "Apologise, own it, and offer two paths — take the deal, or walk. The buyer almost always softens",
              "Repeat the question to clarify what they mean",
            ],
            correctAnswer: 2,
            rationale:
              "Defending validates the buyer's complaint and turns the conversation into an argument. Apologising disarms them — most buyers will recover the relationship themselves (\"no, you weren't pressuring me\"). If they don't, the rep finds out fast that the deal was never going to close. Either answer is useful.",
          },
        ],
      },
    ],
  },
  {
    id: "session-18-inherit-the-deal",
    number: "18",
    date: "2026-05-29",
    title: "Information Is Currency. Inherit the Deal.",
    summary:
      "Stop pitching. Start gathering. Information is the asymmetric advantage — buying habits repeat, price tolerance reveals itself, networks unlock. Use statement-form questions to gather without triggering the buyer's defences. Walk in 85% validated; let the call do the last 15%.",
    keyTakeaway:
      "Gather first, recommend second, close inherited. Statements not questions. Listen back. Walk the value, not the price.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    salesOnly: true,
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-18-inherit-the-deal/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-18-inherit-the-deal/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: "https://youtu.be/ato2HsBa7x0",
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1cPXb0h3dNIoVdfcyrlrVhiZOKC_mJCW-"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1zjycfVY0ELy364Uz7wstCWahuiLiM7xF"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s18-q1",
            type: "multiple-choice",
            prompt:
              "Why is information gathering more valuable than pitching speed in a sales call?",
            topic: "Information as currency",
            options: [
              "Because pitching too early can scare the buyer away",
              "Because long calls always close better than short calls",
              "Because buying habits repeat — knowing how the buyer made their last purchase predicts how they'll make the next one",
              "Because information makes the rep sound more knowledgeable",
            ],
            correctAnswer: 2,
            rationale:
              "Buying habits repeat. The way a buyer made their last big purchase is the strongest predictor of how they'll make the next one. The rep who gathers that information first walks into the recommendation with a thesis the buyer is already aligned with. Pitching speed without that foundation is guessing — and the buyer can feel it.",
          },
          {
            id: "s18-q2",
            type: "multiple-choice",
            prompt:
              "A buyer says they \"can't remember\" who built their website. What's the most likely real reason?",
            topic: "Reading 'I can't remember'",
            options: [
              "They genuinely don't remember",
              "The question landed in the wrong way — \"I can't remember\" usually means \"I don't want to tell you\"",
              "They're embarrassed about the website",
              "They're testing whether the rep can do the research themselves",
            ],
            correctAnswer: 1,
            rationale:
              "\"I can't remember\" is almost never a real memory gap. It's a polite \"none of your business.\" The fix isn't to give up — it's to reframe and ask again in statement form. The fact that the buyer is guarding the information is itself useful information.",
          },
          {
            id: "s18-q3",
            type: "multiple-choice",
            prompt:
              "Which of these is a statement-form question that gets the buyer to reveal their budget without asking directly?",
            topic: "Statement questions",
            options: [
              "\"What's your budget for this project?\"",
              "\"How much are you looking to spend?\"",
              "\"Can you confirm your budget so I can recommend the right option?\"",
              "\"Some clients in your space invest around $1,500 to $2,500 for what you're after.\"",
            ],
            correctAnswer: 3,
            rationale:
              "Statement form invites correction. \"Some clients in your space invest around $1,500–$2,500\" gives the buyer a frame and lets them correct it (\"that's about right\" / \"actually we're closer to $5K\") without feeling interrogated. Direct questions about budget trigger defence.",
          },
          {
            id: "s18-q4",
            type: "multiple-choice",
            prompt: "What does it mean to walk into a pitch \"85% validated\"?",
            topic: "Have a thesis",
            options: [
              "You arrive with a working thesis about the buyer's situation and use the call to confirm or update it — not to improvise from scratch",
              "You've already secured verbal commitment from the buyer before the call",
              "You've personally reviewed 85% of their competitors before the call",
              "You only pitch to leads who score above 85% on a qualification rubric",
            ],
            correctAnswer: 0,
            rationale:
              "Walking in 85% validated means having a working thesis — industry, price tolerance, likely objections, likely solution — before the call. The call is for validating and updating that thesis, not improvising one from scratch. Strong reps update; weak reps either don't have a thesis or refuse to change it.",
          },
          {
            id: "s18-q5",
            type: "multiple-choice",
            prompt: "Active listening in a pitch means doing what, specifically?",
            topic: "Active listening",
            options: [
              "Nodding and confirming as the buyer speaks",
              "Repeating the buyer's own words back to them three or so times during the pitch, tied explicitly to the recommendation",
              "Asking follow-up questions about every statement the buyer makes",
              "Taking detailed notes during the call so nothing is missed",
            ],
            correctAnswer: 1,
            rationale:
              "Active listening shows up in the pitch itself — when the rep repeats the buyer's own words back to them, three or so times, tied to the recommendation. \"You said you want to expand…\" + \"You mentioned the website hadn't been touched…\" Without those callbacks, the buyer doesn't know they were heard.",
          },
          {
            id: "s18-q6",
            type: "multiple-choice",
            prompt: "What does \"inherit the close\" mean in practice?",
            topic: "Inherit the close",
            options: [
              "Closing techniques are passed down from senior reps to junior ones",
              "The rep waits for the buyer to ask to buy",
              "The rep uses a scripted closing question at the end of every call",
              "The yes is decided during the information stage — 90% of the rep's effort goes into discovery and recommendation, and the close itself is a confirmation",
            ],
            correctAnswer: 3,
            rationale:
              "The close is decided during discovery. If the rep spends 90% on information and 10% on the close, the close is just a confirmation. If the rep spends 10% on info and 90% pushing for the yes, the close is a battle — and one most reps lose.",
          },
          {
            id: "s18-q7",
            type: "multiple-choice",
            prompt:
              "The buyer pushes back on the price. What does the mistake-walk-back close do instead of dropping the price?",
            topic: "Mistake-walk-back",
            options: [
              "Reduces the scope of work — framing it as the rep's own over-scoping mistake — so the price drops without compromising the value of what's left",
              "Offers a one-time discount with a strict expiry",
              "Refers the buyer to a cheaper competitor",
              "Escalates to the manager for approval",
            ],
            correctAnswer: 0,
            rationale:
              "The mistake-walk-back drops the scope of work and frames it as the rep's own over-scoping error — not as a discount the buyer pushed for. Price drops, value-per-dollar stays the same, and the rep keeps integrity. Direct discounts cost more long-term than a clean scope reduction.",
          },
        ],
      },
    ],
  },
  // ─── Session 17 — Close the Exits. Hold the Line. Win the Deal. (Thu 28) ─
  // Visible to sales + Customer Service (no salesOnly flag — CS gets the
  // quiz auto-stripped). Wired into the Lead Gen track as their Session 10.
  // Three assets at launch — Synthesia / podcast / presentation coming
  // when Elly sends through.
  {
    id: "session-17-close-the-exits",
    number: "17",
    date: "2026-05-28",
    title: "Close the Exits. Hold the Line. Win the Deal.",
    summary:
      "When a buyer laughs at your price, that's a buying signal, not a rejection. Confirm alignment on process and company before talking money. Acknowledge their target literally, hold the line on value, and offer a discount path that doesn't compromise the work. Buyers pay extra to feel like they won.",
    keyTakeaway:
      "Close the exits before you talk price. Every objection is a window or door the buyer's trying to escape through — the job is to predict the next one and close it calmly. Hold the line when they laugh. Let them come to you. And let them feel like they won.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-17-close-the-exits/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-17-close-the-exits/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("141c-HZMC7yCX7okAzU6HuPE218mamQwT"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1JV3pOAt456RjJX9bZuapMCe0H__NBich"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1t23t3LThUdk-YySXzDF_KBi84CznrbhA"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s17-q1",
            type: "multiple-choice",
            prompt:
              "A buyer laughs and shakes their head when you state the price. What's the right read?",
            topic: "Reading buying signals",
            options: [
              "They're walking away — soften the price quickly before they leave",
              "They're engaged — the reaction is a buying signal, hold the price and confirm alignment",
              "They're being rude — match the energy and end the call",
              "They don't have the money — pivot to the cheapest option immediately",
            ],
            correctAnswer: 1,
            rationale:
              "The strong reaction is engagement, not rejection. Buyers who aren't interested don't bother engaging with the price — they politely end the call. A laugh means the buyer is testing whether the rep will fold under pressure, and whether the rep actually believes in the price they just quoted. Hold the line, confirm alignment, then revisit the number.",
          },
          {
            id: "s17-q2",
            type: "multiple-choice",
            prompt:
              "Why is dropping the price two or three times in the same conversation a costly mistake?",
            topic: "Don't take pot shots",
            options: [
              "It reveals the agency's profit margin to the buyer",
              "It makes the buyer worry the work will be lower quality",
              "Every drop costs credibility — the buyer concludes the original price was inflated and any number is movable",
              "It triggers an automatic discount approval from the manager",
            ],
            correctAnswer: 2,
            rationale:
              "Each drop in the same conversation trains the buyer that the original price was inflated and that any number you state is movable. By the third drop the conversation has stopped being about the offer and started being about how low you'll go. Pause, confirm alignment on process and company, then revisit price with a clear position.",
          },
          {
            id: "s17-q3",
            type: "multiple-choice",
            prompt:
              "Before negotiating the price, which two things should be confirmed with the buyer first?",
            topic: "Confirm alignment first",
            options: [
              "That they like the process, and that they like the company",
              "That they have decision-making authority, and that they have a budget",
              "That they understand the timeline, and that they're comfortable with monthly payments",
              "That they've seen the portfolio, and that they have a clear brief",
            ],
            correctAnswer: 0,
            rationale:
              "The two foundation questions are: do you like the process, and do you like the company? Both yeses must be on the table before price negotiation begins. Without them, the conversation collapses into a discount dance. With them, price becomes the easiest part of the conversation — not the hardest.",
          },
          {
            id: "s17-q4",
            type: "multiple-choice",
            prompt:
              "The buyer says they were hoping to pay $3,000 on a job that genuinely costs $6,000+. What's the most effective response?",
            topic: "Acknowledge the number literally",
            options: [
              "Offer a deep discount to meet them at $3,500 — splitting the difference",
              "End the call politely — they're clearly not a serious buyer",
              "Lower the scope of work to fit their budget",
              "Acknowledge the number literally, tell them you can't get there, then offer a discount path (like hosting) that brings the number partway back",
            ],
            correctAnswer: 3,
            rationale:
              "Take their number seriously. Tell them you can't get there. Then offer a path that doesn't compromise the value of the work — typically a discount that activates if they take a related action (hosting, monthly billing, longer term). This holds the line on value while still giving the buyer a sense of having earned a concession.",
          },
          {
            id: "s17-q5",
            type: "multiple-choice",
            prompt:
              "A buyer states $22,000 as their firm ceiling on a $28,000 item. After visibly working the deal, you can settle at $22,700 — $700 above their stated ceiling. What typically happens?",
            topic: "The $700 lesson",
            options: [
              "The buyer takes the deal — they pay the extra $700 to feel like they won the negotiation",
              "The buyer refuses — any number above their stated ceiling kills the deal",
              "The buyer threatens to walk and demands you come down to $22,000",
              "The buyer asks for a second discount to bring it to $21,500",
            ],
            correctAnswer: 0,
            rationale:
              "The buyer pays the extra $700 because they feel they pushed the deal past where they said they'd go. The stated ceiling is a position, not a true maximum — the real maximum is whatever the buyer will pay if they feel they won. Visible effort on the seller's side proves the offer is at the limit. Critically: never close the small gap by asking the buyer to come up — the buyer must close it themselves.",
          },
          {
            id: "s17-q6",
            type: "multiple-choice",
            prompt:
              "Why does calibrated disinterest from the rep often pull a buyer toward the deal rather than push them away?",
            topic: "Disinterest as positioning",
            options: [
              "It signals the rep doesn't need the deal financially, which builds trust",
              "It removes the buyer's leverage and triggers a pull-toward instinct — the buyer wants what isn't being forced on them",
              "It signals the product is in short supply and prices will rise soon",
              "It tells the buyer the rep is talking to other prospects, creating competitive pressure",
            ],
            correctAnswer: 1,
            rationale:
              "Buyers expect to be chased. Removing the chase removes the leverage. The same psychological instinct that makes people want what is being withheld kicks in inside a sales conversation — the buyer starts pulling toward the deal the rep isn't pushing. Combined with calm professionalism (not rudeness), this is the strongest closing energy available.",
          },
          {
            id: "s17-q7",
            type: "multiple-choice",
            prompt:
              "What are the three values that have to sit underneath every sales technique to keep it from reading as manipulation?",
            topic: "The three pillars",
            options: [
              "Confidence, charisma, and conviction",
              "Speed, scarcity, and social proof",
              "Honesty, integrity, and loyalty",
              "Empathy, expertise, and enthusiasm",
            ],
            correctAnswer: 2,
            rationale:
              "Honesty, integrity, and loyalty are the foundation. Every technique in this session — holding the line, the $700 move, calibrated disinterest, \"I understand\" — reads as manipulation when run without these values, and as professionalism when run with them. Buyers read what reps do, not what they say. The three pillars are what they read.",
          },
        ],
      },
    ],
  },
  // ─── Session 16 — Follow the Instructions. Build the Lego. (Tue 26 May) ──
  // Sales + Customer Service both see it (no salesOnly flag). Also wired
  // into the Lead Gen track as their Session 09 (see LEAD_GEN_SESSION_MAP
  // below). Full asset set now — podcast + presentation added in a follow-
  // up commit after the regenerated audio landed.
  {
    id: "session-16-follow-the-instructions",
    number: "16",
    date: "2026-05-26",
    title: "Follow the Instructions. Build the Lego.",
    summary:
      "Pick the parts. Pack the tray. Cross off each step. Build the piece. The Lego-set principle for sales execution — and why the drift moment (a third of the way in, when confidence spikes) is where the build collapses, not at the start.",
    keyTakeaway:
      "Creativity time and instruction time are two different jobs. The job inside a pitch is execution against a known set of instructions, not invention. Follow the playbook to the letter and the jet hopper builds itself. Free-style and the pile of bricks builds you.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-16-follow-the-instructions/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-16-follow-the-instructions/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1JDy66HuRU_KparGiiB61MEh-FreDGCtj"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1IOgd9xjN8rYMa4wOyrTTsS4f665cAFdi"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1Q_qoOD7Zjspv2wOazXXtRN81PvIoy7Eq"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "5 questions · ~6 min",
        passMark: 100,
        questions: [
          {
            id: "s16-q1",
            type: "multiple-choice",
            prompt:
              "In the pick-and-pack system, why does crossing off each completed step matter?",
            topic: "Cross-off as audit trail",
            options: [
              "It speeds up the build by tracking which parts are left",
              "It signals to the coach which steps the rep has finished",
              "It encourages the rep to slow down and concentrate",
              "It's the audit trail — when something goes wrong, the crosses tell you what was the system and what was you",
            ],
            correctAnswer: 3,
            rationale:
              "The cross-off is the audit trail. When something fails, the crosses show what was the system and what was the rep's improvisation. Without them, the rep can't tell — and neither can the coach. That's why the cross-off survives even when the rep is convinced they don't need it.",
          },
          {
            id: "s16-q2",
            type: "multiple-choice",
            prompt:
              "Which of these is the right moment to free-style rather than follow the instructions?",
            topic: "Creativity vs instruction time",
            options: [
              "Halfway through a client pitch when the conversation feels off",
              "Brainstorming the next product offer with the team",
              "Running the close sequence on a deal",
              "Delivering the script during a validation call",
            ],
            correctAnswer: 1,
            rationale:
              "Creativity time is for brainstorming, designing, naming, off-sites — open-ended work with no right answer. Instruction time is for pitching, closing, running the playbook. Free-styling during instruction time costs deals. The trick is knowing which mode you're in before you act.",
          },
          {
            id: "s16-q3",
            type: "multiple-choice",
            prompt:
              "Where in a pitch does the \"I'm a Lego master\" drift moment typically happen?",
            topic: "The drift sequence",
            options: [
              "Right at the start — the rep never actually opens the playbook",
              "Right at the end — the rep panics during the close",
              "About a third of the way in — when the build feels familiar and confidence spikes",
              "It's random — there's no predictable pattern",
            ],
            correctAnswer: 2,
            rationale:
              "The drift point is around the third of the way in. The rep almost always opens the playbook correctly — the danger isn't at the start. It's the confidence spike that comes from the first few moves landing well. Trainers and reps both need to catch it there, not when the build is already collapsing.",
          },
          {
            id: "s16-q4",
            type: "multiple-choice",
            prompt:
              "When a build collapses, which question should the rep answer before reaching for \"the instructions were wrong\"?",
            topic: "The blame loop",
            options: [
              "\"Did I actually follow the instructions? Can I point at the cross-offs?\"",
              "\"Are the leads in this market different from usual?\"",
              "\"Should we update the playbook for next week?\"",
              "\"Is the coach being too harsh in the debrief?\"",
            ],
            correctAnswer: 0,
            rationale:
              "Before blaming the instructions, the rep has to verify they followed them. The cross-offs are the proof. If the rep can't point at completed cross-offs, the question \"did the system work?\" can't be answered — because the system hasn't actually been tested. The blame loop runs forever otherwise.",
          },
          {
            id: "s16-q5",
            type: "multiple-choice",
            prompt:
              "What's the purpose of the two-week test — committing to follow the playbook to the letter for a fixed window?",
            topic: "The two-week test",
            options: [
              "To prove loyalty to the coach",
              "To remove ambiguity — run the system cleanly with no improvisation, then read the actual result",
              "To find out whether the rep can survive without their own ideas",
              "To give the coach material for the next training session",
            ],
            correctAnswer: 1,
            rationale:
              "The two-week test exists to remove the rep's improvisation as a variable. Right now nobody knows if the system works because nobody's run it cleanly. The test is time-boxed (short enough to commit to), falsifiable (the rep wins either way), and it protects the coaching relationship from endless abstract argument.",
          },
        ],
      },
    ],
  },
  // ─── Session 15 — Pitch High. Read the Room. Hold the Line. (Mon 25 May) ─
  // Visible to all sales + customer service (CS sees it without the quiz).
  // Lead Gen still doesn't see it (their portal is the curated 7-session
  // series only). No presentation asset for this session — debrief,
  // toolkit, intro video, podcast, and quiz.
  {
    id: "session-15-read-the-room",
    number: "15",
    date: "2026-05-25",
    title: "Pitch High. Read the Room. Hold the Line.",
    summary:
      "Profit is king, not turnover. Read the dialect — flashy vs utilitarian — before the pitch. Anchor high and let them choke. Replace generic claims with specific evidence. Dance the pressure, hold the line, let \"most people\" do the closing for you.",
    keyTakeaway:
      "Profit is the spending number, not turnover. Read the buyer's dialect in the first five minutes. Pitch upper-mid and reluctantly come down. Replace every generic claim with a specific the competitor couldn't copy. Hold the line — swiveling fast kills credibility. Dance the pressure: relieve, apply, relieve, close.",
    director: "Corie Dawson",
    totalTime: "~40 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-15-read-the-room/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-15-read-the-room/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1SCug9LdAjt5B9lY0QRSrUosiJUjBtk_M"),
      },
      {
        kind: "podcast",
        estimate: "15 min listen",
        url: drivePreview("1wSK9KSquilEeuU-zHe0Qz7uW9deo58Yx"),
        durationSeconds: 900,
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s15-q1",
            type: "multiple-choice",
            prompt:
              "When sizing a pitch, which number tells you the buyer's real capacity to spend?",
            topic: "Profit not turnover",
            options: [
              "Their annual turnover",
              "Their number of staff",
              "Their estimated profit after costs and lifestyle",
              "The size of their previous marketing spend",
            ],
            correctAnswer: 2,
            rationale:
              "Profit is the capacity-to-spend number. Turnover can hide a low-margin business with no disposable cash, and it can hide a high-margin business with more than you'd guess. Always strip out costs and lifestyle before sizing the pitch.",
          },
          {
            id: "s15-q2",
            type: "multiple-choice",
            prompt:
              "A buyer arrives in a top-spec premium car, wearing a designer suit, mentions their last holiday in Europe. Which dialect should you pitch in?",
            topic: "Flashy vs utilitarian",
            options: [
              "Utilitarian — focus on ROI, process maps, and cost-per-lead",
              "Flashy — focus on prestige, looking the best in their industry, top-tier outcomes",
              "Skeptical — focus on guarantees, certifications, and disclaimers",
              "Hybrid — split your pitch evenly between value and prestige",
            ],
            correctAnswer: 1,
            rationale:
              "Read the room. Flashy buyers buy status — sell prestige, looks, and being the best in their industry. The signals are everywhere: the car, the suit, the trips. Mis-pitching the dialect kills good products.",
          },
          {
            id: "s15-q3",
            type: "multiple-choice",
            prompt:
              "Why open the pitch at an upper-mid package rather than the entry-level option?",
            topic: "Pitch high",
            options: [
              "Going in cheap signals you misread the buyer and removes room to negotiate down",
              "Cheaper packages have lower margin, so they should always be avoided",
              "Buyers always reject the first price anyway, so it doesn't matter where you start",
              "Starting cheap is unethical and damages the company's reputation",
            ],
            correctAnswer: 0,
            rationale:
              "Pitch high. Going in cheap signals you misread the buyer's caliber and leaves no room to come down. Anchor at the upper-mid. Reluctantly descend if pushed. The buyer feels like they earned the deal.",
          },
          {
            id: "s15-q4",
            type: "multiple-choice",
            prompt:
              "Which of these is the strongest way to communicate the quality of your customer service to a buyer?",
            topic: "Show, don't tell",
            options: [
              "\"We pride ourselves on excellent customer service\"",
              "\"We have one of the best support teams in the industry\"",
              "\"Our customer service is second to none — you'll love working with us\"",
              "\"We run a support ticketing system — submit one at 2am, you get a reply by morning\"",
            ],
            correctAnswer: 3,
            rationale:
              "Specifics beat generics every time. \"Great customer service\" is what every competitor says. \"A support ticketing system with measurable response times\" is something the buyer can picture — and verify. Hone in on the dish, not the restaurant.",
          },
          {
            id: "s15-q5",
            type: "multiple-choice",
            prompt:
              "What makes the narrative opener — \"Just out of interest, how are you finding the changes with the economy?\" — so effective?",
            topic: "Asymmetric opener",
            options: [
              "It flatters the buyer by suggesting they're an economic expert",
              "It's asymmetric — every possible answer leads back to \"that's the reason for my call\"",
              "It's a closed question that forces a yes or no answer",
              "It moves the buyer to discuss politics, which builds rapport faster",
            ],
            correctAnswer: 1,
            rationale:
              "The asymmetric opener has no losing branch. Booming, mixed, or flat — every answer flows back to \"that's exactly the reason for my call.\" It also reveals what's on the buyer's mind and opens a conversation that doesn't start with the pitch.",
          },
          {
            id: "s15-q6",
            type: "multiple-choice",
            prompt:
              "When a buyer pushes back on the recommended option and asks about alternatives, what's the most effective response?",
            topic: "Hold the line",
            options: [
              "Immediately drop to the alternative to show flexibility",
              "Promote the alternative as enthusiastically as the recommended option",
              "Reluctantly mention it — \"There is another option, but I wouldn't recommend it\"",
              "Refuse to discuss anything other than the recommended option",
            ],
            correctAnswer: 2,
            rationale:
              "Reluctance sells. Discouraging the alternative triggers desire — the duck on the menu, the Krispy Kreme effect. Swiveling instantly costs credibility. Stay with the recommendation, mention the alternative only when pushed, and frame it as inferior.",
          },
          {
            id: "s15-q7",
            type: "multiple-choice",
            prompt:
              "What's the purpose of telling the buyer \"you've got heaps of time, no need to decide today\" partway through closing?",
            topic: "The out-in dance",
            options: [
              "Releasing pressure makes the buyer relax — and the small incentive that follows lands as a gift, not a manipulation",
              "It shows you don't really care whether they buy, which makes you look professional",
              "It gives the buyer permission to delay indefinitely, which protects the relationship",
              "It signals that you've already moved on to other prospects",
            ],
            correctAnswer: 0,
            rationale:
              "The dance is the close. Release pressure → apply soft incentive → release again → close. Pressure release relaxes the buyer; the incentive that follows feels like a gift rather than a sales tactic. Done well, the decision feels like the buyer's idea.",
          },
        ],
      },
    ],
  },
  // ─── Session 14 — Frame It. Don't Spin It. (Mon 25 May 2026) ──────────────
  // Sales boys only (salesOnly: true) — Customer Service and Lead Gen don't
  // see this session in their portals.
  {
    id: "session-14-frame-it-dont-spin-it",
    number: "14",
    date: "2026-05-25",
    title: "Frame It. Don't Spin It.",
    summary:
      "Walk into the debrief with exact numbers — booked, attended, closed. Lead with the win, then the gap. Plant the seed for recruitment, then let the bad day do the closing. Frame the facts; don't spin them.",
    keyTakeaway:
      "You can't frame what you can't count. State the numbers. Lead with the win. Plant the seed. Stay in the work. Discipline produces the outcome — you don't have a choice.",
    director: "Corie Dawson",
    totalTime: "~45 min",
    salesOnly: true,
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-14-frame-it-dont-spin-it/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-14-frame-it-dont-spin-it/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1L2jY4uGT6f8aTk7JvX7zjTnjIG2KzLmu"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1qdbXfpBjW75G_b9vZFuhbsmiGbQxu2p9"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1j5ZXy0HtlPry2Hn6ch8eWF2x2qLmNKqT"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "7 questions · ~8 min",
        passMark: 100,
        questions: [
          {
            id: "s14-q1",
            type: "multiple-choice",
            prompt:
              "When reporting a week's meeting results, which denominator gives the most accurate picture of how well you actually performed?",
            topic: "Know your numbers",
            options: [
              "Meetings booked into the diary",
              "Meetings that were actually attended",
              "Meetings the customer requested",
              "Meetings booked by the lead-gen team",
            ],
            correctAnswer: 1,
            rationale:
              "Attended is the real denominator. Booked includes the no-shows and postponements. The close rate against attended is the rate that tells you how you actually perform when you're in the room. State both — but lead with the rate against attended.",
          },
          {
            id: "s14-q2",
            type: "multiple-choice",
            prompt:
              "Which of the following is an action — not a plan — when the question is \"what are you doing about recruitment?\"",
            topic: "Actions vs plans",
            options: [
              "Designing the ad copy",
              "Discussing strategy with the leader",
              "Researching where to post",
              "Speaking to four people about the role on the weekend",
            ],
            correctAnswer: 3,
            rationale:
              "Speaking to four people is an action — a number you can put on the table. The other three are plans dressed up as work. The test is simple: can you put a number on what you did? If not, it was a plan.",
          },
          {
            id: "s14-q3",
            type: "multiple-choice",
            prompt: "What does the \"no choice\" principle actually mean?",
            topic: "Discipline beats outcomes",
            options: [
              "You have no choice but to chase outcomes harder when results dip",
              "The leader has no choice but to step in when you stop performing",
              "If you keep the disciplines exactly, you don't have a choice — the outcome shows up",
              "Outcomes happen randomly, so the choice is whether to keep showing up",
            ],
            correctAnswer: 2,
            rationale:
              "Discipline produces the outcome — automatically — if you keep it long enough for the maths to run. You don't get to choose the result; you get to choose whether you keep the discipline. Outcomes are a by-product, not a goal.",
          },
          {
            id: "s14-q4",
            type: "multiple-choice",
            prompt:
              "What is the difference between framing and spinning the facts?",
            topic: "Framing vs spinning",
            options: [
              "Framing makes the result sound better; spinning makes it sound worse",
              "Framing presents the facts accurately with the right denominator; spinning distorts the facts",
              "Framing is for internal meetings; spinning is for customer-facing conversations",
              "Framing is what the leader does; spinning is what reps do",
            ],
            correctAnswer: 1,
            rationale:
              "Framing presents the facts correctly with the meaningful denominator. Spinning distorts the facts to make you look good. Same data, but framing keeps you honest — spinning costs you trust the moment the leader checks the numbers.",
          },
          {
            id: "s14-q5",
            type: "multiple-choice",
            prompt:
              "The session described negativity from customers, peers and family as \"smog\" entering your head. What's the correct defence?",
            topic: "Keep the smog out",
            options: [
              "Crowd it out by filling your head with wins and gratitude before the smog can settle",
              "Argue with anyone who tries to put negativity into your head",
              "Avoid people who carry negativity until you've hit your weekly target",
              "Suppress the negativity and pretend it didn't land",
            ],
            correctAnswer: 0,
            rationale:
              "You don't argue with the smog — you crowd it out. Be the first person to frame your day. Notice the wins. Say them out loud. When the toxin arrives, the room is already full of something else. Arguing with negativity gives it airtime.",
          },
          {
            id: "s14-q6",
            type: "multiple-choice",
            prompt:
              "If you're trying to bring someone new into the business, what's the right approach in the first conversation?",
            topic: "Play the long game",
            options: [
              "Make the offer on the spot so they have time to think about it",
              "Push hard on what's wrong with their current job to create urgency",
              "Plant the seed — mention what you do, leave it there, check in lightly later",
              "Wait until they explicitly ask you for a job before saying anything",
            ],
            correctAnswer: 2,
            rationale:
              "Plant the seed. Day-one pitches feel desperate and don't land. Light contact + the long game lets the bad day do the closing weeks later — and the seed you planted is the first thing they reach for when their current situation cracks.",
          },
          {
            id: "s14-q7",
            type: "multiple-choice",
            prompt:
              "What does it mean that a manager is \"in a display cabinet 24/7\"?",
            topic: "Display cabinet",
            options: [
              "The manager has to be in the office whenever the team is in",
              "The leader is always watching how the manager performs",
              "Personal life and work life cannot be separated for a manager",
              "The team is constantly reading the manager's energy — whatever you carry is broadcast",
            ],
            correctAnswer: 3,
            rationale:
              "Once you have direct reports, you don't get to feel privately. The team reads your energy every morning and absorbs whatever you carry — frustration, fatigue, drift. The internal high standard stays internal. The external face is prepared, deliberate, upbeat.",
          },
        ],
      },
    ],
  },
  {
    id: "session-13-outreach-playbook",
    number: "13",
    date: "2026-05-21",
    title: "The Outreach Call Playbook",
    summary:
      "How to run the outreach call: build the schedule with one tab per rep, read the room before you read the script, anchor on the top tier and drop to the middle, replace every discount with a Trojan-horse backlink package.",
    keyTakeaway:
      "Stop saving clients. Start selling them. Two upsells offset one cancellation — but only if you hold the line, read the room, and replace discounts with backlinks. The corner is the moment the client pushes back on price; whoever brakes latest wins the corner.",
    director: "Corie Dawson",
    totalTime: "~35 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-13-outreach-playbook/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-13-outreach-playbook/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1zJ5glspv6MOW-Eu7YrRDQ2mPvHolTgfw"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1D5TSIMZPCAsHiMvKj-8BRcXCctRpYVi9"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1dA9i6j7iyZKDt5fbzyC3dh3oKqp3nuLE"),
        mode: "video",
      },
    ],
  },
  {
    id: "session-12-sell-the-system",
    number: "12",
    date: "2026-05-21",
    title: "Sell the System. Don't Explain It.",
    summary:
      "The CD Notes commission scheme returns — with one critical reframe. Plus the ABC mindset, the Wallace test on visible belief, the four weekly questions for every direct report, and the 300% rule on earning vs. learning.",
    keyTakeaway:
      "Last time the $25 booking note went in the tray and the close commission was treated as a footnote. That's the error. Pitch the trophy, not the participation prize — the $25 is the safety rope, the $100 close is the climb. Put both notes in the tray together so reps see the 4x prize sitting next to the safety net.",
    director: "Corie Dawson",
    totalTime: "~45 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-12-sell-the-system/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-12-sell-the-system/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1SHS3vJM5ALsA7PoFaWEfVE72ygg-fOOe"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1tagorCnjS6WbvEFnb_Bk3iwR4xd12LnU"),
        durationSeconds: 600,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1lpiXk2_Jnb8OdS3Fc7DunnQuIUGjAu-I"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s12-q1",
            type: "multiple-choice",
            prompt:
              "What changed about how the CD Notes commission scheme should be presented this time?",
            topic: "Both notes in the tray",
            options: [
              "Pay more for the booking and less for the close",
              "Put both notes — booking and close — in the tray",
              "Drop the booking commission and pay only on close",
              "Add a third tier on top of the existing two",
            ],
            correctAnswer: 1,
            rationale:
              "Both notes in the tray together. The $25 booking note is the safety rope, the close note is the prize. Last time, only the booking note went in — and reps read it as a $25 game.",
          },
          {
            id: "s12-q2",
            type: "multiple-choice",
            prompt:
              "Which mindset is described as \"comfortable, drifting through, the most dangerous of the three\"?",
            topic: "ABC mindset",
            options: [
              "Mindset A — Abundance",
              "Mindset B — Lack",
              "Mindset C — Drift",
              "None of the above",
            ],
            correctAnswer: 2,
            rationale:
              "Mindset C is the comfortable drift. It's not actively negative like B, which is exactly what makes it dangerous — there's no alarm bell, just slow decline.",
          },
          {
            id: "s12-q3",
            type: "multiple-choice",
            prompt:
              "According to the maths of asking, what happens when you ask 0 people?",
            topic: "Maths of asking",
            options: [
              "0 yeses — the only guaranteed outcome",
              "Around 1 yes via word-of-mouth referrals",
              "Around 2 yeses, the same as asking 10",
              "Depends entirely on the market right now",
            ],
            correctAnswer: 0,
            rationale:
              "Zero asks = zero yeses, guaranteed. Asking 10 people typically returns ~2. The ego costs deals when it protects itself from rejection by not asking.",
          },
          {
            id: "s12-q4",
            type: "multiple-choice",
            prompt: "What does the Wallace test say about belief?",
            topic: "Wallace test",
            options: [
              "Loud people are usually the most genuine believers",
              "Silent belief carries more weight than visible belief",
              "Quiet achievers should never speak up to a team",
              "Visible belief is what actually moves people",
            ],
            correctAnswer: 3,
            rationale:
              "Visible belief is what moves people. Silent belief reads as doubt to the team. You don't need to be loud — but you can't be silent either.",
          },
          {
            id: "s12-q5",
            type: "multiple-choice",
            prompt:
              "What's the first question to ask each direct report every week?",
            topic: "Four weekly questions",
            options: [
              "\"How are you feeling about the role?\"",
              "\"How much do you want to earn this week?\"",
              "\"What are you working on today?\"",
              "\"Are you happy with the commission scheme?\"",
            ],
            correctAnswer: 1,
            rationale:
              "Force a specific number. \"How much do you want to earn this week?\" is the question that anchors everything else — the prize, the deal count, the daily activity.",
          },
          {
            id: "s12-q6",
            type: "multiple-choice",
            prompt:
              "To earn 50% more, roughly how much effort change is required?",
            topic: "Earning is learning",
            options: [
              "About 300% — new skills, new responsibilities",
              "About 50% — work 50% more hours",
              "About 100% — double your weekly output",
              "About 30% — sharpen your attitude",
            ],
            correctAnswer: 0,
            rationale:
              "Roughly 300% — and it's effort *change*, not effort hours. New skills, new responsibilities, more balls in the air. Earning is learning.",
          },
          {
            id: "s12-q7",
            type: "multiple-choice",
            prompt:
              "Why is \"standing still\" effectively the same as \"going backward\"?",
            topic: "Complacency trap",
            options: [
              "Because the team next door is always faster",
              "Because senior staff naturally get worse over time",
              "Because inflation and competitors quietly erode the position",
              "Because every business eventually shrinks",
            ],
            correctAnswer: 2,
            rationale:
              "Inflation strips real income; competitors don't pause; tax rules quietly erode the gain. Standing still is going backward — just slowly enough that you don't notice.",
          },
          {
            id: "s12-q8",
            type: "short-answer",
            prompt:
              "In your own words, write the opening you would use when re-pitching the CD Notes commission scheme to your team. Lead with the prize ($100 close), frame the $25 booking note as the safety rope, and show them the 4x maths. Three to five sentences.",
            topic: "Pitch the prize",
            rationale:
              "Look for: (1) leads with the close commission, not the $25, (2) explicit 4x framing, (3) frames the $25 as a safety rope or lubrication, (4) ties it to a specific weekly number. Marks off for any version that opens with the $25.",
            modelAnswer:
              "Example: The big news is the close commission — $100 if you bring in a deal over $500 margin, $50 under. The $25 booking note is just the safety rope: even if the deal doesn't land, you still get paid for getting it in front of the closer. That's a 4x multiplier sitting in the tray waiting for you. Last time we ran this, we made the mistake of pitching the $25 — this time the prize is the close. How many deals are you closing this week?",
            keywords: ["close", "100", "prize", "safety", "4x", "booking"],
            keywordsRequired: 3,
            softMinChars: 150,
          },
        ],
      },
    ],
  },
  {
    id: "session-11-seo-pitch",
    number: "11",
    date: "2026-05-20",
    title: "SEO Sales Pitch Playbook",
    summary:
      "How to explain SEO to a client. The librarian metaphor, the four categories, the product map, the DA conversation, the close — every line you'll need.",
    keyTakeaway:
      "Customers don't know what SEO is. They know what a library is. Google is the librarian, your client's website is a book, and our job is to get the book shelved at eye-level. That metaphor — used in the first three minutes — does more for the pitch than any feature dump ever will.",
    director: "Corie Dawson",
    totalTime: "~25 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-11-seo-pitch/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-11-seo-pitch/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1mXoaytw23U-1Nthl9TCbI75nnWk6u4SK"),
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s11-q1",
            type: "multiple-choice",
            prompt:
              "In the librarian metaphor, what role does Google play?",
            topic: "Librarian metaphor",
            options: [
              "The author of every book on the shelf",
              "The librarian who decides shelf placement",
              "The customer browsing through the shelves",
              "The publisher who prints all the books",
            ],
            correctAnswer: 1,
            rationale:
              "Google is the librarian. Your website is the book. The whole pitch hangs off this one sentence — say it out loud, in the first three minutes, every call.",
          },
          {
            id: "s11-q2",
            type: "multiple-choice",
            prompt:
              "What are the four categories of SEO, in the order taught in the playbook?",
            topic: "Four categories",
            options: [
              "On-page, off-page, technical, local",
              "Technical, content, local, social",
              "Keywords, backlinks, traffic, conversions",
              "Strategy, execution, measurement, reporting",
            ],
            correctAnswer: 0,
            rationale:
              "On-page, off-page, technical, local. Always in that order. If a rep can't name all four without thinking, they're not ready to quote SEO.",
          },
          {
            id: "s11-q3",
            type: "multiple-choice",
            prompt:
              "Backlinks and citations from other websites belong to which category?",
            topic: "Off-page",
            options: ["Off-page", "On-page", "Technical", "Local"],
            correctAnswer: 0,
            rationale:
              "Off-page is what other authors say about you. Backlinks, citations, mentions. Frame it as \"other authors are now citing your book.\"",
          },
          {
            id: "s11-q4",
            type: "multiple-choice",
            prompt:
              "Site speed, mobile usability, and crawl errors belong to which category?",
            topic: "Technical",
            options: [
              "Local SEO",
              "On-page SEO",
              "Technical SEO",
              "Off-page SEO",
            ],
            correctAnswer: 2,
            rationale:
              "Technical SEO is the plumbing: speed, mobile, indexing, schema, crawl health. If the librarian can't open the book, none of the content matters.",
          },
          {
            id: "s11-q5",
            type: "multiple-choice",
            prompt:
              "How should you explain Domain Authority to a customer?",
            topic: "Domain Authority",
            options: [
              "The total number of backlinks the site has earned",
              "The author's reputation, scored out of 100",
              "A ranking number Google publishes for every site",
              "The website's overall monthly traffic value",
            ],
            correctAnswer: 1,
            rationale:
              "DA is the author's measured reputation. Not a backlink count, not traffic, not something Google publishes. Reframe it that way every time.",
          },
          {
            id: "s11-q6",
            type: "multiple-choice",
            prompt: "Which is the right way to use DA in a sales pitch?",
            topic: "Domain Authority",
            options: [
              "Promise the customer a specific DA increase",
              "Avoid mentioning DA — it confuses customers",
              "Show the customer's DA next to three competitors",
              "Lead the proposal with the DA score alone",
            ],
            correctAnswer: 2,
            rationale:
              "Always show DA in context — the customer's score against three competitors. Numbers beat opinions. Never promise a specific DA increase.",
          },
          {
            id: "s11-q7",
            type: "multiple-choice",
            prompt: "Before you quote a product, you should be able to:",
            topic: "Product → category map",
            options: [
              "Predict the customer's twelve-month ROI",
              "Confirm the contract length and start date",
              "Recite at least three relevant case studies",
              "Name the category the product solves for",
            ],
            correctAnswer: 3,
            rationale:
              "If you can't name the category a product solves for, the customer can't either — and the deal will stall on price. Diagnose first, then quote.",
          },
          {
            id: "s11-q8",
            type: "short-answer",
            prompt:
              "In your own words, write the opening you would use in the first three minutes of an SEO pitch. Use the librarian metaphor. Three to five sentences. Imagine you're sitting across from a customer who has never been pitched SEO before.",
            topic: "Librarian metaphor — opening",
            modelAnswer:
              "Example: Think of Google as a librarian. There are millions of websites — millions of books on the shelf. When someone searches for what you sell, the librarian decides which books to put at eye-level and which to leave in the back room. SEO is the work we do to convince the librarian that your book belongs at eye-level. We do that across four categories: what your book says, what other authors say about you, whether your book actually opens cleanly, and whether you're the local expert on the topic. Make sense?",
            keywords: [
              "librarian",
              "book",
              "eye-level",
              "shelf",
              "on-page",
              "off-page",
              "technical",
              "local",
              "four categories",
            ],
            keywordsRequired: 4,
            softMinChars: 200,
            rationale:
              "Look for: (1) Google framed as librarian, (2) website framed as book, (3) shelf/eye-level imagery, (4) all four categories mentioned by name. Plain English, no jargon.",
          },
        ],
      },
    ],
  },

  {
    id: "session-10-six-week",
    number: "10",
    date: "2026-05-20",
    title: "The 6-Week Challenge. Authority. Sniper Calls. Bulk Cash.",
    summary:
      "A 6-week, $60k campaign through the existing client base. The campaign isn't the test — the new centralised operating model behind it is, and it's what runs the business from here on.",
    keyTakeaway:
      "A major shift starts today. $60k of revenue across six weeks, $15k in bonuses on the table, two teams competing, an upsell campaign through the existing client base, and a complete overhaul of how the day runs — schedules, scripts, and oversight all centralised. The campaign isn't the test. The OPERATING MODEL behind the campaign is the test — and if you run it properly, this is the model that runs everything from here on.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-10-six-week/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-10-six-week/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1RK34ZHHNo22oH78a_It55hgCZIw2qVwR"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1grMDdsbjh1X-enWHDnnbj6-E42q-7U4G"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1C9RBKDJrS_cdjoQfKB6cM9mDayCFdbuN"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s10-q1",
            type: "multiple-choice",
            prompt:
              "You're making the first outbound call to a client you haven't proactively contacted in four months. According to the authority reframe, the move you should NOT make is:",
            topic: "Authority reframe",
            options: [
              "Saying you're not their normal point of contact",
              "Apologising for the months since you last contacted them",
              "Calling out a senior title (head of customer service)",
              "Framing your silence as strategic (\"came up on my radar\")",
            ],
            correctAnswer: 1,
            rationale:
              "A, C, and D are all explicit moves in the authority reframe — establishing seniority, naming you're above the account, and framing the silence as deliberate. B is the rule the session specifically called out NOT to do. The minute you apologise for the silence, the client has you — you've handed them moral high ground. Instead, frame it: \"there was no point calling without a plan. Now we have a plan — that's why I'm calling.\"",
          },
          {
            id: "s10-q2",
            type: "multiple-choice",
            prompt:
              "When a prospect pushes back on the price of your recommended package, the framework says you should pivot the conversation to:",
            topic: "Price → math reframe",
            options: [
              "The math: backlinks per month vs industry standard",
              "The features and exclusive inclusions of the package",
              "Case studies of similar businesses you've delivered for",
              "The 4-month trial as a flexible, risk-reducing hedge",
            ],
            correctAnswer: 0,
            rationale:
              "B defends features — exactly what cheap competitors also have. C is fine generally but doesn't directly counter a price objection. D panic-deploys the trial concession before exhausting the math conversation — that's saving your strongest move for last. A is the play: replace a PRICE conversation (\"why is it so expensive?\") with a MATH conversation (\"why are you under-resourced?\"). They can argue with price perception. They can't argue with the backlink math.",
          },
          {
            id: "s10-q3",
            type: "multiple-choice",
            prompt:
              "Under the 4-month trial override, when does the rep receive the SECOND half of their commission?",
            topic: "Commission structure",
            options: [
              "At the end of the 4-month trial period regardless of conversion",
              "Only if the client converts to the full 12-month follow-on term",
              "At the 3-month decision call, when the conversation begins",
              "Spread evenly across each remaining month after the trial",
            ],
            correctAnswer: 1,
            rationale:
              "A treats the trial signing as the full event — but the structure deliberately ties payment to outcome. C jumps the gun: the 3-month CALL is when the conversation happens, not when the conversion is confirmed. D is a fabrication — there's no monthly drip. B is the rule: 50% on signup, 50% IF the client converts to the full 12-month term at month four. This structure means the rep is motivated to deliver real results in the trial window — not just close the trial and move on.",
          },
          {
            id: "s10-q4",
            type: "multiple-choice",
            prompt:
              "A campaign call is heading toward a lost client. According to the zero-fatalities rule, the right play is to:",
            topic: "Zero-fatalities rule",
            options: [
              "Push harder to convert — losing a client costs double to make back",
              "Drop to the lowest available package immediately to hold the relationship",
              "Back off and book a future re-engagement before they decide to leave",
              "Hand the client to a teammate to attempt a fresh re-pitch",
            ],
            correctAnswer: 2,
            rationale:
              "A doubles down on losing momentum, which is exactly when prospects dig in. B panic-discounts to hold an account that wasn't closeable today, and trains the prospect that pressure produces price cuts. D hands the loss to a teammate without changing the underlying problem. C is the rule: every call has TWO acceptable outcomes — UPSOLD or HELD. If a call is heading toward \"I'm leaving,\" back off and book a future check-in. Lost clients double the workload to recover from. Held clients can be re-engaged in three months. The zero-fatalities rule is uncompromising.",
          },
          {
            id: "s10-q5",
            type: "multiple-choice",
            prompt:
              "Under the new central calendar model, what changes for the individual rep?",
            topic: "Central calendar model",
            options: [
              "Daily appointments are assigned centrally; reps no longer pick clients",
              "The rep picks 3–4 clients to call from the assigned daily list",
              "Reps own their calendars but submit a daily plan to the director",
              "The rep manages their own schedule with a hard Friday 2pm cut-off",
            ],
            correctAnswer: 0,
            rationale:
              "B mis-describes the model — the assigned list IS the day, not a menu the rep picks from. C keeps rep autonomy with light oversight, but that's the old model with reporting bolted on. D is just the Friday rule applied to the existing model. A is the actual shift: the schedule is owned centrally and assigned day-by-day. The rep no longer picks who to call. The trade is real autonomy for compressed focus — and the Friday 2pm knock-off is the reward.",
          },
          {
            id: "s10-q6",
            type: "multiple-choice",
            prompt:
              "Why does the centralised calendar model produce more revenue work in LESS time?",
            topic: "Parkinson's Law applied",
            options: [
              "Reducing the cognitive load on logistics so reps focus only on calls",
              "Standardising the call mix so reps can benchmark each other's outcomes",
              "Compressing the time available, which forces low-value work to drop out",
              "Creating accountability through visibility into each rep's daily activity",
            ],
            correctAnswer: 2,
            rationale:
              "A is real but secondary — logistics relief is a benefit, not the mechanism. B is a side-effect that may or may not happen. D is also real but is about management visibility, not productivity. C is the principle the session named explicitly: Parkinson's Law — \"work expands to fill the time available.\" When reps own their calendars, days fill with low-value work because the time exists to fill. Compress the time, the low-value work drops out by necessity. Same reps complete more revenue work in fewer hours.",
          },
          {
            id: "s10-q7",
            type: "multiple-choice",
            prompt:
              "The director tells you in morning catch-up: \"Pitch Client X the authority package today.\" Which response demonstrates A-mode communication?",
            topic: "A-mode vs B-mode",
            options: [
              "\"I'll have a think about whether authority's right for them and let you know\"",
              "\"Okay, I'll add them to my pipeline and get to them sometime this week\"",
              "\"Yeah, will do, though I'd prefer to wait until I've reviewed last month's data\"",
              "\"Got it — quick questions: are they on $300 or $550, any recent issues?\"",
            ],
            correctAnswer: 3,
            rationale:
              "A is the textbook B-mode response — \"let me think about it\" is the going-off-to-process that freezes the campaign. B drifts the timeline (\"sometime this week\" = never). C delays under the cover of thoroughness — that's B-mode wearing the costume of A. D is the only A-mode response: heard the brief, asked clarifying questions IN the moment, set up to act. Note that genuine disagreement is also A-mode — but it has to happen IN the conversation, not later.",
          },
          {
            id: "s10-q8",
            type: "short-answer",
            prompt:
              "Pick a real client from the existing book you'll call in week one of the campaign. Write down the FOUR pre-prep numbers you need before that call: (1) current monthly spend, (2) current backlink count, (3) industry standard backlink count for their category, (4) the package you'll recommend. Then write your opening authority line, naming the client. (5–6 sentences)",
            topic: "Pre-prep + authority opener",
            modelAnswer:
              "Example: Client is Acme Plumbing. (1) Current spend: $300/month on SEO support. (2) Current backlinks: 14/month. (3) Industry standard for plumbing/trades: ~63/month. (4) Package I'll recommend: Authority at $550/month (126 backlinks/month — 9x their current quota). Opening line: \"Hi Mark, [name] here, I'm the head of customer service at Marketing Sweet. I know I'm not your usual point of contact — your campaign came up on my radar when I was reviewing all our accounts. I've had a look at yours and I want to walk you through what I've seen and what we're going to do about it.\"",
            keywords: [
              "current",
              "backlinks",
              "industry standard",
              "package",
              "authority",
              "radar",
              "head of",
              "9x",
              "month",
            ],
            keywordsRequired: 4,
            softMinChars: 300,
            rationale:
              "The four numbers are the spine of the call — without them, you're improvising and the math reframe collapses. The opening line establishes authority in the first 15 seconds (senior title + strategic-silence framing). Together they set the call up to close the upsell rather than negotiate it.",
          },
        ],
      },
    ],
  },

  {
    id: "session-09-integrity",
    number: "09",
    date: "2026-05-19",
    title: "Integrity Holds Water. Give the 1%. Get the 200%.",
    summary:
      "Every script in this toolkit only works if the operator running it has integrity — when you say something, you do it. The gap between saying and doing is where the money lives.",
    keyTakeaway:
      "Wednesday's session was scripts. Today's session was integrity. Every script in this toolkit only works if the operator running it has integrity — meaning when you say something, you do it. The team's current pattern is to receive instructions, agree out loud, and then quietly not deliver. That gap is where the money lives. Close the gap.",
    director: "Corie Dawson",
    totalTime: "~45 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-09-integrity/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-09-integrity/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1ssZuCF8G0RBsF3ssftRqSlZ1gLyOfVRG"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1ualgeuXkSqMpe-Fb2GT0ngwm0LNWLi5x"),
        durationSeconds: 1800,
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s9-q1",
            type: "multiple-choice",
            prompt: "According to Corie's definition, integrity is best described as:",
            topic: "Integrity defined",
            options: [
              "Doing the right thing even when nobody is watching the outcome",
              "Cleanliness of conversation — when you say something, you do it",
              "A reputation for being trustworthy, built over years with the team",
              "The willingness to admit mistakes openly when they occur on a pitch",
            ],
            correctAnswer: 1,
            rationale:
              "A is a more general moral definition — fine, but not the specific frame Corie used. C is \"reputation,\" which is a byproduct of integrity, not integrity itself. D is \"honesty,\" which is a separate pillar. B is the specific definition from the session: integrity is the cleanliness of the gap between saying and doing. The glass holds water — no leaks between what you commit to and what you actually deliver. Saying yes and not doing = low integrity, regardless of intention.",
          },
          {
            id: "s9-q2",
            type: "multiple-choice",
            prompt:
              "A rep tells the team three Mondays in a row that they'll have a deliverable done \"this week.\" Each Monday it's still pending. According to the glass-with-holes diagnostic, the right way to read this is:",
            topic: "Glass-with-holes diagnostic",
            options: [
              "The rep is overcommitted and needs help reprioritising their workload",
              "The rep doesn't understand the urgency and needs clearer communication",
              "The rep is going through a temporary rough patch and will recover",
              "The rep has three holes in their glass — each missed commitment leaks integrity",
            ],
            correctAnswer: 3,
            rationale:
              "A might be true but explains away the pattern rather than naming it. B treats it as a communication failure — but the rep clearly heard the commitment, they made it themselves. C is rationalisation. D is the right read: every missed commitment is a hole in the glass. Three weeks running, the rep has punched three holes — and the water (trust, momentum, the team's willingness to depend on them) is leaking across the table. Compassion can come later. Diagnosis first.",
          },
          {
            id: "s9-q3",
            type: "multiple-choice",
            prompt:
              "In the A/B/C choice model, what does a rep operating in Mode B look like?",
            topic: "A/B/C choice model",
            options: [
              "They listen, agree it's the right move, then load excuses for why it won't happen",
              "They listen, register nothing, and have no memory of being told a week later",
              "They argue with the instruction openly and try to negotiate a different approach",
              "They listen and act immediately, even when the request is inconvenient",
            ],
            correctAnswer: 0,
            rationale:
              "B describes Mode C (check out — total disengagement). C describes an open disagreement, which is actually healthier than Mode B because at least there's engagement. D describes Mode A (the target state). A is Mode B: the rep heard it, intellectually agreed, but has already started building the reason it won't happen for them specifically. Mode B is the most dangerous mode because it LOOKS like compliance from the outside while producing nothing. Mode C ends the career; Mode B plateaus it indefinitely.",
          },
          {
            id: "s9-q4",
            type: "multiple-choice",
            prompt:
              "A team's performance has been flat for six months — not regressing, just sideways. According to the session, why is this state worse than outright regression?",
            topic: "Sideways is worse than regression",
            options: [
              "Because flat performance signals that the team has lost its ambition",
              "Because the team's most ambitious members will leave to find growth elsewhere",
              "Because sideways doesn't trigger urgency — it gets rationalised as \"stable\"",
              "Because flat performance metrics make it harder to justify investment from leadership",
            ],
            correctAnswer: 2,
            rationale:
              "A is moralising. B and D are real consequences but secondary. C is the central insight: regression triggers urgency — you see the line drop, you act. Sideways looks fine, so it gets explained away as \"stable,\" \"consolidating,\" \"maintaining.\" Time keeps passing but the position doesn't change. Meanwhile, everyone NOT sideways is pulling further ahead by compounding. Six months later you're still in the same place — and now structurally behind.",
          },
          {
            id: "s9-q5",
            type: "multiple-choice",
            prompt: "According to the session, how should Sunday be spent — and why?",
            topic: "Sunday reflection",
            options: [
              "2–3 hours of structured reflection with no screens; produces a structural Monday-clarity advantage",
              "Recovery from the week — exercise, family time, deliberate disconnection from work entirely",
              "A flexible day that depends on the week ahead — sometimes prep, sometimes rest",
              "Light review of the week's emails so you don't walk into Monday cold",
            ],
            correctAnswer: 0,
            rationale:
              "B is healthy but isn't the Sunday principle Corie taught — recovery doesn't produce Monday clarity. C is what most people do, and produces inconsistent results. D is a weak version (emails are not reflection). A is the principle: structured reflection time using three written questions (what worked, what didn't, what changes this week). The structural advantage isn't the activity itself — it's that you walk into Monday with clarity that everyone else on the floor won't have until Wednesday. Two days a week of head-start × 50 weeks = 100 days of structural advantage every year.",
          },
          {
            id: "s9-q6",
            type: "multiple-choice",
            prompt:
              "A senior colleague has been abnormally quiet this week — not depressed, just noticeably less engaged. According to the \"sniffing the baseline\" principle, the right move is to:",
            topic: "Sniffing the baseline",
            options: [
              "Give them space and wait for them to surface the issue when they're ready",
              "Escalate to leadership so the right person can handle the conversation",
              "Open a door directly: \"Hey, you OK? You've been quieter — anything going on?\"",
              "Avoid commenting and let the natural rhythm of the team correct it organically",
            ],
            correctAnswer: 2,
            rationale:
              "A defers indefinitely — and the colleague has already shown the shift, which is the door opening. B escalates prematurely without first checking yourself. D treats baseline shifts as self-correcting, which they rarely are. C is the move: notice the shift, name it gently, open a door. You don't need to solve anything in the moment — just signal that you saw the change and care. If they don't open up, THEN you bring it to leadership. Better to over-care than miss something that surfaces visibly later.",
          },
          {
            id: "s9-q7",
            type: "multiple-choice",
            prompt:
              "According to the 1% / 200% trade, what does the \"1%\" typically refer to?",
            topic: "1% / 200% trade",
            options: [
              "The 1% of the rep's time that's being wasted on low-value activities each day",
              "The small attitude, habit, or pride that's holding back the entire upside",
              "The 1% improvement in close rates needed to hit the next quarterly target",
              "The 1% of clients who consume 99% of the rep's emotional bandwidth",
            ],
            correctAnswer: 1,
            rationale:
              "A is a time-management read — not the principle Corie taught. C is a metrics interpretation that misses the framing. D is the 80/20 principle applied to client portfolios — also a real thing, but not THIS principle. B is correct: the 1% is the single behaviour, attitude, or commitment you're holding onto — the pride that won't let you admit you didn't read the book, the defensiveness when correction lands, the small concession that crowds out Sunday reflection, the inherited pattern you can see clearly but won't change. The 1% is small in isolation but is the WHOLE gap between where you are and where you could be.",
          },
          {
            id: "s9-q8",
            type: "short-answer",
            prompt:
              "Identify YOUR 1% — the specific behaviour, attitude, or commitment you suspect is the biggest single thing holding you back. Then write down (1) where you think this pattern came from, and (2) the smallest concrete change you will make this week to drop it. (4–5 sentences)",
            topic: "1% / 200% trade",
            modelAnswer:
              "Example: My 1% is the defensive reaction I have when someone questions my approach on a call — I argue in the moment instead of taking notes and processing later. I think this came from years of being the youngest in my family, where being right meant being heard. The smallest change this week is: when someone questions me on a call, I will say \"let me think about that\" instead of jumping straight into defence. I'll review the question with a colleague within 24 hours and decide if they were right. The point isn't to never disagree — it's to stop the in-the-moment reflex that makes me look defensive and stops me hearing anything useful.",
            keywords: [
              "1%",
              "behaviour",
              "attitude",
              "pattern",
              "came from",
              "this week",
              "change",
              "concrete",
              "smallest",
              "reflex",
            ],
            keywordsRequired: 4,
            softMinChars: 250,
            rationale:
              "The 1% only collapses when you can name it specifically, trace its origin honestly, and replace it with a concrete behaviour change you can do THIS WEEK. Vague aspirations (\"be more open to feedback\") never land — the smallest, most specific habit change does.",
          },
        ],
      },
    ],
  },

  {
    id: "session-08-numbers",
    number: "08",
    date: "2026-05-18",
    title: "Know Your Numbers. Sell the Process, Not the Product.",
    summary:
      "Two failures often killed the same pitch — the rep didn't know the pricing cold, and they sold the product (the website) instead of the process (the build experience). Conviction lives in owning both.",
    keyTakeaway:
      "Two failures showed up in the same pitch this session: the rep didn't know the price points cold, and the rep sold the website (product) instead of the build experience (process). Either failure on its own kills a deal. Both together — guaranteed. Conviction comes from owning your numbers and your process so deeply you can be questioned for an hour without flinching. That depth is the only thing that produces real, unshakeable conviction.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-08-numbers/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-08-numbers/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("11BZ6gRTawY1xD5kKC7ZdOFp7GUawLYSj"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1JT42gD_GDrSEXMZl9Bs1p_FXQhGj_ueV"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1tDGslpgbkt54_9rS0gLq8_T1nhHz8KBv"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s8-q1",
            type: "multiple-choice",
            prompt:
              "A rep starts a pitch and is asked the price of a specific package. They hesitate, reach for their notes, and quote a number that's slightly off. According to the session, the most significant cost of this moment is:",
            topic: "Know your numbers cold",
            options: [
              "The prospect has been given a wrong number that may need correcting later",
              "The rep's authority is gone, and every subsequent claim sounds less believable",
              "The rep takes 30 seconds longer than they should to recover the pitch",
              "The prospect learns the rep relies on notes rather than memory",
            ],
            correctAnswer: 1,
            rationale:
              "A is a minor admin problem, easily fixed. C overstates speed; speed isn't the issue. D is partially true but doesn't capture the deeper cost. B is the real damage: the prospect uses the hesitation as a signal about everything else the rep says. If you don't know your own price, why would the prospect believe your claims about quality, process, or results? Authority is the load-bearing thing in a pitch — and it collapses the moment uncertainty shows.",
          },
          {
            id: "s8-q2",
            type: "multiple-choice",
            prompt:
              "A prospect compares your offer to a Squarespace website built by their mate for $2,000. The pitch the session recommends is to:",
            topic: "Sell the process, not the tool",
            options: [
              "Argue that Squarespace produces lower-quality output than industry-standard WordPress",
              "Drop your price to be within $500 of the competitor to keep the deal alive",
              "Show case studies proving your websites get better SEO results than DIY platforms",
              "Agree the DIY platform is fine, then shift the question from tool to their available time",
            ],
            correctAnswer: 3,
            rationale:
              "A defends FEATURES — exactly what the cheap platform also has. You can't win the feature comparison. B is panic-discounting; you've trained the prospect that your price isn't real. C is OK but still on the wrong battlefield (output quality). D is the right move: agree with the truth (DIY platforms ARE fine), then shift the conversation from \"tool vs tool\" to \"your time vs ours.\" The work doesn't vanish on a cheap platform — it moves to the customer. That's a question they can't answer favourably for the cheap option.",
          },
          {
            id: "s8-q3",
            type: "multiple-choice",
            prompt:
              "A prospect says: \"Your website looks better, and I get that — but my mate's Squarespace one was fine, and it was $2,000.\" Based on the double-whammy framework, the right structure for your response is:",
            topic: "Double-whammy framework",
            options: [
              "Agree with the surface points, dismiss their importance, then elevate to the real problem",
              "Disagree with the surface points, defend your quality, then justify your price",
              "Avoid commenting on the competitor and pivot to discussing your unique guarantee",
              "Acknowledge the price difference and offer a smaller package at a closer price point",
            ],
            correctAnswer: 0,
            rationale:
              "B picks a fight with their observations — you lose trust. C ignores the competitor reference entirely, which feels evasive and lets the comparison stand. D is panic-discounting. A is the three-step double-whammy: AGREE (yes, ours looks better; yes, his was fine) → UNDERCUT (but honestly, neither is your real problem) → ELEVATE (the real problem is the process, and that's what you're actually buying). You appear fair, the competitor comparison dies, and the conversation moves to your ground.",
          },
          {
            id: "s8-q4",
            type: "multiple-choice",
            prompt:
              "A prospect is doing $1.2M turnover, booked solid for nine months, and tells you they're happy at their current size. According to the session, the right tier to lead with is:",
            topic: "Reading the room on tier choice",
            options: [
              "The premium tier — always pitch high, regardless of stated intent",
              "The cheapest tier — they're not in growth mode, save them the money",
              "A middle tier framed as maintenance and protection, with two adjacent options",
              "A custom tier built specifically for their stated turnover band",
            ],
            correctAnswer: 2,
            rationale:
              "A applies \"pitch high\" as a rigid script, not as a rule of thumb — and gets rejected fast when the room says \"maintenance.\" B underestimates them and signals you're a low-value provider. D is over-engineering; we have five tiers, not bespoke quotes. C is the read-the-room move: their signals all point to stability, not growth, so frame the pitch as protection/maintenance and use the cotton-wool play (two adjacent tiers, soft opinion, room to move either way). Match the tier to the situation — not to the template.",
          },
          {
            id: "s8-q5",
            type: "multiple-choice",
            prompt:
              "A prospect is wobbling but engaged. You decide to deploy the \"where do I need to be?\" line. The critical phrase to include — without which the line loses its power — is:",
            topic: "\"Where do I need to be?\" line",
            options: [
              "\"I can only say no if it's outlandish, and that'll be the end of it\"",
              "\"We're really wanting to work with you, so let's find a way to make it happen\"",
              "\"Just give me a number you're comfortable with and I'll see what I can do\"",
              "\"Our pricing is fair, but I'm happy to discuss flexibility if needed\"",
            ],
            correctAnswer: 0,
            rationale:
              "B is begging language — undoes the entire frame. C invites a fantasy number and removes your right to walk. D is corporate hedging; the prospect feels no urgency. A is the asymmetric piece: it gives you the explicit right to walk away from an outlandish number, which is what transfers control of the conversation. Without it, you're just asking for a discount. With it, the prospect knows they're qualifying themselves in or out — and either response is useful to you.",
          },
          {
            id: "s8-q6",
            type: "multiple-choice",
            prompt:
              "After a prospect raises a price objection, the rep keeps describing them as \"the absolute best,\" \"the strongest applicant we've seen,\" \"genuinely amazing,\" and similar maximum-strength superlatives. Based on the session, the cost of this habit is:",
            topic: "Teryitis (superlative inflation)",
            options: [
              "The prospect feels uncomfortable being praised so directly during a sales pitch",
              "The rep's superlatives stop carrying weight, so genuine \"10/10\" moments don't land",
              "The rep loses time over-explaining when shorter language would close faster",
              "The prospect interprets the praise as flattery and discounts everything said afterward",
            ],
            correctAnswer: 1,
            rationale:
              "A is plausible but minor. C confuses verbosity with the actual issue. D names a side-effect but not the core problem. B is the principle Corie named \"teryitis\": when you over-state routinely, your average is already at maximum. There's nowhere to go when something is actually exceptional. Hedge slightly when you're uncertain (\"I think you'll like this\"), and the genuine top-of-scale calls land hard. Track-record matters; superlatives are a currency that loses value with overuse.",
          },
          {
            id: "s8-q7",
            type: "multiple-choice",
            prompt:
              "A prospect says \"I'll think about it\" at the end of a strong meeting. Rather than ask for permission to follow up, you decide to use the assumption close. The strongest version is:",
            topic: "Assumption close",
            options: [
              "\"Would it be okay if I called you next week to see where you've landed?\"",
              "\"I'll wait for you to be in touch — take whatever time you need, no pressure\"",
              "\"I'm sending the proposal now — sign the DocuSign and pay deposit when ready\"",
              "\"Let me know if you have questions and I'll be happy to send more details over\"",
            ],
            correctAnswer: 2,
            rationale:
              "A asks permission — you've put yourself back at the prospect's mercy. B is \"drop the rope\" but applied too softly; this isn't a trust failure. D is open-ended drift; nothing forces a next step. C is the assumption close: you haven't asked if they want to proceed — you've assumed they do and given them a specific next action. If they don't respond, you have a genuine reason to follow up (\"noticed you haven't signed — anything you needed to talk through?\"). The default of the conversation is yes.",
          },
          {
            id: "s8-q8",
            type: "short-answer",
            prompt:
              "Pick a prospect you're currently pitching (or a recent one). Write down the ONE objection they raised — or are most likely to raise — about a cheaper competitor. Then write the three lines of YOUR double-whammy response: AGREE, UNDERCUT, ELEVATE. (4–5 sentences total)",
            topic: "Double-whammy framework",
            modelAnswer:
              "Example: A plumbing prospect said \"my cousin can build me a Squarespace site for $1,800.\" AGREE: \"You're right — Squarespace can produce a perfectly fine-looking website, and $1,800 is genuinely cheaper than what we charge.\" UNDERCUT: \"But neither of those is your real problem. The platform is irrelevant once you're booked out six months ahead and don't have time to write the content, set up the SEO, or manage the hosting yourself.\" ELEVATE: \"What you're really buying from us is the process — we do the work, you give the brief, you launch in 12 weeks without lifting a finger. That's what the price reflects, and it's the part the $1,800 option doesn't include.\"",
            keywords: [
              "agree",
              "undercut",
              "elevate",
              "process",
              "time",
              "real problem",
              "platform",
              "tool",
            ],
            keywordsRequired: 3,
            softMinChars: 250,
            rationale:
              "The double-whammy works because it never picks a fight with the prospect's observation. It validates, then redirects the battlefield to ground where the cheap option can't win. Reps who can run this on the spot — not after the meeting, ON the call — hold their price and close at full rate consistently.",
          },
        ],
      },
    ],
  },

  {
    id: "session-07-likability",
    number: "07",
    date: "2026-05-15",
    title: "80% Likable. 20% Technical. Always.",
    summary:
      "Likability is the lever that controls every other lever in a sale. An 80% likable, 20% technical pitch builds enough connection that the prospect forgives small mistakes, takes your call, and looks for reasons to say yes.",
    keyTakeaway:
      "Likability is the lever that controls every other lever in a sale. A 100% technical pitch leaves zero room for error — one slip and the deal walks. An 80% likable, 20% technical pitch builds enough connection that the prospect forgives small mistakes, takes your call, and looks for reasons to say yes instead of reasons to say no. Likability is your insurance policy.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-07-likability/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-07-likability/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1REJ2-km36JTNhvH_JS6uE8WqV3QCBaL9"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1-XcZmOpHIjjA4pdER0d5s7mCC5Z2qCRk"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("189CZbEShqCT8TVyyyaq67RAF2xMBjn5v"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s7-q1",
            type: "multiple-choice",
            prompt:
              "Two reps pitch the same prospect with identical product knowledge. Rep A goes 100% technical. Rep B goes 80% likable and 20% technical. According to the session, the reason Rep B usually wins is:",
            topic: "Likability as insurance",
            options: [
              "Likability makes Rep B faster at handling objections during the pitch",
              "Customers prefer warm reps to cold reps and will pay more as a result",
              "Rep B has built enough goodwill to absorb the small mistakes every pitch contains",
              "Rep A spends so long on features that the prospect loses interest entirely",
            ],
            correctAnswer: 2,
            rationale:
              "A is plausible but secondary — likability isn't about speed of response. B is too simple and conflates likability with warmth-as-marketing. D blames the wrong variable (length, not approach). C is the real answer: every pitch contains small mistakes (wrong number, awkward pause, ill-judged comment). At 100% technical, every mistake is fatal because there's no goodwill to absorb it. At 80% likable, the prospect is invested in YOU as a person, so the same mistakes are forgiven. Likability is your insurance policy.",
          },
          {
            id: "s7-q2",
            type: "multiple-choice",
            prompt:
              "You're pitching a brand-new prospect you've never spoken to before. Based on the \"pasta recipe\" model, the ingredient you cannot use is:",
            topic: "Relationship recipe — time",
            options: [
              "Time — you have none of it yet",
              "Care — there's no basis for genuine care in a first meeting",
              "Sharing ideas — you don't know enough about them yet",
              "Giving — without a deal, there's nothing to give them",
            ],
            correctAnswer: 0,
            rationale:
              "B is wrong — care can (and should) be offered from the first second; it doesn't require history. C is wrong — sharing ideas IS how you learn about them; you don't need a backlog to start. D is wrong — giving doesn't require a contract; it means attention, research, thoughtfulness, useful information. A is the real one: time is the only ingredient you literally cannot have at the start. The whole point of the model is that you compensate by deliberately overloading the other four ingredients — care, experiences, sharing, giving — until time builds up over the relationship.",
          },
          {
            id: "s7-q3",
            type: "multiple-choice",
            prompt:
              "A prospect tells you mid-meeting: \"Honestly, I'm thinking about winding the business down — maybe two more years.\" The strongest play is:",
            topic: "Intent vs growth",
            options: [
              "Push harder on growth — they need to maximise revenue before they exit",
              "Reposition the pitch as preparing the business to sell, or step back gracefully",
              "Drop the price by 30% to make it easy to say yes before they wind down",
              "Recommend a smaller package and book a follow-up call in six months",
            ],
            correctAnswer: 1,
            rationale:
              "A overrides their stated intent — exactly the move the session warned against. C is panic-discounting; it treats an intent problem as a price problem. D is OK but misses the bigger opportunity. B is correct: someone winding down has a different buyer profile, and the website (or whatever you sell) becomes a sale asset, not a growth lever. Reframe the pitch entirely — or, if that doesn't fit, step back warmly. Either way you stop pitching the wrong package.",
          },
          {
            id: "s7-q4",
            type: "multiple-choice",
            prompt:
              "You meet a prospect for the first time and want to build rapport quickly. Which conversation starter is the most asymmetric (lowest downside, highest upside)?",
            topic: "Asymmetric bets",
            options: [
              "\"I love what the government did with the new budget — should be good for your industry\"",
              "\"What's your view on the recent interest rate changes — they've hit a lot of businesses hard\"",
              "\"It's a beautiful office — I've always thought this part of town suits this kind of business\"",
              "\"That must be a hard job — how do you keep all the moving pieces straight?\"",
            ],
            correctAnswer: 3,
            rationale:
              "A steps on a political landmine — half the people you ask will disagree, often strongly. B opens an economic-policy minefield with similar risk. C is polite filler — neutral, but doesn't build connection (no upside). D is the model asymmetric bet: if they agree, they unload challenges (connection through empathy); if they disagree, they tell you what they love about it (connection through enthusiasm). Either answer builds rapport. No downside.",
          },
          {
            id: "s7-q5",
            type: "multiple-choice",
            prompt:
              "A prospect ends a strong meeting with: \"You're a really nice guy — you remind me of my nephew. We're taking a cruise next month, but definitely give me a call next year, I really think we should do this.\" The right response is:",
            topic: "Reading the speech",
            options: [
              "Drop the price by 20% to lock the deal in before the cruise",
              "Graciously close out, bank the likability, and move on — don't fight it",
              "Push for a smaller commitment they can make before the cruise leaves",
              "Schedule a hard follow-up call for the week they get back from the cruise",
            ],
            correctAnswer: 1,
            rationale:
              "A is panic-discounting a deal that wasn't closeable for a price reason — it won't help. C tries to force a smaller deal but the issue isn't deal size, it's that lock 1 or lock 2 is shut. D is wasted calendar time chasing a polite no. B is the right read: this is \"the speech\" — they like you (lock 3 opened) but can't actually buy (lock 1 or 2 is shut). Don't fight it. Don't lower the price. The likability you built is banked for the future — pursue it again in 6–12 months when conditions might shift.",
          },
          {
            id: "s7-q6",
            type: "multiple-choice",
            prompt:
              "The session described a customer who bought TWO vehicles from a country dealer 200 km away, even though a closer city dealer offered better prices. The underlying principle is:",
            topic: "Buyer ransom",
            options: [
              "Likability creates buyer-side ransom — the customer wants to defend the relationship, not the deal",
              "Country dealers consistently provide better customer service than city dealers do",
              "Distance and inconvenience signal exclusivity, which makes customers value the purchase more",
              "Once a customer has bought once from a salesperson, repeat business is the default",
            ],
            correctAnswer: 0,
            rationale:
              "B is a stereotype — the story wasn't about geography but about behaviour. C is a backwards interpretation — distance was a friction the customer overcame, not a feature. D is too generic; many one-time buyers never return. A is the principle: when a salesperson is likable enough, the customer feels they HAVE to buy from them. They will defend the buying decision against cheaper, closer, or more convenient alternatives — because they don't want to lose YOU, the person. That's ransom, and it compounds over years.",
          },
          {
            id: "s7-q7",
            type: "multiple-choice",
            prompt:
              "You've worked with a client for two years. According to the session, the failure mode you're most at risk of right now is:",
            topic: "Complacency",
            options: [
              "Over-investing in the relationship and missing other opportunities",
              "Getting too familiar and accidentally crossing professional boundaries",
              "Letting complacency creep in and offsetting effort against accumulated time",
              "Becoming so dependent on the client that you can't negotiate fairly with them",
            ],
            correctAnswer: 2,
            rationale:
              "A is the opposite of the real risk — you'll likely under-invest, not over-invest. B and D both describe real risks in some relationships, but neither was the focus of the session. C is the principle: human nature is to use accumulated time as a substitute for the other ingredients (care, experiences, sharing, giving). The longer you've worked with someone, the more your brain subconsciously decides you can coast. High performers reverse this — they refresh care with long-term clients, not less.",
          },
          {
            id: "s7-q8",
            type: "short-answer",
            prompt:
              "Think of your three longest-tenured clients. For each, write down ONE specific act of care you will deliver this week that you wouldn't normally — something a stranger doing your job wouldn't do for them. Then explain why this matters for client retention. (3–4 sentences)",
            topic: "Refreshing care with long-term clients",
            modelAnswer:
              "Example: For Client A, I will hand-write a card thanking them for two years of partnership and reference a specific result we delivered together. For Client B, I will send an article relevant to their industry that I came across — with a one-line note about why I thought of them. For Client C, I will call them just to check in, with no agenda item to push. This matters because the natural human pattern is to coast on accumulated time and treat long-term clients with less care than new prospects — but that's exactly when they start looking elsewhere. Refreshing the care reverses the decay and signals that the relationship still matters to me, not just the revenue.",
            keywords: [
              "hand-write",
              "card",
              "article",
              "call",
              "check in",
              "no agenda",
              "care",
              "coast",
              "decay",
              "refresh",
              "long-term",
            ],
            keywordsRequired: 3,
            softMinChars: 200,
            rationale:
              "Refreshing care for long-term clients reverses the natural human pattern of coasting on accumulated time. The specific acts matter less than the deliberate decision to invest more in the relationships you can least afford to lose. Reps who refresh care with long-term clients keep them. Reps who don't, lose them — usually to someone running the new-prospect playbook against them.",
          },
        ],
      },
    ],
  },

  {
    id: "session-06-checklist",
    number: "06",
    date: "2026-05-14",
    title: "Use the Checklist, Connection Beats Technique",
    summary:
      "Every pitch is the same pitch — affordability first, product second, price last. The reps who close run the checklist on every call and treat the conversation as connection, not extraction.",
    keyTakeaway:
      "Every pitch is the same pitch. Affordability first, product second, price last. The reps who close are the ones who run the checklist on every call — and who treat the conversation as connection, not extraction. Connection is the master skill, because it lets you survive your own mistakes.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-06-checklist/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-06-checklist/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1Uc4TjeI--UQt2IGEwHaTSP3gM-X-YuBu"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1-89iJFfTDLn6sCTcHIWcizy8tzBrm9WK"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1h3pWjzQ-fNHDiVAhGvlhT4Hv5ua4JFFM"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s6-q1",
            type: "multiple-choice",
            prompt:
              "A prospect is a sole-trader tradesman doing physical installation work, with no employees and roughly $640k in annual revenue. Applying the affordability formula, the right baseline number to anchor your pitch around is:",
            topic: "Affordability formula (trade)",
            options: [
              "$640k — use the prospect's self-reported revenue as the base figure",
              "$100k — service business formula: one staff member at $100k each",
              "$1.92M — applying a margin multiplier on the reported revenue",
              "$300k — trade business formula: one staff member at $100k × 3",
            ],
            correctAnswer: 3,
            rationale:
              "A takes the prospect's number at face value, which Corie warned against — clients under-report. B applies the service formula to a trade business (it would for an accountant, not a tradesman installing materials). C is a fabricated number with no grounding. D is the correct trade formula: 1 staff × $100k × 3 = $300k. That puts you in the right affordability ballpark and gives you a defensible weekly value to anchor the pitch around.",
          },
          {
            id: "s6-q2",
            type: "multiple-choice",
            prompt:
              "You're pitching a prospect whose business is already booked solid for 12 months. Based on the abalone principle, the strongest opening move is:",
            topic: "Abalone principle",
            options: [
              "Wait to hear their objection, then handle it once they raise it",
              "Name the likely objection yourself before they take a position on it",
              "Pitch your highest-value package to anchor them at a premium price",
              "Ask what they're currently doing for marketing to gather information",
            ],
            correctAnswer: 1,
            rationale:
              "A is what the session called the trap — once a prospect verbally takes a position, they sucker down on it like an abalone on a rock, and no amount of skill will pry them off. C anchors on price before you've built any affordability picture. D is fine generally, but it doesn't address the predictable objection (the booked-solid prospect will say \"I don't want more leads\"). B is the abalone play: name \"I know you don't want a thousand leads — this isn't about that\" BEFORE they do. You've chosen the framing on your terms.",
          },
          {
            id: "s6-q3",
            type: "multiple-choice",
            prompt:
              "A prospect tells you \"I want to keep the business the same size — I don't want to grow.\" The right response that mirrors their language back through your product is:",
            topic: "Mirror, don't extract",
            options: [
              "\"Perfect — this is a maintenance package that protects what you've built, not a growth lever\"",
              "\"That's fine, but most clients who say that change their mind once they see results\"",
              "\"You should consider growth — every business that stays still eventually shrinks\"",
              "\"Okay, in that case let me know if you change your mind down the track\"",
            ],
            correctAnswer: 0,
            rationale:
              "B contradicts the prospect — that's extraction, not mirroring. C overrides their stated position entirely; it's the opposite of meeting them where they are. D is \"drop the rope\" applied wrongly — they haven't signalled trust failure, they've told you what they want. A takes their exact frame (\"keep it the same size\") and repackages it inside your product wording (\"maintenance package, protect what you've built\"). They feel heard. The product feels custom-fit. You've done very little original sales work.",
          },
          {
            id: "s6-q4",
            type: "multiple-choice",
            prompt:
              "According to the 90/10/1 rule, in a 60-minute closing call, how much time should you spend talking about your product?",
            topic: "90/10/1 rule",
            options: [
              "About 30 minutes — half the call should be product-focused",
              "About 20 minutes — enough to fully cover features and pricing",
              "About 6 minutes — tailored from the customer's own language",
              "About 1 minute — only when the customer explicitly asks for it",
            ],
            correctAnswer: 2,
            rationale:
              "A and B both massively overweight the product. If you spend 30 minutes on product, the prospect has spoken for the other 30 — and at no point did you build the connection that turns \"let me think about it\" into a real conversation. D under-weights it — the product still needs to be described, just in their language. C is the 90/10/1 ratio: 90% about the prospect, 10% about the product (~6 min of 60), 1% about the price (~36 seconds). If you finish a call and you did most of the talking, you lost that call.",
          },
          {
            id: "s6-q5",
            type: "multiple-choice",
            prompt:
              "Why does the session argue that connection matters more than technique?",
            topic: "Connection beats technique",
            options: [
              "Because customers fundamentally buy people, not products or services",
              "Because connection lets you survive your own mistakes during a pitch",
              "Because building rapport is faster than learning every objection script",
              "Because connected prospects pay a higher price for the same package",
            ],
            correctAnswer: 1,
            rationale:
              "A is partly true but vague — it doesn't explain why connection beats technique specifically. C is wrong: connection isn't a shortcut to skip technique, it's the foundation under technique. D conflates connection with discounting psychology — the session never said connected prospects pay more. B is the real argument: with connection, you can say something slightly clumsy and still close — they like you enough to forgive the misstep. Without it, every flaw is fatal. Connection is your insurance policy against your own mistakes.",
          },
          {
            id: "s6-q6",
            type: "multiple-choice",
            prompt:
              "After delivering your pitch and a price the prospect didn't flinch at, the strongest next move is to:",
            topic: "Assumption close",
            options: [
              "\"I'll send you the link. All I need is a deposit — what day works for your kick-off call?\"",
              "\"Would you like to proceed, or do you need some time to think about it first?\"",
              "\"Any questions before we move forward — anything you're still unsure about?\"",
              "\"Let me know when you're ready to lock it in and I'll send the paperwork through\"",
            ],
            correctAnswer: 0,
            rationale:
              "B re-opens the closed question and invites a \"let me think.\" C invites doubts that may not exist — never solicit objections you haven't earned. D leaves the next step entirely with the prospect, who will drift. A is the assumption close: skip \"would you like to proceed?\" entirely and go straight to logistics (deposit, kick-off scheduling). The default of the conversation is yes. Customers who want the product also want the meeting to end — help them get there.",
          },
          {
            id: "s6-q7",
            type: "multiple-choice",
            prompt:
              "A walk-in prospect responds to your greeting with \"I'm just looking.\" The strongest pattern-interrupt is to:",
            topic: "Pattern interrupt",
            options: [
              "Back off and let them browse without further engagement",
              "Ask what specific category of product they came in looking for",
              "Disrupt the script with something unexpected, then offer to leave them to it",
              "Direct them to a self-service price list and the FAQ display",
            ],
            correctAnswer: 2,
            rationale:
              "A accepts the salesperson frame they walked in with and shuts down any connection. B is fine but still inside the salesperson script — you're extracting information. D abandons the interaction. C is the move: say something the prospect didn't expect (\"funny way to feel\"), give context (you said hello because the boss expects it), then explicitly release the pressure (\"I'll leave you to it\"). This positions you as human, not as quota — and the conversation now runs on different rails.",
          },
          {
            id: "s6-q8",
            type: "short-answer",
            prompt:
              "Pick a prospect you're currently pitching (or a recent one). Write down the ONE objection they are most likely to raise based on their business situation. Then write the line you would use to pre-empt that objection — naming it first, on your terms, before they raise it. (3–4 sentences)",
            topic: "Pre-empt the objection",
            modelAnswer:
              "Example: I'm pitching a tradesman who is booked solid for 18 months. The most likely objection is \"I don't want more leads, I'm already too busy.\" My pre-empt line would be: \"Look, I can see you're already booked out, so I want to be clear — this isn't about flooding your phone with more enquiries. Your website looks weak, and in an uncertain economy a single cancelled job costs you more than a year of this service. Treat it as insurance protecting the work you already have, not a growth lever.\" This dismantles the objection before they verbalise it, and frames the entire pitch on my terms — protection, not growth.",
            keywords: [
              "objection",
              "pre-empt",
              "name",
              "first",
              "terms",
              "frame",
              "insurance",
              "protection",
              "abalone",
            ],
            keywordsRequired: 3,
            softMinChars: 200,
            rationale:
              "The whole point of the abalone principle is that once the prospect takes a verbal position, you can't move them off it. The only way to win the framing battle is to take it yourself, first, before they can. Practising the pre-empt line out loud — on real prospects — turns this from theory into reflex.",
          },
        ],
      },
    ],
  },

  {
    id: "session-05-discipline",
    number: "05",
    date: "2026-05-13",
    title: "Discipline is the Multiplier, You're the Operator Now",
    summary:
      "The team is stronger than ever — but results are down. The variable that changed isn't the people, it's the habits. Discipline drove the peak; discipline drifted; results followed. Also a leadership handover: senior reps step up as operators.",
    keyTakeaway:
      "The team is better than it has ever been. Results are down. The variable that changed is not the people — it is the habits. Discipline drove the peak, discipline drifted away, results followed. This session is also a leadership handover: Corie steps back into an investor role, and the senior reps step forward as the operators of the business.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-05-discipline/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-05-discipline/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1SXsFdFmeYoZjhJlNjL8H4YHNJkmmifri"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1uUqGzh30ALyargvwCRDiKuoChlQUqJoh"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("12mHfkko70A8CF3O8DVRM12nUEYZQ4lC0"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s5-q1",
            type: "multiple-choice",
            prompt:
              "Your team's closing numbers have dropped over the last three months. The current team has the strongest raw talent the company has ever had. The most leveraged first question to ask is:",
            topic: "Habits over people",
            options: [
              "Which reps are dragging the team average down on closes",
              "What's changed in the market that we should adapt to",
              "Which daily habits were running at our last peak that aren't now",
              "Should we lower our standard pricing to lift volume back up",
            ],
            correctAnswer: 2,
            rationale:
              "A makes a person-level assumption — but the team is stronger than ever, so it's the wrong frame. B externalises the cause to something you can't control. D treats a habits problem as a pricing problem. C is the right diagnostic: when results drop with a strong team, the variable that changed is almost always the daily routine, not the people or the market.",
          },
          {
            id: "s5-q2",
            type: "multiple-choice",
            prompt:
              "Corie has repositioned himself as an investor and the senior reps as operators. The clearest behavioural test of whether a rep has made the shift is:",
            topic: "Investor/operator reframe",
            options: [
              "They pitch ideas to Corie before being asked, and ask him to back them",
              "They check in with Corie before making any significant decision",
              "They report their results to Corie at the same cadence as before",
              "They take on extra responsibilities while keeping the same routine",
            ],
            correctAnswer: 0,
            rationale:
              "B and C are the old dynamic — waiting for direction and just reporting upwards. D adds work without changing how decisions get made. A is the shift: operators identify problems, design solutions, and pitch them upward — they don't wait. The clearest sign of the reframe is unprompted ideas being brought to Corie like he's an investor, not a manager.",
          },
          {
            id: "s5-q3",
            type: "multiple-choice",
            prompt:
              "A rep's closing rate has dropped sharply over six weeks. Based on the unsung-hero principle, the first place to investigate is:",
            topic: "Unsung-hero principle",
            options: [
              "The rep's tone of voice and confidence on recent calls",
              "Whether the rep's product knowledge has gaps",
              "Whether the rep's commission structure is still motivating",
              "The quality and volume of leads being fed into the rep's funnel",
            ],
            correctAnswer: 3,
            rationale:
              "A, B, and C all look at the front-line rep, which is the visible layer but rarely the actual source. The unsung-hero principle says the front-line performance is downstream of what's feeding it — the lead-gen quality and the daily drilling routine. Most leverage lives upstream. Investigate the inputs before adjusting the operator.",
          },
          {
            id: "s5-q4",
            type: "multiple-choice",
            prompt:
              "You catch yourself thinking \"this routine feels really good right now — I should do more of it.\" According to the session, the right next move is to:",
            topic: "Feel-good inversion",
            options: [
              "Trust the feeling — if it feels right, it's probably working",
              "Pause and check whether it's actually profitable or just comfortable",
              "Add it to the team's daily routine without further analysis",
              "Run it for two more weeks to confirm the feeling holds up",
            ],
            correctAnswer: 1,
            rationale:
              "A and C take the feel-good signal at face value — exactly the trap. D treats the feeling itself as evidence, just over a longer window. B applies the inversion rule: when a habit feels good in the moment, that's a flag to consciously check whether it's building your future or just keeping you comfortable. Discipline is the trained ability to override the feel-good signal.",
          },
          {
            id: "s5-q5",
            type: "multiple-choice",
            prompt:
              "In the punch-card model, what makes an unprofitable decision more costly than a \"neutral\" one?",
            topic: "Punch-card model",
            options: [
              "It punches a permanent hole in your reputation",
              "It costs you commission on that specific deal",
              "It forces a profitable decision later just to break even",
              "It signals to your manager that you need more coaching",
            ],
            correctAnswer: 2,
            rationale:
              "A overstates the reputation impact of a single decision. B is just the dollar cost — the punch-card model is about something broader. D treats it as a visibility problem. C is the actual mechanic: bad decisions don't just sit there. Each one forces you to spend a future profitable decision on recovery, so the net cost of two bad decisions is roughly three good ones you could have made instead.",
          },
          {
            id: "s5-q6",
            type: "multiple-choice",
            prompt:
              "Three senior reps. One naturally strong on discipline. One naturally strong on people. One naturally strong on knowledge. The right play is for each to:",
            topic: "Specialisation in leadership",
            options: [
              "Double down on their lane and trust the other two to cover the rest",
              "Cross-train to become equally strong across all three lanes",
              "Rotate weekly so everyone develops every skill set over time",
              "Defer leadership to whichever lane is most needed each week",
            ],
            correctAnswer: 0,
            rationale:
              "B is the trap — assuming you should be all three. Nobody is. C dilutes specialisation and slows everyone down. D creates leadership ambiguity and means each rep is most of the time outside their natural strength. A is the play: specialise, lean in hard, and trust the peers covering the other two. Cross-coach from your strengths; don't try to be a copy of your peers.",
          },
          {
            id: "s5-q7",
            type: "multiple-choice",
            prompt:
              "A prospect ended the meeting ambiguously and you can't tell if they're a real buyer or politely fading away. The strongest follow-up move is to:",
            topic: "Ambiguous prospects",
            options: [
              "Send them more case studies and circle back next week",
              "Ask one direct question that gives them permission to opt out cleanly",
              "Wait two weeks for them to surface before reaching out again",
              "Offer a small discount to test whether they're serious about buying",
            ],
            correctAnswer: 1,
            rationale:
              "A wastes a week and trains the prospect that you'll keep chasing. C is \"drop the rope\" applied wrongly — that's for trust failures, not unread signals. D panic-discounts a prospect who may not have a price objection at all. B is the rock-solid play: an unapologetic, direct line (\"you're welcome to tell me now if it's not for you — or I can call in three days, or a week, which would you prefer?\") that gives them permission to be honest and forces a real next step.",
          },
          {
            id: "s5-q8",
            type: "short-answer",
            prompt:
              "Corie said: \"If a habit feels good in the moment, double-check whether it's actually serving you. If it feels bad in the moment, double-check whether it's actually the thing you should be doing more of.\" Translate this principle into ONE specific habit you will deliberately keep doing this week (even though it feels bad in the moment) and explain why. (3–4 sentences)",
            topic: "Feel-good inversion",
            modelAnswer:
              "Example: I will run a 25-minute objection-drilling session with a colleague every weekday morning, before the first client call. It feels bad in the moment — it's repetitive, slightly embarrassing, and the immediate payoff is invisible. But every other behaviour in this session points to the same conclusion: the things that feel bad now are usually the things building my future. I will judge it on the outcome after six weeks (closes, not how the drilling sessions felt), not on the day-to-day discomfort. If I miss a session because \"I didn't feel like it,\" I will treat that as a signal that the feel-good inversion is operating — not as a legitimate reason.",
            keywords: [
              "drilling",
              "repetitive",
              "uncomfortable",
              "discipline",
              "outcome",
              "six weeks",
              "future",
              "feel",
              "habit",
            ],
            keywordsRequired: 3,
            softMinChars: 200,
            rationale:
              "Things that feel bad in the moment — drilling, cold calls, post-mortems — are typically the things building real skill. The discipline is to keep doing them even when the immediate signal is unpleasant, and to judge them on the outcome six weeks out, not on how the session felt today.",
          },
        ],
      },
    ],
  },

  {
    id: "session-04-rock-solid",
    number: "04",
    date: "2026-05-12",
    title: "Rock Solid is the Energy, Say It Then Deliver It",
    summary:
      "Energy is not flamboyance — it is certainty. Certainty is built one promise at a time, until your word becomes the most trusted thing about you.",
    keyTakeaway:
      "Energy is not flamboyance. It is certainty. Certainty is built from one specific habit — saying something and then delivering exactly that, every time, until your word becomes the most trusted thing about you. Rock solid is the difference between a deal closing and a deal walking.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-04-rock-solid/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-04-rock-solid/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1aJSUvBCJr9Pr8lWgRDjwq89nm-PQz8B6"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("16Gai_uhcIm7sPS2HHhdPpagjds31LF-p"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1m90OZx4WMkBoc-gnfKt3dvaT2GUCoVSe"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s4-q1",
            type: "multiple-choice",
            prompt:
              "Two reps deliver the same closing script, word for word, to similar prospects. One closes the deal. The other doesn't. According to Corie, the variable most likely deciding the outcome is:",
            topic: "Rock solid track record",
            options: [
              "Whether the rep has previously delivered on small promises made",
              "The tone of voice and pacing during the delivery itself",
              "The order in which the clauses of the script are spoken",
              "The rep's natural confidence level and personality fit",
            ],
            correctAnswer: 0,
            rationale:
              "Rock solid is not the script and not the personality — it's the track record. The customer can feel whether the rep has, over previous interactions, said things and delivered them. That accumulated trust is what closes the deal — not the words. Two reps with identical scripts will get different results because one has a track record behind their voice and the other doesn't.",
          },
          {
            id: "s4-q2",
            type: "multiple-choice",
            prompt:
              "A prospect, burned by two previous agencies, says they'll sign for six months but no longer. You know 12 months is needed for the SEO work to compound. The strongest play is to:",
            topic: "The 6 + 12 structure",
            options: [
              "Drop to a 6-month contract and use the time to prove value, then upsell",
              "Sign 6 months first that rolls into a fresh 12-month contract at month six",
              "Hold firm at 12 months and walk away if they refuse to budge on length",
              "Take it back to your manager and let them decide what discount to offer",
            ],
            correctAnswer: 1,
            rationale:
              "A is a flat 6-month deal — no follow-on commitment, so we lose the duration we need and signal we fold under pressure. C is too rigid and loses an otherwise good deal. D ferries the decision to someone else without a verbal commit and breaks rock-solid energy. B is the 6+12 structure: a 6-month initial agreement, with a fresh 12-month contract signed at the 6-month mark if both sides want to continue. If results land, total commitment becomes 18 months (6 + 12). If they don't, the prospect walks at month six. Both sides win.",
          },
          {
            id: "s4-q3",
            type: "multiple-choice",
            prompt:
              "A prospect asks for a discount. You think it might be possible. Before going back to your manager to ask, the single most important thing to confirm with the prospect is:",
            topic: "Verbal commit before discount",
            options: [
              "That the prospect has read the full proposal documents",
              "That the prospect has authority to sign on their company's behalf",
              "That the prospect will sign today at the discounted price",
              "That the prospect understands the value of the standard package",
            ],
            correctAnswer: 2,
            rationale:
              "A and D are useful but secondary — they should already be settled. B matters but doesn't prevent the most common failure (a yes from your manager that produces another \"let me think about it\"). C is the verbal commit — without it, the discount discussion is meaningless and you're just training the prospect to negotiate against the office.",
          },
          {
            id: "s4-q4",
            type: "multiple-choice",
            prompt:
              "In the four-step diagnostic, after the prospect says \"I'm not signing today\" and you've responded \"Perfect — I wouldn't expect you to sign today,\" what is the very next thing to say?",
            topic: "Four-step diagnostic",
            options: [
              "\"Can I ask — what would change your mind right now?\"",
              "\"Just out of interest — out of 10, where are you sitting?\"",
              "\"What's stopping you from being able to sign today?\"",
              "\"Would it help if I lowered the price slightly to land it?\"",
            ],
            correctAnswer: 1,
            rationale:
              "A and C are reasonable but vague — the prospect will give you smoke (\"I just need to think it over\"). D panic-drops the price before you've diagnosed the real objection. B is the specific Step 2: it forces a number. A 9 means almost. A 7 means there's a real, recoverable objection underneath — and you've created the wedge you need to surface it.",
          },
          {
            id: "s4-q5",
            type: "multiple-choice",
            prompt:
              "A strong meeting ends with the prospect saying \"Looks great — I just need to do my due diligence and I'll get back to you.\" Based on this session, the rock-solid response is to:",
            topic: "Isolation question",
            options: [
              "Schedule a follow-up call for two weeks to check on progress",
              "Thank them for their time and let them lead the next contact",
              "Send a follow-up email with case studies to support research",
              "Ask one isolation question to surface the real objection now",
            ],
            correctAnswer: 3,
            rationale:
              "\"Due diligence\" is almost always a translation for \"I have a price objection.\" A and C are what weak reps do — they let the smoke stand and the deal drifts. B is the \"drop the rope\" move which only applies after a trust failure, not here. D runs the isolation play immediately (\"all things aside, let's focus on price — if I can get you to $X...\") and either closes the deal or surfaces the real reason it won't close.",
          },
          {
            id: "s4-q6",
            type: "multiple-choice",
            prompt:
              "You agreed a price contingent on closing Friday. The prospect didn't answer on Friday. On Monday, the strongest play is to:",
            topic: "Holding deadlines",
            options: [
              "Send one professional close-out message and move on without follow-up",
              "Lower the price further and offer a fresh deadline to revive momentum",
              "Call again Monday with the same price and try to rebuild urgency",
              "Send the prospect to a competitor as a goodwill gesture and walk",
            ],
            correctAnswer: 0,
            rationale:
              "B is a panic-drop — it trains the prospect that your prices and deadlines aren't real. C keeps the same price but breaks the deadline, which destroys your rock-solid energy with this prospect (and every one after them). D is just weird. A is the play: send one professional message (\"Friday was the deadline, $650 is off the table, wish you well\"), then move on. Real prospects come back. Time-wasters don't. Either way, you win.",
          },
          {
            id: "s4-q7",
            type: "multiple-choice",
            prompt:
              "A rep takes 30 calls a week but consistently loses on objection handling. Based on the session, the most leveraged way to improve is to:",
            topic: "Drilling vs sparring",
            options: [
              "Read books on negotiation psychology to deepen theoretical knowledge",
              "Shadow a top performer on their calls to see what they do",
              "Drill specific objection scripts with a colleague until reflexive",
              "Take more calls per week to gain wider exposure to patterns",
            ],
            correctAnswer: 2,
            rationale:
              "D is the most common (and least effective) instinct — taking more calls is more sparring, not more drilling. A is theory without reflex. B helps (shadowing builds awareness) but doesn't build your own muscle memory. C is the answer: rep-and-rep role play with a colleague until the script lands automatically. That's how 10,000-hour operators are built. Almost every rep on the team is sparring-heavy and drilling-light — that's the gap.",
          },
          {
            id: "s4-q8",
            type: "short-answer",
            prompt:
              "Corie talks about \"burning the boats\" — borrowing from Sun Tzu, who ordered his troops to destroy their boats on landing so retreat became impossible. Translate this principle into one concrete habit you will apply to your sales work this week. (2–3 sentences)",
            topic: "Burning the boats",
            modelAnswer:
              "Example: I will announce my weekly closing target to the team out loud at Monday morning standup, before the work is done. By making the commitment public, I remove the easy exit — I can't quietly miss it without anyone noticing. The same principle applies to follow-up times: if I tell a prospect I'll call Friday at 11am, I treat that as a hard contract with myself. The compounding effect is rock-solid reputation: every promise delivered makes the next promise more believable.",
            keywords: [
              "announce",
              "public",
              "commit",
              "promise",
              "deadline",
              "deliver",
              "exit",
              "no retreat",
              "rock solid",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "Burning the boats means removing the easy exit so you have to deliver. The practical translation is making private intentions into public commitments — a target announced at standup, a callback time given to a prospect, a deadline written in front of the team. Once it's public, missing it has a cost. That cost is what builds rock-solid reputation over time.",
          },
        ],
      },
    ],
  },

  {
    id: "session-03-obsession",
    number: "03",
    date: "2026-05-11",
    title: "Obsession is the Multiplier, Balance is the Scam",
    summary:
      "Obsession is a choice you've already made elsewhere — university, sport, dating. The only question is why you're not making it about the thing that pays your bills.",
    keyTakeaway:
      "Nothing you've been taught matters unless you bring obsessive-level effort to applying it. Obsession is the multiplier on everything — and you've already proven, in other parts of your life, that you know how to be obsessed. Today is about redirecting that capability.",
    director: "Corie Dawson",
    totalTime: "~50 min",
    assets: [
      {
        kind: "debrief",
        estimate: "10 min read",
        url: "/sample-content/session-03-obsession/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-03-obsession/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1hZSfQtzKZMQ9gm9lc8FsFXIUOe5KQ9bN"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1xNo90x4N7azYyc5CuYGPmTuRM49uHz2k"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1skvQKfSgNH6BYLqPbDlOpwebnxIUE18l"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "8 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s3-q1",
            type: "multiple-choice",
            prompt:
              "According to Corie, the relationship between effort and obsession is best described as:",
            topic: "Obsession",
            options: [
              "Obsession is something a sales coach can train into you over time",
              "Obsession is a personality trait — you either have it or you don't",
              "Obsession is unhealthy and reps should be discouraged from it",
              "Obsession is a choice you've already made elsewhere in your life — the only question is where you choose to spend it",
            ],
            correctAnswer: 3,
            rationale:
              "Every rep has already demonstrated obsessive effort in some area of their life — university, sport, dating, or a personal goal. The question isn't CAN you be obsessed; it's where you're choosing to spend it. The career is often last on the list.",
          },
          {
            id: "s3-q2",
            type: "multiple-choice",
            prompt:
              "How should a rep approach the notes from a previous training session before the next one?",
            topic: "Continuity rule",
            options: [
              "Treat training as cumulative — review notes before every session like a judo student drilling a technique before the next lesson",
              "Trust their memory — they were in the room",
              "Skim them only if there's time after other priorities",
              "Wait until the topic is reviewed in a future session",
            ],
            correctAnswer: 0,
            rationale:
              "Each session builds on the last. Showing up without having reviewed previous notes forces the trainer to re-cover ground and forces you to re-learn material you should already own. Treat every session like a judo lesson — drill the material in between, or it's wasted time for everyone.",
          },
          {
            id: "s3-q3",
            type: "multiple-choice",
            prompt: "The only metric Corie cares about is:",
            topic: "Effort vs results",
            options: [
              "Hours worked",
              "Time spent at desk",
              "Results — deals closed, quotas hit, behaviours adopted",
              "Effort visible to managers",
            ],
            correctAnswer: 2,
            rationale:
              "\"I'm not interested in how hard you work. I'm just interested in whether you're achieving the results.\" Hours worked is a comforting metric that gives you a story to tell when outcomes aren't there. Outcomes are the only thing the business runs on.",
          },
          {
            id: "s3-q4",
            type: "multiple-choice",
            prompt:
              "When estimating turnover for a TRADE business (one with vehicles, materials, sub-contractors) with 20 staff, the right number to use is roughly:",
            topic: "Estimating turnover",
            options: [
              "$6M ($100k × 20 × 3)",
              "$2M ($100k × 20)",
              "$500k (conservative estimate)",
              "Whatever the prospect tells you",
            ],
            correctAnswer: 0,
            rationale:
              "The Session 2 service-business rule was $100k per staff. Trade businesses pass through materials, vehicles, sub-contractors — so multiply by ~3x. 20 staff × $100k × 3 = $6M. Going in at $2M means you've under-pitched by 70% before the meeting even starts.",
          },
          {
            id: "s3-q5",
            type: "multiple-choice",
            prompt:
              "Which sentence did Corie call the most dangerous a rep can carry?",
            topic: "Dangerous mindsets",
            options: [
              "\"I don't know.\"",
              "\"I'm already set up.\"",
              "\"I need to think about it.\"",
              "\"It's not my fault.\"",
            ],
            correctAnswer: 1,
            rationale:
              "The danger is that the statement might be technically true today — you ARE doing okay relative to where you started. But the moment you accept the frame, you stop running the magnets. In 5–10 years the people who never accepted the frame have lapped you, and there's no catching back up.",
          },
          {
            id: "s3-q6",
            type: "multiple-choice",
            prompt:
              "What does Corie call \"the biggest scam\" in how people talk about work and life?",
            topic: "Balance is a scam",
            options: [
              "Hustle culture",
              "Networking",
              "Balance",
              "Personal branding",
            ],
            correctAnswer: 2,
            rationale:
              "\"Balance is the biggest scam. You don't win Judo championships across the globe by being un-obsessed.\" The cultural idea of balance is a comforting story average people tell themselves to justify not getting outlier outcomes. If you want the average outcome, run an average schedule. If you want the outlier outcome, accept an outlier schedule.",
          },
          {
            id: "s3-q7",
            type: "multiple-choice",
            prompt:
              "Approximate annual income growth on an employee pay grade vs. an owner/operator track:",
            topic: "Income trajectories",
            options: [
              "Both grow at roughly the same rate",
              "Employee compensation is unlimited if you're a top performer",
              "Owner/operator grows ~10%, employee ~7%",
              "Employee ~5%/year (linear, bounded); owner/operator compounds and is unbounded",
            ],
            correctAnswer: 3,
            rationale:
              "Employment compensation is bounded by what an employer can justify paying — usually ~5%/year, rarely more than 10%. Ownership/operator compensation comes from equity, commission, compounding skill, reputation, and network. After 10 years: employee ~60% more than starting; owner/operator 5–10x more.",
          },
          {
            id: "s3-q8",
            type: "short-answer",
            prompt:
              "Describe in your own words who the \"invisible competition\" is and why they pose a bigger threat to your career than the rep at the next desk. (2–3 sentences)",
            topic: "The invisible competition",
            modelAnswer:
              "The invisible competition is the person you've never met who is obsessed by necessity — for example, a tradesman apprentice working a full day on a site then driving Uber until midnight to send money to family overseas. They have no plan B, so obsession isn't a personality choice for them, it's survival. In 10 years they'll own multiple properties and a small business; the complacent local rep with a degree and a roof will still be in the same job. The difference isn't intelligence or opportunity — it's obsession, and the market doesn't care which side you're on.",
            keywords: [
              "invisible",
              "competition",
              "obsessed",
              "necessity",
              "no plan b",
              "tradesman",
              "uber",
              "obsession",
              "10 years",
            ],
            keywordsRequired: 3,
            softMinChars: 150,
            rationale:
              "The threat isn't the rep next to you — it's the person you'll never meet, obsessed by necessity, building a parallel career while you sleep. The difference at the 10-year mark is enormous and entirely driven by who put in obsessive effort during the years that mattered most.",
          },
        ],
      },
    ],
  },

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
        estimate: "10 min read",
        url: "/sample-content/session-02-big-energy/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-02-big-energy/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("1E0c9gngXjoAv2N6PpwdTQtLjNAwVA8Lb"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1Dd5UtC_Q_qsdqYO3Yz54TrIJdYhajMM-"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1CVqRD0VdH0fm2nq89LX9jsx6ARxgh2_5"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "10 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s2-q1",
            type: "multiple-choice",
            prompt: "After a lost deal, your only allowed next thought should be:",
            topic: "Solutions vs excuses",
            options: [
              "Why the prospect was a bad fit",
              "Whether the market is bad right now",
              "What you will do differently next time",
              "Whether the price was wrong",
            ],
            correctAnswer: 2,
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
              "Pull success in / push failure away",
              "Pull customers in / push competitors away",
              "Pull money in / push debt away",
              "Pull leads in / push admin away",
            ],
            correctAnswer: 0,
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
              "Probe, Pitch, Pause, Pivot, Push",
              "Prior Preparation Prevents Poor Performance",
            ],
            correctAnswer: 3,
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
              "Multiply by approximately 2x",
              "Subtract 20% to be conservative",
              "Ignore turnover, focus only on jobs per day",
            ],
            correctAnswer: 1,
            rationale:
              "Reps under-state their numbers to salespeople. Multiply by ~2x as a baseline. And on every estimate where you don't have hard data — default to the TOP of the plausible range. There is no upside to going in low.",
          },
          {
            id: "s2-q5",
            type: "multiple-choice",
            prompt: "The pre-meeting confirmation call should be:",
            topic: "Pre-meeting confirmation call",
            options: [
              "60 seconds, three quick questions, you hang up first",
              "Five minutes, comprehensive review of the whole pitch",
              "However long the prospect needs",
              "Replaced with an email instead",
            ],
            correctAnswer: 0,
            rationale:
              "High energy. Three questions max. You hang up first — if they say \"I've got to go\" before you wrap, you've overstayed. The whole point is to set Friday's tone and gather the last data points you need.",
          },
          {
            id: "s2-q6",
            type: "multiple-choice",
            prompt:
              "Which of these is a \"7/10 word\" Corie wants you to replace with a stronger power word?",
            topic: "Power words",
            options: ["Perfect", "Superb", "Amazing", "Excellent"],
            correctAnswer: 3,
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
              "It's the fastest way to negotiate",
              "When you panic-drop the price you confirm the original was inflated; when you re-engineer the package you confirm the original was real",
              "It's legally required to discount this way",
            ],
            correctAnswer: 2,
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
              "Plant a seed of doubt about the coach, predict the timeline, concede gracefully",
              "Drop the price significantly to undercut the coach's recommendation",
              "Email the coach directly to make your case",
            ],
            correctAnswer: 1,
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
        estimate: "10 min read",
        url: "/sample-content/session-01-pitch-high/debrief.pdf",
      },
      {
        kind: "toolkit",
        estimate: "10 min reference",
        url: "/sample-content/session-01-pitch-high/toolkit.pdf",
      },
      {
        kind: "intro",
        estimate: "~5 min watch",
        url: drivePreview("16r1YO7th679DYWunKxpuYiVCcyGTliGu"),
      },
      {
        kind: "podcast",
        estimate: "10 min listen",
        url: drivePreview("1WGf7FpIo4I27_J8E_xwfeNqWmjZSL4ZR"),
        durationSeconds: 1800,
      },
      {
        kind: "presentation",
        estimate: "10 min watch",
        url: drivePreview("1uhY5qV1ZZ2oiKsXcPMNbWU3HiNY4TZAL"),
        mode: "video",
      },
      {
        kind: "quiz",
        estimate: "9 questions · ~10 min",
        passMark: 100,
        questions: [
          {
            id: "s1-q1",
            type: "multiple-choice",
            prompt: "When pricing a website rebuild, which approach does Corie recommend?",
            topic: "Pitching the stack",
            options: [
              "Pitch the highest tier first and let the customer work down",
              "Match what you think their budget is",
              "Start with the lowest tier so you don't scare them off",
              "Avoid talking price entirely until they ask",
            ],
            correctAnswer: 0,
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
              "\"Which one fits your needs?\"",
              "\"Which one do you like the look of best?\"",
            ],
            correctAnswer: 3,
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
              "They genuinely need more product detail",
              "Spouse / partner approval",
              "Trust",
            ],
            correctAnswer: 1,
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
              "Odd numbers signal \"best I could do\"; round numbers signal you had room",
              "The extra $25 covers admin costs",
              "Customers psychologically prefer odd-numbered prices",
            ],
            correctAnswer: 1,
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
              "Distrust, suspicion, and questions about ingredients",
              "Excitement at finding a bargain",
              "Loyalty to the cheaper brand",
              "Increased likelihood of trying the product",
            ],
            correctAnswer: 0,
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
              "Casual and matter-of-fact",
              "Slightly disappointed — like you've let them down a little",
            ],
            correctAnswer: 3,
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

// ─── Lead Gen projection ────────────────────────────────────────────────────
// Lead Gen sees a curated 7-session series, sourced from a subset of the
// sales material and renumbered 01–07 from their perspective. Same assets
// (debrief, toolkit, intro video, podcast, presentation, quiz) — quiz
// questions are filtered to multiple-choice only for this team per the
// product brief.
//
// We project each source session into a NEW Session object with a new id
// (`lg-session-N`) and a new `number` ("01"–"07"). The detail page routes
// LG reps to these new ids, so anywhere "#{session.number}" or "Session N"
// renders the new value — original numbering is never visible.
//
// Underlying asset URLs (Drive video IDs, PDF paths under
// /public/sample-content/session-04-...) are unchanged: per the brief, only
// portal-level labels are renumbered, not the underlying file titles.

interface LeadGenMapEntry {
  sourceId: string;
  newNumber: string; // "01"..."07"
}

const LEAD_GEN_SESSION_MAP: LeadGenMapEntry[] = [
  { sourceId: "session-01-pitch-high", newNumber: "01" },
  { sourceId: "session-02-big-energy", newNumber: "02" },
  { sourceId: "session-04-rock-solid", newNumber: "03" },
  { sourceId: "session-06-checklist", newNumber: "04" },
  { sourceId: "session-07-likability", newNumber: "05" },
  { sourceId: "session-08-numbers", newNumber: "06" },
  { sourceId: "session-11-seo-pitch", newNumber: "07" },
  { sourceId: "session-15-read-the-room", newNumber: "08" },
  { sourceId: "session-16-follow-the-instructions", newNumber: "09" },
  { sourceId: "session-17-close-the-exits", newNumber: "10" },
  { sourceId: "session-18-inherit-the-deal", newNumber: "11" },
  { sourceId: "session-19-reheat-the-meeting", newNumber: "12" },
  { sourceId: "session-20-hunt-deals", newNumber: "13" },
  { sourceId: "session-21-urgency", newNumber: "14" },
  { sourceId: "session-22-reversible-yes", newNumber: "15" },
  { sourceId: "session-23-competition-strategy", newNumber: "16" },
];

function projectForLeadGen(source: Session, newNumber: string): Session {
  // Filter quiz questions to multiple-choice only — Lead Gen quizzes don't
  // include short-answer questions per the brief. If a session has no quiz
  // (none in the current LG list), the assets pass through untouched.
  const assets = source.assets.map((a) => {
    if (a.kind !== "quiz") return a;
    return {
      ...a,
      questions: a.questions.filter((q) => q.type === "multiple-choice"),
    };
  });

  return {
    ...source,
    id: `lg-session-${parseInt(newNumber, 10)}`,
    number: newNumber,
    // Featured flag is intentionally stripped — the LG series shouldn't have
    // any banner sessions (the only featured one in source is Session 14,
    // which isn't part of the LG mapping anyway, but belt and braces).
    featured: false,
    bannerLabel: undefined,
    assets,
  };
}

export const leadGenSessions: Session[] = LEAD_GEN_SESSION_MAP.map((entry) => {
  const source = sessions.find((s) => s.id === entry.sourceId);
  if (!source) {
    throw new Error(
      `[leadGenSessions] source session not found: ${entry.sourceId}`
    );
  }
  return projectForLeadGen(source, entry.newNumber);
});

/** Look-up by id (used by /sessions/[id] route). Checks both the canonical
 *  sales sessions and the Lead Gen projection so either id space resolves. */
export function getSessionById(id: string): Session | undefined {
  return (
    sessions.find((s) => s.id === id) ??
    leadGenSessions.find((s) => s.id === id)
  );
}

/** Get the quiz asset off a session, or undefined. */
export function getQuiz(session: Session) {
  return session.assets.find((a) => a.kind === "quiz");
}
