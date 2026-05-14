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

/** Look-up by id (used by /sessions/[id] route). */
export function getSessionById(id: string): Session | undefined {
  return sessions.find((s) => s.id === id);
}

/** Get the quiz asset off a session, or undefined. */
export function getQuiz(session: Session) {
  return session.assets.find((a) => a.kind === "quiz");
}
