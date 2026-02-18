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
    case "start": return "bg-slate-900 text-white border-slate-700";
    case "script": return "bg-white text-slate-900 border-slate-300";
    case "response": return "bg-blue-50 text-blue-900 border-blue-300";
    case "decision": return "bg-amber-50 text-amber-900 border-amber-300";
    case "outcome-book": return "bg-emerald-600 text-white border-emerald-700";
    case "outcome-followup": return "bg-[#E6017D] text-white border-[#c9016b]";
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
      className={`w-full text-left rounded-xl border-2 p-5 transition-all duration-200 print:shadow-none ${style} ${
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
    <div className="flex justify-center py-2 print:py-1">
      <svg className="w-5 h-7 text-slate-300 print:text-slate-500" viewBox="0 0 16 24" fill="none">
        <path d="M8 2L8 22M8 22L3 17M8 22L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function BranchLabel({ text }: { text: string }) {
  return (
    <div className="text-center mb-2">
      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{text}</span>
    </div>
  );
}

function DecisionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-4 print:py-2">
      <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{text}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* QUODO FLOW                                                  */
/* ════════════════════════════════════════════════════════════ */
function QuodoFlow({ activeNode, toggle }: { activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <div className="space-y-0">

      <div className="max-w-2xl mx-auto">
        <FlowCard
          node={{ id: "q-reason", type: "script", label: "Reason for Call", script: "The reason for my call is I was just having a look at your website and I noticed that you have been around for [X] years. I'm assuming that most of your work comes through word of mouth and referrals?" }}
          isActive={activeNode === "q-reason"}
          onClick={() => toggle("q-reason")}
        />
      </div>

      <Arrow />

      <div className="max-w-2xl mx-auto">
        <FlowCard
          node={{ id: "q-website-obs", type: "script", label: "Website Observation", script: "I also know that most of your referrals will be checking your website out and I hope you don't mind me saying but it's starting to look a bit on the tired side. Have you ever considered updating your website or touching it up?" }}
          isActive={activeNode === "q-website-obs"}
          onClick={() => toggle("q-website-obs")}
        />
        <div className="mt-3 px-5 py-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 italic"><strong>OR:</strong> &ldquo;...noticed it hasn&apos;t been updated since [year]. Have you ever considered updating your website or touching it up?&rdquo;</p>
        </div>
      </div>

      <DecisionLabel text="Have they considered updating?" />

      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto items-start">

        {/* NO / NOT INTERESTED */}
        <div>
          <div className="bg-slate-100 rounded-t-lg px-5 py-2.5">
            <span className="text-xs font-bold text-slate-600">NO / NOT INTERESTED</span>
          </div>
          <div className="border border-t-0 border-slate-200 rounded-b-lg p-5 bg-slate-50/30">
            <FlowCard
              node={{ id: "q-no-probe", type: "script", label: "Probe the Objection", script: "No worries at all — can I ask, is that just because you're too busy and don't have the time? Or is it more of a cost thing and you think it's going to be a lengthy process?" }}
              isActive={activeNode === "q-no-probe"}
              onClick={() => toggle("q-no-probe")}
            />

            <DecisionLabel text="What's holding them back?" />

            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div>
                <div className="bg-orange-50 rounded-t-lg px-3 py-1.5">
                  <span className="text-[10px] font-bold text-orange-700">TOO BUSY / NO TIME</span>
                </div>
                <div className="border border-t-0 border-orange-100 rounded-b-lg p-4 bg-orange-50/10 flex flex-col">
                  <FlowCard
                    node={{ id: "q-no-busy", type: "outcome-followup", label: "Follow Up", script: "I'm more than happy to follow up in a month's time to see how your schedule is tracking along. I'll only need you for 15 mins but in the meantime I can send you some examples of our work." }}
                    isActive={activeNode === "q-no-busy"}
                    onClick={() => toggle("q-no-busy")}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <div className="bg-blue-50 rounded-t-lg px-3 py-1.5">
                  <span className="text-[10px] font-bold text-blue-700">COST CONCERN</span>
                </div>
                <div className="border border-t-0 border-blue-100 rounded-b-lg p-4 bg-blue-50/10 flex flex-col">
                  <FlowCard
                    node={{ id: "q-no-cost", type: "script", label: "Overcome Cost Objection", script: "The best part about us is that we build websites for the price of a coffee a day and we handle 98% of the heavy lifting. The only thing we need from you is your approval and imagery." }}
                    isActive={activeNode === "q-no-cost"}
                    onClick={() => toggle("q-no-cost")}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* YES, INTERESTED → Send Examples → Qualify → Book/Follow Up */}
        <div>
          <div className="bg-emerald-50 rounded-t-lg px-5 py-2.5">
            <span className="text-xs font-bold text-emerald-700">YES, INTERESTED</span>
          </div>
          <div className="border border-t-0 border-emerald-100 rounded-b-lg p-5 bg-emerald-50/20">
            <FlowCard
              node={{ id: "q-yes-update", type: "script", label: "Present the Solution", script: "I've got a great solution for you. I can get it fixed up for the price of a coffee a day." }}
              isActive={activeNode === "q-yes-update"}
              onClick={() => toggle("q-yes-update")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "q-email", type: "script", label: "Send Examples & Confirm Email", script: "I'd love to send you some examples of our work for you to have a look at. Is your best email [xyz@xyz.com.au]?" }}
              isActive={activeNode === "q-email"}
              onClick={() => toggle("q-email")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "q-qualify", type: "script", label: "Qualify Their Interest", script: "Awesome, and do you mind if I ask you a quick question? Is this something you're genuinely interested in or are you being polite?" }}
              isActive={activeNode === "q-qualify"}
              onClick={() => toggle("q-qualify")}
            />

            <DecisionLabel text="Are they genuinely interested?" />

            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div>
                <div className="bg-slate-100 rounded-t-lg px-3 py-1.5">
                  <span className="text-[10px] font-bold text-slate-600">BEING POLITE</span>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-lg p-4 bg-slate-50/30 h-full">
                  <FlowCard
                    node={{ id: "q-polite", type: "outcome-followup", label: "Follow Up", script: "No worries at all — I'll send the examples through anyway and you can have a look in your own time. I'll follow up in a week or so." }}
                    isActive={activeNode === "q-polite"}
                    onClick={() => toggle("q-polite")}
                  />
                </div>
              </div>
              <div>
                <div className="bg-emerald-50 rounded-t-lg px-3 py-1.5">
                  <span className="text-[10px] font-bold text-emerald-700">GENUINELY INTERESTED</span>
                </div>
                <div className="border border-t-0 border-emerald-100 rounded-b-lg p-4 bg-emerald-50/20 h-full">
                  <FlowCard
                    node={{ id: "q-interested", type: "outcome-book", label: "Book", script: "In that case, I recommend having a chat on [day] at [time]. I can run you through our examples and the production side of things and discuss pricing. Does that time work? I'll only need you for about 15 minutes." }}
                    isActive={activeNode === "q-interested"}
                    onClick={() => toggle("q-interested")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* MARKETING SWEET FLOW                                        */
/* ════════════════════════════════════════════════════════════ */
function MarketingSweetFlow({ activeNode, toggle }: { activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <div className="space-y-0">

      <div className="max-w-3xl mx-auto">
        <FlowCard
          node={{ id: "ms-reason", type: "script", label: "Reason for Call", script: "The reason for my call is because I was doing some research in your area, you popped up, and a few things stood out. Before I go any further, in the last few months, have you been running at full capacity or could you take on more work if it came your way?" }}
          isActive={activeNode === "ms-reason"}
          onClick={() => toggle("ms-reason")}
        />
      </div>

      <DecisionLabel text="Can they take more work?" />

      <div className="grid grid-cols-2 gap-10 max-w-[1500px] mx-auto items-start">

        {/* ── YES — CAN TAKE WORK ── */}
        <div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-t-xl px-6 py-3">
            <span className="text-sm font-bold text-emerald-700">✅ YES — CAN TAKE MORE WORK</span>
          </div>
          <div className="border border-t-0 border-emerald-100 rounded-b-xl bg-white p-6">
            <FlowCard
              node={{ id: "ms-yes-mkt", type: "script", label: "Ask About Marketing", script: "Perfect. Are you doing any marketing right now or just word of mouth and referrals?" }}
              isActive={activeNode === "ms-yes-mkt"}
              onClick={() => toggle("ms-yes-mkt")}
            />

            <DecisionLabel text="Are they doing marketing?" />

            <div className="grid grid-cols-2 gap-6 items-start">

              {/* YES, marketing */}
              <div>
                <div className="bg-blue-50 rounded-t-lg px-5 py-2.5">
                  <span className="text-xs font-bold text-blue-700">YES, MARKETING</span>
                </div>
                <div className="border border-t-0 border-blue-100 rounded-b-lg p-5 bg-blue-50/20">
                  <FlowCard
                    node={{ id: "ms-ask-type", type: "script", label: "Ask What Type", script: "Is it SEO or Google Ads that you're doing?" }}
                    isActive={activeNode === "ms-ask-type"}
                    onClick={() => toggle("ms-ask-type")}
                  />
                  <Arrow />
                  <FlowCard
                    node={{ id: "ms-ask-long", type: "script", label: "Ask How Long", script: "How long have you been doing it for?" }}
                    isActive={activeNode === "ms-ask-long"}
                    onClick={() => toggle("ms-ask-long")}
                  />
                  <Arrow />
                  <FlowCard
                    node={{ id: "ms-duration-dec", type: "decision", label: "How Long?" }}
                    isActive={activeNode === "ms-duration-dec"}
                    onClick={() => toggle("ms-duration-dec")}
                  />

                  {/* Less than 6 months */}
                  <div className="mt-3 p-4 bg-white/60 rounded-lg border border-blue-100">
                    <BranchLabel text="LESS THAN 6 MONTHS" />
                    <FlowCard
                      node={{ id: "ms-less-6mo", type: "outcome-followup", label: "Follow Up" }}
                      isActive={activeNode === "ms-less-6mo"}
                      onClick={() => toggle("ms-less-6mo")}
                    />
                  </div>

                  {/* More than 6 months → Ask spend → 2nd opinion */}
                  <div className="mt-3 p-4 bg-white/60 rounded-lg border border-blue-100">
                    <BranchLabel text="MORE THAN 6 MONTHS" />
                    <FlowCard
                      node={{ id: "ms-ask-spend", type: "script", label: "Ask About Spend", script: "And if you don't mind me asking, what are you spending each month?" }}
                      isActive={activeNode === "ms-ask-spend"}
                      onClick={() => toggle("ms-ask-spend")}
                    />
                    <Arrow />
                    <FlowCard
                      node={{ id: "ms-2nd-opinion", type: "script", label: "Offer 2nd Opinion", script: "Perfect. Would it offend you at all if I came back with a 2nd opinion highlighting shortfalls and how easily it can be improved?" }}
                      isActive={activeNode === "ms-2nd-opinion"}
                      onClick={() => toggle("ms-2nd-opinion")}
                    />
                    <Arrow />
                    <FlowCard
                      node={{ id: "ms-offend", type: "decision", label: "Would it offend?" }}
                      isActive={activeNode === "ms-offend"}
                      onClick={() => toggle("ms-offend")}
                    />
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <BranchLabel text="YES" />
                        <FlowCard
                          node={{ id: "ms-offend-yes", type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so." }}
                          isActive={activeNode === "ms-offend-yes"}
                          onClick={() => toggle("ms-offend-yes")}
                        />
                      </div>
                      <div>
                        <BranchLabel text="NO" />
                        <FlowCard
                          node={{ id: "ms-offend-no", type: "outcome-book", label: "Book", script: "Awesome, are you free for 15–20 mins on [day] at [time]?" }}
                          isActive={activeNode === "ms-offend-no"}
                          onClick={() => toggle("ms-offend-no")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NO, just WOM */}
              <div>
                <div className="bg-slate-100 rounded-t-lg px-5 py-2.5">
                  <span className="text-xs font-bold text-slate-600">NO, JUST WOM</span>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-lg p-5 bg-slate-50/30">
                  <FlowCard
                    node={{ id: "ms-pitch", type: "script", label: "Pitch the Value", script: "That's cool, most of our clients get the most through WOM and referrals, but aside from that we've been getting them in front of the people who need them but don't know who they are. Would it offend you if I came to you with some ideas and strategies on how we can bring you more visibility and work?" }}
                    isActive={activeNode === "ms-pitch"}
                    onClick={() => toggle("ms-pitch")}
                  />
                  <Arrow />
                  <FlowCard
                    node={{ id: "ms-pitch-offend", type: "decision", label: "Would it offend?" }}
                    isActive={activeNode === "ms-pitch-offend"}
                    onClick={() => toggle("ms-pitch-offend")}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <BranchLabel text="YES" />
                      <FlowCard
                        node={{ id: "ms-pitch-yes", type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so." }}
                        isActive={activeNode === "ms-pitch-yes"}
                        onClick={() => toggle("ms-pitch-yes")}
                      />
                    </div>
                    <div>
                      <BranchLabel text="NO" />
                      <FlowCard
                        node={{ id: "ms-pitch-no", type: "outcome-book", label: "Book", script: "Awesome, are you free for 15–20 mins on [day] at [time]?" }}
                        isActive={activeNode === "ms-pitch-no"}
                        onClick={() => toggle("ms-pitch-no")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── NO — TOO BUSY ── */}
        <div>
          <div className="bg-orange-50 border border-orange-200 rounded-t-xl px-6 py-3">
            <span className="text-sm font-bold text-orange-700">⛔ NO — TOO BUSY / FULL</span>
          </div>
          <div className="border border-t-0 border-orange-100 rounded-b-xl bg-white p-6">
            <FlowCard
              node={{ id: "ms-busy-reframe", type: "script", label: "Reframe as Positive", script: "Great problem to have! Is that mostly through word of mouth and referrals, or are you doing any structured marketing at the moment?" }}
              isActive={activeNode === "ms-busy-reframe"}
              onClick={() => toggle("ms-busy-reframe")}
            />

            <DecisionLabel text="Are they doing marketing?" />

            <div className="grid grid-cols-2 gap-6 items-start">

              {/* YES marketing while busy */}
              <div>
                <div className="bg-blue-50 rounded-t-lg px-5 py-2.5">
                  <span className="text-xs font-bold text-blue-700">YES, MARKETING</span>
                </div>
                <div className="border border-t-0 border-blue-100 rounded-b-lg p-5 bg-blue-50/20">
                  <FlowCard
                    node={{ id: "ms-busy-y-site", type: "script", label: "Website Angle", script: "Got it, in that case I wouldn't recommend pushing any more work until the website is properly set up to handle it. I actually had a look at your site — when was it last updated?" }}
                    isActive={activeNode === "ms-busy-y-site"}
                    onClick={() => toggle("ms-busy-y-site")}
                  />
                  <Arrow />
                  <FlowCard
                    node={{ id: "ms-busy-y-book", type: "script", label: "Go for Booking", script: "If I come back to you with a couple of ideas to freshen it up so you're ready for future growth, would that offend you?" }}
                    isActive={activeNode === "ms-busy-y-book"}
                    onClick={() => toggle("ms-busy-y-book")}
                  />
                  <Arrow />
                  <FlowCard
                    node={{ id: "ms-busy-y-offend", type: "decision", label: "Would it offend?" }}
                    isActive={activeNode === "ms-busy-y-offend"}
                    onClick={() => toggle("ms-busy-y-offend")}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <BranchLabel text="YES" />
                      <FlowCard
                        node={{ id: "ms-busy-yy", type: "outcome-followup", label: "Follow Up", script: "Leave with them. Ask to follow up. Mention link." }}
                        isActive={activeNode === "ms-busy-yy"}
                        onClick={() => toggle("ms-busy-yy")}
                      />
                    </div>
                    <div>
                      <BranchLabel text="NO" />
                      <FlowCard
                        node={{ id: "ms-busy-yn", type: "outcome-book", label: "Book", script: "Fantastic, I'll put some things together. Are you free for 15–20 mins on [day]?" }}
                        isActive={activeNode === "ms-busy-yn"}
                        onClick={() => toggle("ms-busy-yn")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* NO marketing while busy */}
              <div>
                <div className="bg-slate-100 rounded-t-lg px-5 py-2.5">
                  <span className="text-xs font-bold text-slate-600">NO MARKETING</span>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-lg p-5 bg-slate-50/30">
                  <FlowCard
                    node={{ id: "ms-busy-n-site", type: "script", label: "Website Angle", script: "Got it, in that case I wouldn't recommend pushing any more work until the website is properly set up to handle it. I actually had a look at your site — when was it last updated?" }}
                    isActive={activeNode === "ms-busy-n-site"}
                    onClick={() => toggle("ms-busy-n-site")}
                  />
                  <Arrow />
                  <FlowCard
                    node={{ id: "ms-busy-n-book", type: "script", label: "Go for Booking", script: "If I come back to you with a couple of ideas to freshen it up so you're ready for future growth, would that offend you?" }}
                    isActive={activeNode === "ms-busy-n-book"}
                    onClick={() => toggle("ms-busy-n-book")}
                  />
                  <Arrow />
                  <FlowCard
                    node={{ id: "ms-busy-n-offend", type: "decision", label: "Would it offend?" }}
                    isActive={activeNode === "ms-busy-n-offend"}
                    onClick={() => toggle("ms-busy-n-offend")}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <BranchLabel text="YES" />
                      <FlowCard
                        node={{ id: "ms-busy-ny", type: "outcome-followup", label: "Follow Up", script: "Leave with them. Ask to follow up. Mention link." }}
                        isActive={activeNode === "ms-busy-ny"}
                        onClick={() => toggle("ms-busy-ny")}
                      />
                    </div>
                    <div>
                      <BranchLabel text="NO" />
                      <FlowCard
                        node={{ id: "ms-busy-nn", type: "outcome-book", label: "Book", script: "Fantastic, I'll put some things together. Are you free for 15–20 mins on [day]?" }}
                        isActive={activeNode === "ms-busy-nn"}
                        onClick={() => toggle("ms-busy-nn")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* MAIN PAGE                                                   */
/* ════════════════════════════════════════════════════════════ */
export default function CallFlowchartPage() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [brand, setBrand] = useState<"quodo" | "ms">("quodo");
  const toggle = (id: string) => setActiveNode(activeNode === id ? null : id);

  return (
    <>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 11px; }
          header { position: relative !important; }
          @page { size: landscape; margin: 0.3cm; }
        }
      `}</style>

      <main className="min-h-screen bg-slate-50 print:bg-white">
        <header className="bg-slate-900 text-white sticky top-0 z-20 print:relative">
          <div className="max-w-[1600px] mx-auto px-8 py-4 print:py-3">
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
              <div className="ml-auto flex items-center gap-3">
                <div className="flex flex-wrap gap-2 text-xs print:hidden">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Say
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> They say
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Decision
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Book
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#E6017D]"></span> Follow Up
                  </span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors print:hidden"
                >
                  🖨 Print
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-8 py-8 print:py-4">

          {/* Shared intro */}
          <div className="max-w-2xl mx-auto">
            <FlowCard
              node={{ id: "intro", type: "start", label: "Introduction", script: "Hi [Name], it's [Your Name] here from Marketing Sweet, how are you?" }}
              isActive={activeNode === "intro"}
              onClick={() => toggle("intro")}
            />
          </div>

          <DecisionLabel text="How do they respond?" />

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

          {/* Brand toggle — no emojis, custom gradient colors */}
          <div className="flex justify-center my-4 print:hidden">
            <div className="inline-flex rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-lg">
              <button
                onClick={() => { setBrand("quodo"); setActiveNode(null); }}
                className="px-8 py-4 text-base font-bold transition-all"
                style={{
                  background: brand === "quodo" ? "linear-gradient(135deg, #F473B7, #e85da0)" : "white",
                  color: brand === "quodo" ? "white" : "#475569",
                }}
              >
                Quodo — Replacing Websites
              </button>
              <button
                onClick={() => { setBrand("ms"); setActiveNode(null); }}
                className="px-8 py-4 text-base font-bold transition-all"
                style={{
                  background: brand === "ms" ? "linear-gradient(135deg, #96d16a, #7dba54)" : "white",
                  color: brand === "ms" ? "white" : "#475569",
                }}
              >
                Marketing Sweet — Existing Websites
              </button>
            </div>
          </div>

          {/* Flow content */}
          {brand === "quodo" ? (
            <QuodoFlow activeNode={activeNode} toggle={toggle} />
          ) : (
            <MarketingSweetFlow activeNode={activeNode} toggle={toggle} />
          )}

          {/* Footer */}
          <div className="mt-12 max-w-3xl mx-auto print:mt-4">
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
