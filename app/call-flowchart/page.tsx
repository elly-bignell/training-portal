// app/call-flowchart/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

type NodeType = "start" | "script" | "response" | "decision" | "outcome-book" | "outcome-followup";

interface FlowNodeData {
  id: string;
  type: NodeType;
  label: string;
  script?: string;
}

function getNodeStyle(type: NodeType) {
  switch (type) {
    case "start":
      return "bg-slate-900 text-white border-slate-700";
    case "script":
      return "bg-white text-slate-900 border-slate-300";
    case "response":
      return "bg-blue-50 text-blue-900 border-blue-300";
    case "decision":
      return "bg-amber-50 text-amber-900 border-amber-300";
    case "outcome-book":
      return "bg-emerald-600 text-white border-emerald-700";
    case "outcome-followup":
      return "bg-[#E6017D] text-white border-[#c9016b]";
  }
}

function getNodeTag(type: NodeType) {
  switch (type) {
    case "start": return null;
    case "script": return { text: "SAY", color: "bg-indigo-100 text-indigo-700" };
    case "response": return { text: "THEY SAY", color: "bg-blue-100 text-blue-700" };
    case "decision": return { text: "DECISION", color: "bg-amber-100 text-amber-700" };
    case "outcome-book": return { text: "BOOK", color: "bg-emerald-800 text-emerald-100" };
    case "outcome-followup": return { text: "FOLLOW UP", color: "bg-pink-800 text-pink-100" };
  }
}

function FlowCard({ node, isActive, onClick, className = "" }: { node: FlowNodeData; isActive: boolean; onClick: () => void; className?: string }) {
  const style = getNodeStyle(node.type);
  const tag = getNodeTag(node.type);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-5 transition-all duration-200 print:shadow-none print:scale-100 ${style} ${
        isActive ? "ring-2 ring-[#E6017D] ring-offset-2 shadow-lg" : "shadow-sm hover:shadow-md"
      } ${className}`}
    >
      {tag && (
        <span className={`inline-block text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full mb-2 ${tag.color}`}>
          {tag.text}
        </span>
      )}
      <h3 className="font-bold text-base leading-snug">{node.label}</h3>
      {node.script && (
        <p className="text-sm mt-2 leading-relaxed opacity-80 italic">&ldquo;{node.script}&rdquo;</p>
      )}
    </button>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-1.5 print:py-1">
      <svg className="w-5 h-6 text-slate-300 print:text-slate-500" viewBox="0 0 16 20" fill="none">
        <path d="M8 2L8 18M8 18L4 14M8 18L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function BranchLabel({ text }: { text: string }) {
  return (
    <div className="text-center mb-1.5">
      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{text}</span>
    </div>
  );
}

function DecisionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 print:py-2">
      <span className="text-xs font-bold text-slate-400 tracking-wide">{text}</span>
    </div>
  );
}

export default function CallFlowchartPage() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const toggle = (id: string) => setActiveNode(activeNode === id ? null : id);

  return (
    <>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header { position: relative !important; }
          @page { size: landscape; margin: 0.4cm; }
        }
      `}</style>

      <main className="min-h-screen bg-slate-50 print:bg-white">
        {/* Header */}
        <header className="bg-slate-900 text-white sticky top-0 z-20 print:relative">
          <div className="max-w-[1600px] mx-auto px-8 py-5 print:py-3">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors print:hidden">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Cold Call Flowchart</h1>
                <p className="text-slate-400 text-sm mt-0.5">Follow the flow. Adapt to each conversation.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="ml-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors print:hidden"
              >
                🖨 Print
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full print:bg-slate-200 print:text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> What you say
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full print:bg-slate-200 print:text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Their response
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full print:bg-slate-200 print:text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Decision point
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full print:bg-slate-200 print:text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Book
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full print:bg-slate-200 print:text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6017D]"></span> Follow Up
              </span>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-8 py-8 print:py-4">

          {/* ── INTRODUCTION ── */}
          <div className="max-w-2xl mx-auto">
            <FlowCard
              node={{ id: "intro", type: "start", label: "Introduction", script: "Hi [Name], it's [Your Name] here from Marketing Sweet, how are you?" }}
              isActive={activeNode === "intro"}
              onClick={() => toggle("intro")}
            />
          </div>

          <DecisionLabel text="HOW DO THEY RESPOND?" />

          <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto items-stretch">
            <FlowCard
              node={{ id: "positive", type: "response", label: "Positive", script: "That's really great to hear!" }}
              isActive={activeNode === "positive"}
              onClick={() => toggle("positive")}
            />
            <FlowCard
              node={{ id: "negative", type: "response", label: "Negative", script: "No worries, I'll be quick." }}
              isActive={activeNode === "negative"}
              onClick={() => toggle("negative")}
            />
          </div>

          <Arrow />

          {/* ── REASON FOR CALL ── */}
          <div className="max-w-2xl mx-auto">
            <FlowCard
              node={{ id: "reason", type: "script", label: "Reason for Call", script: "The reason for my call is because I was doing some research in your area, you popped up, and a few things stood out. Before I go any further, in the last few months, have you been running at full capacity or could you take on more work if it came your way?" }}
              isActive={activeNode === "reason"}
              onClick={() => toggle("reason")}
            />
          </div>

          <DecisionLabel text="CAN THEY TAKE MORE WORK?" />

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TWO MAIN BRANCHES                                        */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* ─────────────────────────────────────────────────── */}
            {/* LEFT: YES, CAN TAKE WORK                           */}
            {/* ─────────────────────────────────────────────────── */}
            <div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-t-xl px-5 py-2.5">
                <span className="text-sm font-bold text-emerald-700 tracking-wider">✅ YES — CAN TAKE MORE WORK</span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-xl bg-white p-6">
                <div className="max-w-md mx-auto">
                  <FlowCard
                    node={{ id: "yes-capacity", type: "script", label: "Ask About Marketing", script: "Perfect. Are you doing any marketing right now or just word of mouth and referrals?" }}
                    isActive={activeNode === "yes-capacity"}
                    onClick={() => toggle("yes-capacity")}
                  />
                </div>

                <DecisionLabel text="ARE THEY DOING MARKETING?" />

                {/* Sub-branch headers */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-blue-50 rounded-t-lg px-4 py-2">
                    <span className="text-xs font-bold text-blue-700">YES, MARKETING</span>
                  </div>
                  <div className="bg-slate-100 rounded-t-lg px-4 py-2">
                    <span className="text-xs font-bold text-slate-600">NO, JUST WOM/REFERRALS</span>
                  </div>
                </div>

                {/* Row 1: First cards aligned */}
                <div className="grid grid-cols-2 gap-5 items-stretch">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20 px-4 pt-4 flex">
                    <FlowCard
                      node={{ id: "yes-how-long", type: "script", label: "Dig Deeper", script: "How long have you been doing it for? (Pause) And if you don't mind me asking, what are you spending each month?" }}
                      isActive={activeNode === "yes-how-long"}
                      onClick={() => toggle("yes-how-long")}
                      className="flex-1"
                    />
                  </div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30 px-4 pt-4 flex">
                    <FlowCard
                      node={{ id: "no-marketing-pitch", type: "script", label: "Pitch the Value", script: "That's cool, most of our clients like yourself get the most through word of mouth and referrals, but aside from that we've been getting them in front of the people who need them but don't know who they are. Would it offend you if I came to you with some ideas and strategies on how we can bring you more visibility and work?" }}
                      isActive={activeNode === "no-marketing-pitch"}
                      onClick={() => toggle("no-marketing-pitch")}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Row 2: Arrows */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20"><Arrow /></div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30"><Arrow /></div>
                </div>

                {/* Row 3: Decision cards aligned */}
                <div className="grid grid-cols-2 gap-5 items-stretch">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20 px-4 flex">
                    <FlowCard
                      node={{ id: "yes-decision-spend", type: "decision", label: "Monthly Spend?" }}
                      isActive={activeNode === "yes-decision-spend"}
                      onClick={() => toggle("yes-decision-spend")}
                      className="flex-1"
                    />
                  </div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30 px-4 flex">
                    <FlowCard
                      node={{ id: "no-mkt-decision", type: "decision", label: "Would it offend?" }}
                      isActive={activeNode === "no-mkt-decision"}
                      onClick={() => toggle("no-mkt-decision")}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Row 4: Outcomes - RESTRUCTURED to avoid deep nesting */}
                <div className="grid grid-cols-2 gap-5 items-start">

                  {/* LEFT column: Spend outcomes - stacked vertically */}
                  <div className="border-l border-r border-b border-blue-100 bg-blue-50/20 rounded-b-lg px-4 pb-4 pt-3">

                    {/* Less than $6K - compact */}
                    <div className="mb-4 p-3 bg-white/60 rounded-lg border border-blue-100">
                      <BranchLabel text="LESS THAN $6K" />
                      <FlowCard
                        node={{ id: "less-6k", type: "outcome-followup", label: "Go to Follow Up" }}
                        isActive={activeNode === "less-6k"}
                        onClick={() => toggle("less-6k")}
                      />
                    </div>

                    {/* More than $6K - full width of this column */}
                    <div className="p-3 bg-white/60 rounded-lg border border-blue-100">
                      <BranchLabel text="MORE THAN $6K" />
                      <FlowCard
                        node={{ id: "more-6k", type: "script", label: "Offer 2nd Opinion", script: "Perfect. Would it offend you at all if I came back with a 2nd opinion highlighting shortfalls and how easily it can be improved?" }}
                        isActive={activeNode === "more-6k"}
                        onClick={() => toggle("more-6k")}
                      />
                      <Arrow />
                      <FlowCard
                        node={{ id: "more-6k-decision", type: "decision", label: "Would it offend?" }}
                        isActive={activeNode === "more-6k-decision"}
                        onClick={() => toggle("more-6k-decision")}
                      />
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <BranchLabel text="YES" />
                          <FlowCard
                            node={{ id: "offend-yes-1", type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so and see how it's progressing, then give you a 2nd opinion if you're open to it." }}
                            isActive={activeNode === "offend-yes-1"}
                            onClick={() => toggle("offend-yes-1")}
                          />
                        </div>
                        <div>
                          <BranchLabel text="NO" />
                          <FlowCard
                            node={{ id: "offend-no-1", type: "outcome-book", label: "Book", script: "Awesome, it'll take me a few days to finalise the research. Are you free for 15–20 mins on [day] at [time]?" }}
                            isActive={activeNode === "offend-no-1"}
                            onClick={() => toggle("offend-no-1")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT column: Offend outcomes */}
                  <div className="border-l border-r border-b border-slate-100 bg-slate-50/30 rounded-b-lg px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <BranchLabel text="YES / NOT READY" />
                        <FlowCard
                          node={{ id: "no-mkt-offend-yes", type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so and see how things are going." }}
                          isActive={activeNode === "no-mkt-offend-yes"}
                          onClick={() => toggle("no-mkt-offend-yes")}
                        />
                      </div>
                      <div>
                        <BranchLabel text="NO, NOT OFFEND" />
                        <FlowCard
                          node={{ id: "no-mkt-offend-no", type: "outcome-book", label: "Book", script: "Awesome, it'll take me a few days to finalise the research. Are you free for 15–20 mins on [day] at [time]?" }}
                          isActive={activeNode === "no-mkt-offend-no"}
                          onClick={() => toggle("no-mkt-offend-no")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ─────────────────────────────────────────────────── */}
            {/* RIGHT: NO, TOO BUSY                                */}
            {/* ─────────────────────────────────────────────────── */}
            <div>
              <div className="bg-orange-50 border border-orange-200 rounded-t-xl px-5 py-2.5">
                <span className="text-sm font-bold text-orange-700 tracking-wider">⛔ NO — TOO BUSY / FULL</span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-xl bg-white p-6">
                <div className="max-w-md mx-auto">
                  <FlowCard
                    node={{ id: "busy-reframe", type: "script", label: "Reframe as Positive", script: "Great problem to have! Is that mostly through word of mouth and referrals, or are you doing any structured marketing at the moment?" }}
                    isActive={activeNode === "busy-reframe"}
                    onClick={() => toggle("busy-reframe")}
                  />
                </div>

                <DecisionLabel text="ARE THEY DOING MARKETING?" />

                {/* Sub-branch headers */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-blue-50 rounded-t-lg px-4 py-2">
                    <span className="text-xs font-bold text-blue-700">YES, MARKETING</span>
                  </div>
                  <div className="bg-slate-100 rounded-t-lg px-4 py-2">
                    <span className="text-xs font-bold text-slate-600">NO MARKETING</span>
                  </div>
                </div>

                {/* Row 1: Website angle aligned */}
                <div className="grid grid-cols-2 gap-5 items-stretch">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20 px-4 pt-4 flex">
                    <FlowCard
                      node={{ id: "busy-yes-mkt", type: "script", label: "Website Angle", script: "Got it, in that case I wouldn't recommend pushing any more work until the website is properly set up to handle it. I actually had a look at your site — when was it last updated?" }}
                      isActive={activeNode === "busy-yes-mkt"}
                      onClick={() => toggle("busy-yes-mkt")}
                      className="flex-1"
                    />
                  </div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30 px-4 pt-4 flex">
                    <FlowCard
                      node={{ id: "busy-no-mkt", type: "script", label: "Website Angle", script: "Got it, in that case I wouldn't recommend pushing any more work until the website is properly set up to handle it. I actually had a look at your site — when was it last updated?" }}
                      isActive={activeNode === "busy-no-mkt"}
                      onClick={() => toggle("busy-no-mkt")}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Row 2: Arrows */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20"><Arrow /></div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30"><Arrow /></div>
                </div>

                {/* Row 3: Go for booking aligned */}
                <div className="grid grid-cols-2 gap-5 items-stretch">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20 px-4 flex">
                    <FlowCard
                      node={{ id: "busy-yes-go-booking", type: "script", label: "Go for Booking", script: "If I come back to you with a couple of ideas to freshen it up so you're ready for future growth, would that offend you?" }}
                      isActive={activeNode === "busy-yes-go-booking"}
                      onClick={() => toggle("busy-yes-go-booking")}
                      className="flex-1"
                    />
                  </div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30 px-4 flex">
                    <FlowCard
                      node={{ id: "busy-no-go-booking", type: "script", label: "Go for Booking", script: "If I come back to you with a couple of ideas to freshen it up so you're ready for future growth, would that offend you?" }}
                      isActive={activeNode === "busy-no-go-booking"}
                      onClick={() => toggle("busy-no-go-booking")}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Row 4: Arrows */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20"><Arrow /></div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30"><Arrow /></div>
                </div>

                {/* Row 5: Decision aligned */}
                <div className="grid grid-cols-2 gap-5 items-stretch">
                  <div className="border-l border-r border-blue-100 bg-blue-50/20 px-4 flex">
                    <FlowCard
                      node={{ id: "busy-yes-decision", type: "decision", label: "Would it offend?" }}
                      isActive={activeNode === "busy-yes-decision"}
                      onClick={() => toggle("busy-yes-decision")}
                      className="flex-1"
                    />
                  </div>
                  <div className="border-l border-r border-slate-100 bg-slate-50/30 px-4 flex">
                    <FlowCard
                      node={{ id: "busy-no-decision", type: "decision", label: "Would it offend?" }}
                      isActive={activeNode === "busy-no-decision"}
                      onClick={() => toggle("busy-no-decision")}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Row 6: Outcomes aligned */}
                <div className="grid grid-cols-2 gap-5 items-stretch">
                  <div className="border-l border-r border-b border-blue-100 bg-blue-50/20 rounded-b-lg px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <BranchLabel text="YES" />
                        <FlowCard
                          node={{ id: "busy-yes-offend", type: "outcome-followup", label: "Follow Up", script: "Leave with them. Ask to follow up. Mention link." }}
                          isActive={activeNode === "busy-yes-offend"}
                          onClick={() => toggle("busy-yes-offend")}
                        />
                      </div>
                      <div>
                        <BranchLabel text="NO" />
                        <FlowCard
                          node={{ id: "busy-yes-not-offend", type: "outcome-book", label: "Book", script: "Fantastic, I'll put some things together. Are you free for 15–20 mins on [day] so I can run you through it properly?" }}
                          isActive={activeNode === "busy-yes-not-offend"}
                          onClick={() => toggle("busy-yes-not-offend")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="border-l border-r border-b border-slate-100 bg-slate-50/30 rounded-b-lg px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <BranchLabel text="YES" />
                        <FlowCard
                          node={{ id: "busy-no-offend", type: "outcome-followup", label: "Follow Up", script: "Leave with them. Ask to follow up. Mention link." }}
                          isActive={activeNode === "busy-no-offend"}
                          onClick={() => toggle("busy-no-offend")}
                        />
                      </div>
                      <div>
                        <BranchLabel text="NO" />
                        <FlowCard
                          node={{ id: "busy-no-not-offend", type: "outcome-book", label: "Book", script: "Fantastic, I'll put some things together. Are you free for 15–20 mins on [day] so I can run you through it properly?" }}
                          isActive={activeNode === "busy-no-not-offend"}
                          onClick={() => toggle("busy-no-not-offend")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ── EXTRA QUALIFICATION ── */}
          <div className="mt-10 max-w-3xl mx-auto print:mt-4">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white print:bg-slate-800">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-bold text-lg">Extra Qualification</h3>
                  <p className="text-slate-300 text-sm mt-1">Smoothly integrated while booking time</p>
                  <div className="mt-3 space-y-2 ml-4">
                    <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">•</span> How many staff do you have?</p>
                    <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">•</span> What services/products do you offer?</p>
                    <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">•</span> What area do you service?</p>
                    <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">•</span> Confirm email address for calendar invite</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FOLLOW UP REMINDER ── */}
          <div className="mt-4 max-w-3xl mx-auto">
            <div className="bg-[#E6017D]/5 border border-[#E6017D]/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-bold text-lg text-[#E6017D]">Every Follow Up = Mention the Link</h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    Whether the outcome is a booking or a follow up, always mention the link to the relevant sales presentation so the prospect has something visual to reference.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Principles */}
          <div className="mt-10 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 print:mt-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <span className="text-2xl">🎧</span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">Listen More</h4>
              <p className="text-sm text-slate-500 mt-1">Let them talk. Their words guide your pitch.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <span className="text-2xl">🔄</span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">Adapt the Script</h4>
              <p className="text-sm text-slate-500 mt-1">Follow the structure, but make it yours.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <span className="text-2xl">📅</span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">Always Lock a Next Step</h4>
              <p className="text-sm text-slate-500 mt-1">Never end without a specific follow-up date.</p>
            </div>
          </div>

          <div className="mt-8 text-center pb-8 print:mt-4 print:pb-2">
            <p className="text-xs text-slate-400">Reference: Module 4 — Cold Call Script &amp; Sales Resources</p>
          </div>
        </div>
      </main>
    </>
  );
}
