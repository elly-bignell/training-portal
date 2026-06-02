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
        <p className="text-sm mt-2 leading-relaxed opacity-80 italic whitespace-pre-line">&ldquo;{node.script}&rdquo;</p>
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
/* SHARED: YES MARKETING BRANCH (reused in both YES and NO)   */
/* ════════════════════════════════════════════════════════════ */
function YesMarketingBranch({ prefix, activeNode, toggle }: { prefix: string; activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <>
      <FlowCard
        node={{ id: `${prefix}-ask-type`, type: "script", label: "Ask What Type", script: "Is it SEO or Google Ads that you're doing?" }}
        isActive={activeNode === `${prefix}-ask-type`}
        onClick={() => toggle(`${prefix}-ask-type`)}
      />
      <Arrow />
      <FlowCard
        node={{ id: `${prefix}-ask-long`, type: "script", label: "Ask How Long", script: "How long have you been doing it for?" }}
        isActive={activeNode === `${prefix}-ask-long`}
        onClick={() => toggle(`${prefix}-ask-long`)}
      />
      <Arrow />
      <FlowCard
        node={{ id: `${prefix}-duration-dec`, type: "decision", label: "How Long?" }}
        isActive={activeNode === `${prefix}-duration-dec`}
        onClick={() => toggle(`${prefix}-duration-dec`)}
      />

      {/* Less than 6 months */}
      <div className="mt-3 p-4 bg-white/60 rounded-lg border border-blue-100">
        <BranchLabel text="LESS THAN 6 MONTHS" />
        <FlowCard
          node={{ id: `${prefix}-less-6mo`, type: "outcome-followup", label: "Follow Up" }}
          isActive={activeNode === `${prefix}-less-6mo`}
          onClick={() => toggle(`${prefix}-less-6mo`)}
        />
      </div>

      {/* More than 6 months → Ask spend → 2nd opinion */}
      <div className="mt-3 p-4 bg-white/60 rounded-lg border border-blue-100">
        <BranchLabel text="MORE THAN 6 MONTHS" />
        <FlowCard
          node={{ id: `${prefix}-ask-spend`, type: "script", label: "Ask About Spend", script: "And if you don't mind me asking, what are you spending each month?" }}
          isActive={activeNode === `${prefix}-ask-spend`}
          onClick={() => toggle(`${prefix}-ask-spend`)}
        />
        <Arrow />
        <FlowCard
          node={{ id: `${prefix}-2nd-opinion`, type: "script", label: "Offer 2nd Opinion", script: "Perfect. Would it offend you at all if I came back with a 2nd opinion highlighting shortfalls and how easily it can be improved?" }}
          isActive={activeNode === `${prefix}-2nd-opinion`}
          onClick={() => toggle(`${prefix}-2nd-opinion`)}
        />
        <Arrow />
        <FlowCard
          node={{ id: `${prefix}-offend`, type: "decision", label: "Would it offend?" }}
          isActive={activeNode === `${prefix}-offend`}
          onClick={() => toggle(`${prefix}-offend`)}
        />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <BranchLabel text="YES" />
            <FlowCard
              node={{ id: `${prefix}-offend-yes`, type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so." }}
              isActive={activeNode === `${prefix}-offend-yes`}
              onClick={() => toggle(`${prefix}-offend-yes`)}
            />
          </div>
          <div>
            <BranchLabel text="NO" />
            <FlowCard
              node={{ id: `${prefix}-offend-no`, type: "outcome-book", label: "Book", script: "Awesome, are you free for 15–20 mins on [day] at [time]?" }}
              isActive={activeNode === `${prefix}-offend-no`}
              onClick={() => toggle(`${prefix}-offend-no`)}
            />
          </div>
        </div>
      </div>
    </>
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
          node={{ id: "q-reason", type: "script", label: "Reason for Call", script: "Just for some context, we're Australia's largest privately owned web design company, based in South Australia but operational right across the country. The reason for my call is I was just having a look at your website and I noticed that you have been around for [X] years. I'm assuming that most of your work comes through word of mouth and referrals?" }}
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

        {/* YES, INTERESTED */}
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
              node={{ id: "q-email", type: "script", label: "Go For Booking", script: "I'd love to show you some examples of our work and explain our pricing. I'll only need you for 5-10 minutes. Does XYZday at XYZtime work for you?" }}
              isActive={activeNode === "q-email"}
              onClick={() => toggle("q-email")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "q-qualify", type: "script", label: "Send Examples & Confirm Email", script: "Awesome, I'll book that in. We'll do it over Zoom so we can obviously show you visually. I'll also send you a few links to some of our work in the meantime and a bit about us. Is your best email XYZ@xyz.com.au?" }}
              isActive={activeNode === "q-qualify"}
              onClick={() => toggle("q-qualify")}
            />

            <Arrow />
            <FlowCard
              node={{ id: "q-qualify-int", type: "script", label: "Qualify Their Interest", script: "Great! Do you mind if I ask you a quick question? Is this something you're genuinely interested in or are you being polite?" }}
              isActive={activeNode === "q-qualify-int"}
              onClick={() => toggle("q-qualify-int")}
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
                    node={{ id: "q-interested", type: "outcome-book", label: "Warm Close", script: "Okay great — well thank you for your time and we look forward to seeing you at XYZtime on XYZday! Have a great rest of your day." }}
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
          node={{ id: "ms-reason", type: "script", label: "Reason for Call", script: "We are Marketing Sweet, 'Sweet' is spelt like the lolly. We're a full service agency that specialises in all aspects of web design and digital marketing.\n\nThe reason for my call, I was doing some research in your area and you popped up. I already know you are successful with your WOM and Referrals, and we've helped 1000's of clients just like you get in front of people who need you but don't know who you are. I just wanted to ask if we could bring you more work, would you be able to take it on?" }}
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

              {/* YES, marketing — uses shared component */}
              <div>
                <div className="bg-blue-50 rounded-t-lg px-5 py-2.5">
                  <span className="text-xs font-bold text-blue-700">YES, MARKETING</span>
                </div>
                <div className="border border-t-0 border-blue-100 rounded-b-lg p-5 bg-blue-50/20">
                  <YesMarketingBranch prefix="ms-y" activeNode={activeNode} toggle={toggle} />
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

              {/* YES marketing while busy — SAME branch as YES capacity */}
              <div>
                <div className="bg-blue-50 rounded-t-lg px-5 py-2.5">
                  <span className="text-xs font-bold text-blue-700">YES, MARKETING</span>
                </div>
                <div className="border border-t-0 border-blue-100 rounded-b-lg p-5 bg-blue-50/20">
                  <YesMarketingBranch prefix="ms-busy-y" activeNode={activeNode} toggle={toggle} />
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
/* NEW SCRIPT — SHARED: YES MARKETING BRANCH (with If Happy ·  */
/*              Probe sub-section)                              */
/* ════════════════════════════════════════════════════════════ */
function YesMarketingBranchNew({ prefix, activeNode, toggle }: { prefix: string; activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <>
      <FlowCard
        node={{ id: `${prefix}-ask-type`, type: "script", label: "Ask What Type", script: "Is it SEO or Google Ads that you're doing?" }}
        isActive={activeNode === `${prefix}-ask-type`}
        onClick={() => toggle(`${prefix}-ask-type`)}
      />
      <Arrow />

      {/* If Happy · Probe — NEW probing block */}
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-4 my-2">
        <div className="text-[11px] font-bold tracking-widest uppercase text-amber-700 mb-3">
          ⚡ If Happy · Probe
        </div>
        <div className="space-y-2">
          <FlowCard
            node={{ id: `${prefix}-probe-1`, type: "script", label: "Probe Service Quality", script: "Are you happy with the service they give you or the amount of calls you are getting?" }}
            isActive={activeNode === `${prefix}-probe-1`}
            onClick={() => toggle(`${prefix}-probe-1`)}
          />
          <FlowCard
            node={{ id: `${prefix}-probe-2`, type: "script", label: "Track Attribution", script: "Do you track specifically where the work comes from?" }}
            isActive={activeNode === `${prefix}-probe-2`}
            onClick={() => toggle(`${prefix}-probe-2`)}
          />
          <FlowCard
            node={{ id: `${prefix}-probe-3`, type: "script", label: "Offer 2nd Opinion", script: "Not trying to step on anyone's toes — but would it offend you if I came to you with a 2nd opinion highlighting the shortfalls and how it could be improved?" }}
            isActive={activeNode === `${prefix}-probe-3`}
            onClick={() => toggle(`${prefix}-probe-3`)}
          />
          <FlowCard
            node={{ id: `${prefix}-probe-4`, type: "script", label: "Clarify the Objection", script: "Are you purely not interested 'cause I'm giving you a cold call, or 'cause you absolutely love them?" }}
            isActive={activeNode === `${prefix}-probe-4`}
            onClick={() => toggle(`${prefix}-probe-4`)}
          />
        </div>
      </div>

      <Arrow />
      <FlowCard
        node={{ id: `${prefix}-ask-long`, type: "script", label: "Ask How Long", script: "How long have you been doing it for?" }}
        isActive={activeNode === `${prefix}-ask-long`}
        onClick={() => toggle(`${prefix}-ask-long`)}
      />
      <Arrow />
      <FlowCard
        node={{ id: `${prefix}-duration-dec`, type: "decision", label: "How Long?" }}
        isActive={activeNode === `${prefix}-duration-dec`}
        onClick={() => toggle(`${prefix}-duration-dec`)}
      />

      {/* Less than 6 months */}
      <div className="mt-3 p-4 bg-white/60 rounded-lg border border-blue-100">
        <BranchLabel text="LESS THAN 6 MONTHS" />
        <FlowCard
          node={{ id: `${prefix}-less-6mo`, type: "outcome-followup", label: "Follow Up" }}
          isActive={activeNode === `${prefix}-less-6mo`}
          onClick={() => toggle(`${prefix}-less-6mo`)}
        />
      </div>

      {/* More than 6 months → Ask spend → 2nd opinion */}
      <div className="mt-3 p-4 bg-white/60 rounded-lg border border-blue-100">
        <BranchLabel text="MORE THAN 6 MONTHS" />
        <FlowCard
          node={{ id: `${prefix}-ask-spend`, type: "script", label: "Ask About Spend", script: "And if you don't mind me asking, what are you spending each month?" }}
          isActive={activeNode === `${prefix}-ask-spend`}
          onClick={() => toggle(`${prefix}-ask-spend`)}
        />
        <Arrow />
        <FlowCard
          node={{ id: `${prefix}-2nd-opinion`, type: "script", label: "Offer 2nd Opinion", script: "Perfect. Would it offend you at all if I came back with a 2nd opinion highlighting shortfalls and how easily it can be improved?" }}
          isActive={activeNode === `${prefix}-2nd-opinion`}
          onClick={() => toggle(`${prefix}-2nd-opinion`)}
        />
        <Arrow />
        <FlowCard
          node={{ id: `${prefix}-offend`, type: "decision", label: "Would it offend?" }}
          isActive={activeNode === `${prefix}-offend`}
          onClick={() => toggle(`${prefix}-offend`)}
        />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <BranchLabel text="YES" />
            <FlowCard
              node={{ id: `${prefix}-offend-yes`, type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so." }}
              isActive={activeNode === `${prefix}-offend-yes`}
              onClick={() => toggle(`${prefix}-offend-yes`)}
            />
          </div>
          <div>
            <BranchLabel text="NO" />
            <FlowCard
              node={{ id: `${prefix}-offend-no`, type: "outcome-book", label: "Book", script: "Awesome, are you free for 15–20 mins on [day] at [time]?" }}
              isActive={activeNode === `${prefix}-offend-no`}
              onClick={() => toggle(`${prefix}-offend-no`)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* NEW SCRIPT — QUODO FLOW                                     */
/* ════════════════════════════════════════════════════════════ */
function QuodoFlowNew({ activeNode, toggle }: { activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <div className="space-y-0">

      <div className="max-w-2xl mx-auto">
        <FlowCard
          node={{ id: "qn-reason", type: "script", label: "Reason for Call", script: "Just for some context, we're Australia's largest privately owned web design company, based in South Australia but operational right across the country. The reason for my call is I was just having a look at your website and I noticed that you have been around for [X] years. I'm assuming that most of your work comes through word of mouth and referrals?" }}
          isActive={activeNode === "qn-reason"}
          onClick={() => toggle("qn-reason")}
        />
      </div>

      <Arrow />

      <div className="max-w-2xl mx-auto">
        <FlowCard
          node={{ id: "qn-website-obs", type: "script", label: "Website Observation", script: "I also know that most of your referrals will be checking your website out and I hope you don't mind me saying but it's starting to look a bit on the tired side. Have you ever considered updating your website or touching it up?" }}
          isActive={activeNode === "qn-website-obs"}
          onClick={() => toggle("qn-website-obs")}
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
              node={{ id: "qn-no-probe", type: "script", label: "Probe the Objection", script: "No worries at all — can I ask, is that just because you're too busy and don't have the time? Or is it more of a cost thing and you think it's going to be a lengthy process?" }}
              isActive={activeNode === "qn-no-probe"}
              onClick={() => toggle("qn-no-probe")}
            />

            <DecisionLabel text="What's holding them back?" />

            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div>
                <div className="bg-orange-50 rounded-t-lg px-3 py-1.5">
                  <span className="text-[10px] font-bold text-orange-700">TOO BUSY / NO TIME</span>
                </div>
                <div className="border border-t-0 border-orange-100 rounded-b-lg p-4 bg-orange-50/10 flex flex-col">
                  <FlowCard
                    node={{ id: "qn-no-busy", type: "outcome-followup", label: "Follow Up", script: "I'm more than happy to follow up in a month's time to see how your schedule is tracking along. I'll only need you for 15 mins but in the meantime I can send you some examples of our work." }}
                    isActive={activeNode === "qn-no-busy"}
                    onClick={() => toggle("qn-no-busy")}
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
                    node={{ id: "qn-no-cost", type: "script", label: "Overcome Cost Objection", script: "The best part about us is that we build websites for the price of a coffee a day and we handle 98% of the heavy lifting. The only thing we need from you is your approval and imagery." }}
                    isActive={activeNode === "qn-no-cost"}
                    onClick={() => toggle("qn-no-cost")}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* YES, INTERESTED */}
        <div>
          <div className="bg-emerald-50 rounded-t-lg px-5 py-2.5">
            <span className="text-xs font-bold text-emerald-700">YES, INTERESTED</span>
          </div>
          <div className="border border-t-0 border-emerald-100 rounded-b-lg p-5 bg-emerald-50/20">
            <FlowCard
              node={{ id: "qn-yes-update", type: "script", label: "Present the Solution", script: "I've got a great solution for you. I can get it fixed up for the price of a coffee a day." }}
              isActive={activeNode === "qn-yes-update"}
              onClick={() => toggle("qn-yes-update")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "qn-email", type: "script", label: "Go For Booking", script: "I'd love to show you some examples of our work and explain our pricing. I'll only need you for 5-10 minutes. Does [XYZday] at [XYZtime] work for you?" }}
              isActive={activeNode === "qn-email"}
              onClick={() => toggle("qn-email")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "qn-qualify", type: "script", label: "Send Examples & Confirm Email", script: "I'll book that in. We'll do it over Zoom so we can obviously show you visually. I'll also send you a few links to some of our work in the meantime and a bit about us. Is your best email [XYZ@xyz.com.au]?" }}
              isActive={activeNode === "qn-qualify"}
              onClick={() => toggle("qn-qualify")}
            />

            <Arrow />
            <FlowCard
              node={{ id: "qn-qualify-int", type: "script", label: "Qualify Their Interest", script: "Great! Do you mind if I ask you a quick question? Is this something you're genuinely interested in or are you being polite?" }}
              isActive={activeNode === "qn-qualify-int"}
              onClick={() => toggle("qn-qualify-int")}
            />

            <DecisionLabel text="Are they genuinely interested?" />

            <div className="grid grid-cols-2 gap-4 items-stretch">
              <div>
                <div className="bg-slate-100 rounded-t-lg px-3 py-1.5">
                  <span className="text-[10px] font-bold text-slate-600">BEING POLITE</span>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-lg p-4 bg-slate-50/30 h-full">
                  <FlowCard
                    node={{ id: "qn-polite", type: "outcome-followup", label: "Follow Up Anyway", script: "No worries at all — I'll send the examples through anyway and you can have a look in your own time. I'll follow up in a week or so." }}
                    isActive={activeNode === "qn-polite"}
                    onClick={() => toggle("qn-polite")}
                  />
                </div>
              </div>
              <div>
                <div className="bg-emerald-50 rounded-t-lg px-3 py-1.5">
                  <span className="text-[10px] font-bold text-emerald-700">GENUINELY INTERESTED</span>
                </div>
                <div className="border border-t-0 border-emerald-100 rounded-b-lg p-4 bg-emerald-50/20 h-full">
                  <FlowCard
                    node={{ id: "qn-interested", type: "outcome-book", label: "Warm Close", script: "Okay great — well thank you for your time and we look forward to seeing you at [XYZtime] on [XYZday]! Have a great rest of your day." }}
                    isActive={activeNode === "qn-interested"}
                    onClick={() => toggle("qn-interested")}
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
/* NEW SCRIPT — MARKETING SWEET FLOW                           */
/* 3-way split: YES MARKETING / JUST WOM / NO MARKETING        */
/* ════════════════════════════════════════════════════════════ */
function MarketingSweetFlowNew({ activeNode, toggle }: { activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <div className="space-y-0">

      <div className="max-w-3xl mx-auto">
        <FlowCard
          node={{ id: "msn-reason", type: "script", label: "Reason for Call", script: "We are Marketing Sweet, 'Sweet' is spelt like the lolly. We're a full service agency that specialises in all aspects of web design and digital marketing.\n\nThe reason for my call, I was doing some research in your area and you popped up. I already know you are successful with your WOM and Referrals, and we've helped 1000's of clients just like you get in front of people who need you but don't know who you are. I just wanted to ask if we could bring you more work, would you be able to take it on?" }}
          isActive={activeNode === "msn-reason"}
          onClick={() => toggle("msn-reason")}
        />
      </div>

      <DecisionLabel text="Can they take more work?" />

      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto items-start">

        {/* ── YES — CAN TAKE WORK ── */}
        <div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-t-xl px-6 py-3">
            <span className="text-sm font-bold text-emerald-700">✅ YES — CAN TAKE MORE WORK</span>
          </div>
          <div className="border border-t-0 border-emerald-100 rounded-b-xl bg-white p-6">
            <FlowCard
              node={{ id: "msn-yes-mkt", type: "script", label: "Ask About Marketing", script: "Perfect. Are you doing any marketing right now or just word of mouth and referrals?" }}
              isActive={activeNode === "msn-yes-mkt"}
              onClick={() => toggle("msn-yes-mkt")}
            />
          </div>
        </div>

        {/* ── NO — TOO BUSY ── */}
        <div>
          <div className="bg-orange-50 border border-orange-200 rounded-t-xl px-6 py-3">
            <span className="text-sm font-bold text-orange-700">⛔ NO — TOO BUSY / FULL</span>
          </div>
          <div className="border border-t-0 border-orange-100 rounded-b-xl bg-white p-6">
            <FlowCard
              node={{ id: "msn-busy-reframe", type: "script", label: "Reframe as Positive", script: "Great problem to have! Is that mostly through word of mouth and referrals, or are you doing any structured marketing at the moment?" }}
              isActive={activeNode === "msn-busy-reframe"}
              onClick={() => toggle("msn-busy-reframe")}
            />
          </div>
        </div>
      </div>

      {/* Converge to 3-way marketing question */}
      <div className="flex flex-col items-center mt-6 mb-2">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Both paths converge</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        <Arrow />
      </div>

      <DecisionLabel text="Are they doing marketing?" />

      {/* 3-way split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1500px] mx-auto items-start">

        {/* YES MARKETING */}
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-t-xl px-5 py-3">
            <span className="text-sm font-bold text-blue-700">📈 YES — Marketing</span>
          </div>
          <div className="border border-t-0 border-blue-100 rounded-b-xl p-5 bg-blue-50/20">
            <YesMarketingBranchNew prefix="msn-y" activeNode={activeNode} toggle={toggle} />
          </div>
        </div>

        {/* JUST WOM */}
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-t-xl px-5 py-3">
            <span className="text-sm font-bold text-amber-700">👥 JUST WOM</span>
          </div>
          <div className="border border-t-0 border-amber-100 rounded-b-xl p-5 bg-amber-50/20">
            <FlowCard
              node={{ id: "msn-pitch", type: "script", label: "Pitch the Value", script: "That's cool, most of our clients get the most through WOM and referrals, but aside from that we've been getting them in front of people who need them but don't know who they are. Would it offend you if I came to you with some ideas and strategies on how we can bring you more visibility and work?" }}
              isActive={activeNode === "msn-pitch"}
              onClick={() => toggle("msn-pitch")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "msn-pitch-offend", type: "decision", label: "Would it offend?" }}
              isActive={activeNode === "msn-pitch-offend"}
              onClick={() => toggle("msn-pitch-offend")}
            />
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <BranchLabel text="YES" />
                <FlowCard
                  node={{ id: "msn-pitch-yes", type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so." }}
                  isActive={activeNode === "msn-pitch-yes"}
                  onClick={() => toggle("msn-pitch-yes")}
                />
              </div>
              <div>
                <BranchLabel text="NO" />
                <FlowCard
                  node={{ id: "msn-pitch-no", type: "outcome-book", label: "Book Meeting", script: "Awesome, are you free for 15–20 mins on [day] at [time]?" }}
                  isActive={activeNode === "msn-pitch-no"}
                  onClick={() => toggle("msn-pitch-no")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* NO MARKETING */}
        <div>
          <div className="bg-slate-100 border border-slate-200 rounded-t-xl px-5 py-3">
            <span className="text-sm font-bold text-slate-600">🌐 NO MARKETING</span>
          </div>
          <div className="border border-t-0 border-slate-200 rounded-b-xl p-5 bg-slate-50/30">
            <FlowCard
              node={{ id: "msn-nomkt-site", type: "script", label: "Website Angle", script: "Got it. In that case I wouldn't recommend pushing any more work until the website is properly set up to handle it. I actually had a look at your site — when was it last updated?" }}
              isActive={activeNode === "msn-nomkt-site"}
              onClick={() => toggle("msn-nomkt-site")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "msn-nomkt-book", type: "script", label: "Go for Booking", script: "If I came back to you with a couple of ideas to freshen it up so you're ready for future growth, would that offend you?" }}
              isActive={activeNode === "msn-nomkt-book"}
              onClick={() => toggle("msn-nomkt-book")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "msn-nomkt-offend", type: "decision", label: "Would it offend?" }}
              isActive={activeNode === "msn-nomkt-offend"}
              onClick={() => toggle("msn-nomkt-offend")}
            />
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <BranchLabel text="YES" />
                <FlowCard
                  node={{ id: "msn-nomkt-yes", type: "outcome-followup", label: "Follow Up", script: "No stress at all, I can follow up in a month or so." }}
                  isActive={activeNode === "msn-nomkt-yes"}
                  onClick={() => toggle("msn-nomkt-yes")}
                />
              </div>
              <div>
                <BranchLabel text="NO" />
                <FlowCard
                  node={{ id: "msn-nomkt-no", type: "outcome-book", label: "Book Meeting", script: "Awesome, are you free for 15–20 mins on [day] at [time]?" }}
                  isActive={activeNode === "msn-nomkt-no"}
                  onClick={() => toggle("msn-nomkt-no")}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* NEW SCRIPT — EXTRA QUALIFICATION (categorised)              */
/* ════════════════════════════════════════════════════════════ */
function ExtraQualificationNew({ activeNode, toggle }: { activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <div className="mt-12 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3 tracking-wide uppercase">
          🎯 4. Extra Qualification
        </div>
        <h3 className="text-xl font-bold text-slate-900">Weave these in naturally while booking</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* STAFF */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="text-xl">👥</span>
            <h4 className="font-bold text-slate-900">Staff</h4>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Trade</div>
              <FlowCard
                node={{ id: "eqn-staff-trade", type: "script", label: "Trade", script: "How many boys do you have helping you out?" }}
                isActive={activeNode === "eqn-staff-trade"}
                onClick={() => toggle("eqn-staff-trade")}
              />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Any Industry</div>
              <FlowCard
                node={{ id: "eqn-staff-any", type: "script", label: "Any Industry", script: "If you have so much work going on, do you do everything yourself or do you have anyone helping you out?" }}
                isActive={activeNode === "eqn-staff-any"}
                onClick={() => toggle("eqn-staff-any")}
              />
            </div>
          </div>
        </div>

        {/* AREAS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="text-xl">📍</span>
            <h4 className="font-bold text-slate-900">Areas</h4>
          </div>
          <div className="space-y-3">
            <FlowCard
              node={{ id: "eqn-area-1", type: "script", label: "Base Area", script: "I can see you're based in [Area/City] — do you keep your work only in that area or are you happy to travel out?" }}
              isActive={activeNode === "eqn-area-1"}
              onClick={() => toggle("eqn-area-1")}
            />
            <FlowCard
              node={{ id: "eqn-area-2", type: "script", label: "If They Travel", script: "Awesome, what is the max distance or area you'll go to?" }}
              isActive={activeNode === "eqn-area-2"}
              onClick={() => toggle("eqn-area-2")}
            />
            <FlowCard
              node={{ id: "eqn-area-3", type: "script", label: "Target Area", script: "Is there any particular area you want to tap into?" }}
              isActive={activeNode === "eqn-area-3"}
              onClick={() => toggle("eqn-area-3")}
            />
          </div>
        </div>

        {/* SERVICES */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="text-xl">🛠️</span>
            <h4 className="font-bold text-slate-900">Services</h4>
          </div>
          <div className="space-y-3">
            <FlowCard
              node={{ id: "eqn-svc-1", type: "script", label: "Preferences", script: "I can see that you do [x, y, z] — are you happy to do any of them or do you have a preference?" }}
              isActive={activeNode === "eqn-svc-1"}
              onClick={() => toggle("eqn-svc-1")}
            />
            <FlowCard
              node={{ id: "eqn-svc-2", type: "script", label: "Most Wanted", script: "If I can help you pick and choose the work that you do, what specifically would you want more of?" }}
              isActive={activeNode === "eqn-svc-2"}
              onClick={() => toggle("eqn-svc-2")}
            />
            <FlowCard
              node={{ id: "eqn-svc-3", type: "script", label: "Avoid", script: "Are there services on your website that you would like to avoid?" }}
              isActive={activeNode === "eqn-svc-3"}
              onClick={() => toggle("eqn-svc-3")}
            />
            <FlowCard
              node={{ id: "eqn-svc-4", type: "script", label: "Wrap Up", script: "Let me do my research into these alongside which areas get demand — that way I can give you a detailed plan on what we can target together." }}
              isActive={activeNode === "eqn-svc-4"}
              onClick={() => toggle("eqn-svc-4")}
            />
          </div>
        </div>

      </div>

      {/* Final Checklist */}
      <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="font-bold text-lg">Final Checklist</h4>
            <p className="text-slate-300 text-sm mt-1">Before you hang up, confirm you have all four:</p>
            <div className="mt-3 space-y-2 ml-4">
              <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">★</span> How many staff do you have?</p>
              <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">★</span> What services/products do you offer?</p>
              <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">★</span> What area do you service?</p>
              <p className="text-sm text-slate-300 flex items-start gap-2"><span className="text-[#E6017D] mt-0.5">★</span> Confirm email address for calendar invite</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* NEW SCRIPT — OBJECTION HANDLING                             */
/* ════════════════════════════════════════════════════════════ */
function ObjectionHandlingNew({ activeNode, toggle }: { activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <div className="mt-12 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3 tracking-wide uppercase">
          🛡️ 5. Objection Handling
        </div>
        <h3 className="text-xl font-bold text-slate-900">Ready-made responses for common pushbacks</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Been Burnt Before */}
        <div className="bg-white rounded-xl border-l-4 border-l-red-500 border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h4 className="font-bold text-slate-900">Been Burnt Before</h4>
          </div>
          <div className="space-y-3">
            <FlowCard
              node={{ id: "obj-burnt-1", type: "script", label: "Acknowledge", script: "Let me guess — someone or multiple companies promised you the world and you got nothing?" }}
              isActive={activeNode === "obj-burnt-1"}
              onClick={() => toggle("obj-burnt-1")}
            />
            <FlowCard
              node={{ id: "obj-burnt-2", type: "script", label: "Differentiate", script: "We hear this type of scenario all the time and it's a big reason we exist, 'cause we don't make any false promises or provide unrealistic expectations. We base all of our recommendations from research, facts, and experience." }}
              isActive={activeNode === "obj-burnt-2"}
              onClick={() => toggle("obj-burnt-2")}
            />
            <FlowCard
              node={{ id: "obj-burnt-3", type: "script", label: "Origin Story", script: "I completely understand where you are coming from. On average we catch up and speak to 5 business owners a day and 4 out of the 5 are extremely skeptical as they have been burnt before. Our director actually started on your side of the fence — he ran his own business just like you, and he reached a point where he needed a marketing company that he could trust and rely on. And that's where things fell apart and how Marketing Sweet was born." }}
              isActive={activeNode === "obj-burnt-3"}
              onClick={() => toggle("obj-burnt-3")}
            />
          </div>
        </div>

        {/* Building Trust Fast */}
        <div className="bg-white rounded-xl border-l-4 border-l-blue-500 border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🤝</span>
            <h4 className="font-bold text-slate-900">Building Trust Fast</h4>
          </div>
          <div className="space-y-3">
            <FlowCard
              node={{ id: "obj-trust-1", type: "script", label: "Open the Door", script: "I understand you get bombarded by these calls and I don't expect you to trust me over the phone right away — but would you agree with me that the more information you have, the better informed decision you can make?" }}
              isActive={activeNode === "obj-trust-1"}
              onClick={() => toggle("obj-trust-1")}
            />
            <FlowCard
              node={{ id: "obj-trust-2", type: "script", label: "We Stay", script: "People normally disappear. We're there the whole way." }}
              isActive={activeNode === "obj-trust-2"}
              onClick={() => toggle("obj-trust-2")}
            />
            <FlowCard
              node={{ id: "obj-trust-3", type: "script", label: "High-End Service", script: "We're not a low end provider, we're a high end provider with great customer service." }}
              isActive={activeNode === "obj-trust-3"}
              onClick={() => toggle("obj-trust-3")}
            />
          </div>
        </div>

        {/* I'm Happy / Has Marketing (Semrush) */}
        <div className="bg-white rounded-xl border-l-4 border-l-amber-500 border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">😊</span>
            <h4 className="font-bold text-slate-900">&lsquo;I&apos;m Happy&rsquo; / Has Marketing (Semrush check)</h4>
          </div>
          <div className="space-y-3">
            <FlowCard
              node={{ id: "obj-happy-1", type: "script", label: "Quality Check", script: "Are you happy with the service they give you or the amount of calls you are getting?" }}
              isActive={activeNode === "obj-happy-1"}
              onClick={() => toggle("obj-happy-1")}
            />
            <FlowCard
              node={{ id: "obj-happy-2", type: "script", label: "Attribution Check", script: "Do you track specifically where the work comes from?" }}
              isActive={activeNode === "obj-happy-2"}
              onClick={() => toggle("obj-happy-2")}
            />
            <FlowCard
              node={{ id: "obj-happy-3", type: "script", label: "2nd Opinion", script: "Not trying to step on anyone's toes — but would it offend you if I came to you with a 2nd opinion highlighting the shortfalls and how it could be improved?" }}
              isActive={activeNode === "obj-happy-3"}
              onClick={() => toggle("obj-happy-3")}
            />
            <FlowCard
              node={{ id: "obj-happy-4", type: "script", label: "Clarify Objection", script: "Are you purely not interested 'cause I'm giving you a cold call, or 'cause you absolutely love them?" }}
              isActive={activeNode === "obj-happy-4"}
              onClick={() => toggle("obj-happy-4")}
            />
          </div>
        </div>

        {/* Quodo Too Busy / WOM Objections */}
        <div className="bg-white rounded-xl border-l-4 border-l-pink-500 border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🌐</span>
            <h4 className="font-bold text-slate-900">Quodo — Too Busy / WOM Objections</h4>
          </div>
          <div className="space-y-3">
            <FlowCard
              node={{ id: "obj-quodo-1", type: "script", label: "Referrals Check You Out", script: "You are already successful with your WOM/Referrals, most of my clients are too. The reason they get their website up to date is because we know that 90% of the time your referrals are checking you out — if they don't like what they see they just simply won't give you a call." }}
              isActive={activeNode === "obj-quodo-1"}
              onClick={() => toggle("obj-quodo-1")}
            />
            <FlowCard
              node={{ id: "obj-quodo-2", type: "script", label: "Missed Opportunities", script: "I'm not concerned about the work you are getting now, I'm concerned about what you are missing out on." }}
              isActive={activeNode === "obj-quodo-2"}
              onClick={() => toggle("obj-quodo-2")}
            />
            <FlowCard
              node={{ id: "obj-quodo-3", type: "script", label: "Insurance Policy", script: "Most of our clients aren't building a website because their business is quiet. 99% of them are booked out 6 months or more. You and I both know your website is losing you clients — think of it as an insurance policy for your pipeline." }}
              isActive={activeNode === "obj-quodo-3"}
              onClick={() => toggle("obj-quodo-3")}
            />
            <FlowCard
              node={{ id: "obj-quodo-4", type: "script", label: "Google Search Reality", script: "When you get referred to someone — first thing you do is search them up on Google right? Your clients are doing the same when they get referred to you." }}
              isActive={activeNode === "obj-quodo-4"}
              onClick={() => toggle("obj-quodo-4")}
            />
          </div>
        </div>

        {/* Never Got Work From My Website */}
        <div className="bg-white rounded-xl border-l-4 border-l-emerald-500 border border-slate-200 p-5 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📉</span>
            <h4 className="font-bold text-slate-900">&lsquo;Never Got Work From My Website&rsquo;</h4>
          </div>
          <FlowCard
            node={{ id: "obj-nowork-1", type: "script", label: "Pattern Interrupt", script: "Respectfully, I'm not surprised — 'cause if I got referred to you and saw your website I wouldn't give you a call either." }}
            isActive={activeNode === "obj-nowork-1"}
            onClick={() => toggle("obj-nowork-1")}
          />
        </div>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/* FOLLOW UP CALL SCRIPT                                       */
/* ════════════════════════════════════════════════════════════ */
function FollowUpScriptSection({ activeNode, toggle }: { activeNode: string | null; toggle: (id: string) => void }) {
  return (
    <div className="space-y-0">

      {/* Intro — single merged card */}
      <div className="max-w-2xl mx-auto">
        <FlowCard
          node={{ id: "fu-intro", type: "start", label: "Introduction", script: "Hi [Name], it's [Your Name] calling from Marketing Sweet — we spoke on [Day] in regards to your website and marketing. How are you? You asked me to send through some information via email and follow you up today. What did you think?" }}
          isActive={activeNode === "fu-intro"}
          onClick={() => toggle("fu-intro")}
        />
      </div>

      <DecisionLabel text="Did they read the email?" />

      {/* Top split: A vs B opener */}
      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto items-start mb-10">

        {/* ── A: HAS READ EMAIL ── */}
        <div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-t-xl px-5 py-3">
            <span className="text-sm font-bold text-emerald-700">✅ A — HAS READ EMAIL (≈10%)</span>
          </div>
          <div className="border border-t-0 border-emerald-100 rounded-b-xl p-5 bg-white">
            <FlowCard
              node={{ id: "fu-a-read", type: "response", label: "Has Read", script: "Yes I've had a look" }}
              isActive={activeNode === "fu-a-read"}
              onClick={() => toggle("fu-a-read")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-a-thoughts", type: "script", label: "Ask for Thoughts", script: "Perfect — what were your initial thoughts?" }}
              isActive={activeNode === "fu-a-thoughts"}
              onClick={() => toggle("fu-a-thoughts")}
            />

          </div>
        </div>

        {/* ── B: HAS NOT READ EMAIL ── */}
        <div>
          <div className="bg-slate-100 border border-slate-200 rounded-t-xl px-5 py-3">
            <span className="text-sm font-bold text-slate-600">📧 B — HASN&apos;T READ EMAIL (≈90%)</span>
          </div>
          <div className="border border-t-0 border-slate-200 rounded-b-xl p-5 bg-white">
            <FlowCard
              node={{ id: "fu-b-notread", type: "response", label: "Hasn't Read It", script: "No / I haven't had a chance" }}
              isActive={activeNode === "fu-b-notread"}
              onClick={() => toggle("fu-b-notread")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b-noworries", type: "script", label: "No Stress", script: "No stress at all — most people don't to be honest." }}
              isActive={activeNode === "fu-b-noworries"}
              onClick={() => toggle("fu-b-noworries")}
            />

          </div>
        </div>
      </div>

      {/* Pitch the Zoom — brand split */}
      <div className="flex justify-center mt-16 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-px w-16 bg-slate-200"></div>
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Quodo or MS?</span>
          <div className="h-px w-16 bg-slate-200"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">

        {/* Quodo */}
        <div>
          <div className="rounded-t-xl px-5 py-3" style={{ background: "linear-gradient(135deg, #F473B7, #e85da0)" }}>
            <span className="text-sm font-bold text-white">🌐 Quodo — Replacing Websites</span>
          </div>
          <div className="border border-t-0 border-pink-200 rounded-b-xl p-4 bg-white">
            <FlowCard
              node={{ id: "fu-zoom-quodo", type: "script", label: "Pitch the Zoom", script: "From here, most of my clients choose to opt in to a quick 10–15 minute Zoom call where we walk you through a few websites we've built, show you how the process works, and send you a quote afterwards. From there, you can do with the information as you wish." }}
              isActive={activeNode === "fu-zoom-quodo"}
              onClick={() => toggle("fu-zoom-quodo")}
            />
          </div>
        </div>

        {/* Marketing Sweet */}
        <div>
          <div className="rounded-t-xl px-5 py-3" style={{ background: "linear-gradient(135deg, #96d16a, #7dba54)" }}>
            <span className="text-sm font-bold text-white">📈 Marketing Sweet — Existing Websites</span>
          </div>
          <div className="border border-t-0 border-green-200 rounded-b-xl p-4 bg-white">
            <FlowCard
              node={{ id: "fu-zoom-ms", type: "script", label: "Pitch the Zoom", script: "From here, most of my clients choose to opt in to a quick 10–15 minute Zoom call where I can run you through the email in detail. In the meeting we'll look at how you're currently performing online, benchmark you against some of your local competitors, and from there we'll put together a tailored quotation for you. You can do with that information as you wish." }}
              isActive={activeNode === "fu-zoom-ms"}
              onClick={() => toggle("fu-zoom-ms")}
            />
          </div>
        </div>
      </div>

      <Arrow />
      <div className="max-w-2xl mx-auto">
        <FlowCard
          node={{ id: "fu-b-howsound", type: "script", label: "Temperature Check", script: "How does that sound?" }}
          isActive={activeNode === "fu-b-howsound"}
          onClick={() => toggle("fu-b-howsound")}
        />
      </div>

      <DecisionLabel text="How do they respond?" />

      {/* B1 / B2 / B3 — three columns side by side */}
      <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto items-start">

        {/* B1: Open — okay sure */}
        <div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-t-xl px-4 py-3">
            <span className="text-sm font-bold text-emerald-700">✅ 1 — OKAY, SURE</span>
          </div>
          <div className="border border-t-0 border-emerald-100 rounded-b-xl p-4 bg-white">
            <FlowCard
              node={{ id: "fu-b1-resp", type: "response", label: "Okay Sure", script: "Okay sure / sounds good" }}
              isActive={activeNode === "fu-b1-resp"}
              onClick={() => toggle("fu-b1-resp")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b1-offer", type: "script", label: "Offer a Time", script: "Now my Senior Specialist [Name] is typically booked out two weeks in advance, however I do have an opening on [Day] at [Time] — would that work for you?" }}
              isActive={activeNode === "fu-b1-offer"}
              onClick={() => toggle("fu-b1-offer")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b1-dec", type: "decision", label: "Do they take the time?" }}
              isActive={activeNode === "fu-b1-dec"}
              onClick={() => toggle("fu-b1-dec")}
            />
            <div className="mt-3 space-y-3">
              <div>
                <BranchLabel text="YES" />
                <FlowCard
                  node={{ id: "fu-b1-yes-email", type: "script", label: "Confirm Email", script: "Okay great — I'll send through a calendar invite as soon as we jump off the phone. Just confirm again for me — is your best email [xyz@xyz.com.au]?" }}
                  isActive={activeNode === "fu-b1-yes-email"}
                  onClick={() => toggle("fu-b1-yes-email")}
                />
                <Arrow />
                <FlowCard
                  node={{ id: "fu-b1-close", type: "outcome-book", label: "Warm Close", script: "Alright fantastic, thanks so much [Name] — look forward to catching up on [Day]!" }}
                  isActive={activeNode === "fu-b1-close"}
                  onClick={() => toggle("fu-b1-close")}
                />
              </div>
              <div>
                <BranchLabel text="CAN'T MAKE IT" />
                <FlowCard
                  node={{ id: "fu-b1-no-alt", type: "script", label: "Offer Alternatives", script: "No worries — are you generally better mornings or afternoons? I'll find another time that works." }}
                  isActive={activeNode === "fu-b1-no-alt"}
                  onClick={() => toggle("fu-b1-no-alt")}
                />
                <Arrow />
                <FlowCard
                  node={{ id: "fu-b1-no-lock", type: "outcome-book", label: "Lock In New Time", script: "Perfect — I'll lock in [Day] at [Time] and send through a calendar invite. Is your best email still [xyz@xyz.com.au]?" }}
                  isActive={activeNode === "fu-b1-no-lock"}
                  onClick={() => toggle("fu-b1-no-lock")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* B2: Hesitant / want to think */}
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-t-xl px-4 py-3">
            <span className="text-sm font-bold text-amber-700">🤔 2 — HESITANT</span>
          </div>
          <div className="border border-t-0 border-amber-100 rounded-b-xl p-4 bg-white">
            <FlowCard
              node={{ id: "fu-b2-resp", type: "response", label: "Need to Think", script: "I'm not sure / I'd like to read the email first" }}
              isActive={activeNode === "fu-b2-resp"}
              onClick={() => toggle("fu-b2-resp")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b2-reframe", type: "script", label: "Reframe", script: "Yeah completely fair — to be honest the email is pretty general. It will take me max 10 minutes to take you through it over Zoom. There's no obligation at all but I think you'll get massive value from a catch up." }}
              isActive={activeNode === "fu-b2-reframe"}
              onClick={() => toggle("fu-b2-reframe")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b2-trybook", type: "script", label: "Try to Book", script: "I've got an opening on [Day] at [Time] — does that work?" }}
              isActive={activeNode === "fu-b2-trybook"}
              onClick={() => toggle("fu-b2-trybook")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b2-dec", type: "decision", label: "Do they take it?" }}
              isActive={activeNode === "fu-b2-dec"}
              onClick={() => toggle("fu-b2-dec")}
            />
            <div className="mt-3 space-y-3">
              <div>
                <BranchLabel text="YES ↖" />
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-emerald-500 text-base">↖</span>
                  <p className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Go to B1 — Confirm Email</p>
                </div>
              </div>
              <div>
                <BranchLabel text="STILL PUSHING BACK" />
                <FlowCard
                  node={{ id: "fu-b2-resend", type: "outcome-followup", label: "Resend & Follow Up", script: "No worries at all — I'll resend that email to you now so it's at the top of your inbox. If I give you a quick call on [Day], will that give you enough time to review it?" }}
                  isActive={activeNode === "fu-b2-resend"}
                  onClick={() => toggle("fu-b2-resend")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* B3: Not interested */}
        <div>
          <div className="bg-slate-100 border border-slate-200 rounded-t-xl px-4 py-3">
            <span className="text-sm font-bold text-slate-600">🚫 3 — NOT INTERESTED</span>
          </div>
          <div className="border border-t-0 border-slate-200 rounded-b-xl p-4 bg-white">
            <FlowCard
              node={{ id: "fu-b3-resp", type: "response", label: "Not Interested", script: "Not interested / not for me" }}
              isActive={activeNode === "fu-b3-resp"}
              onClick={() => toggle("fu-b3-resp")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b3-interrupt", type: "script", label: "Pattern Interrupt", script: "Yeah, that's totally fair — can I just ask, is that because you've already got something in place, or just not something you're looking at right now?" }}
              isActive={activeNode === "fu-b3-interrupt"}
              onClick={() => toggle("fu-b3-interrupt")}
            />
            <Arrow />
            <FlowCard
              node={{ id: "fu-b3-dec", type: "decision", label: "Their response?" }}
              isActive={activeNode === "fu-b3-dec"}
              onClick={() => toggle("fu-b3-dec")}
            />
            <div className="mt-3 space-y-3">
              <div>
                <BranchLabel text="JUST BUSY" />
                <FlowCard
                  node={{ id: "fu-b3-1", type: "script", label: "Reframe & Re-pitch", script: "Yeah, I get that — most people I speak to are busy because things are going well. The only reason I reached out is I had a look at your website, and there's a couple of things that could be costing you enquiries that you might not even be aware of. I can show you in 10 minutes." }}
                  isActive={activeNode === "fu-b3-1"}
                  onClick={() => toggle("fu-b3-1")}
                />
                <Arrow />
                <FlowCard
                  node={{ id: "fu-b3-1-book", type: "outcome-book", label: "Book", script: "Would [Day] or [Day] suit you better?" }}
                  isActive={activeNode === "fu-b3-1-book"}
                  onClick={() => toggle("fu-b3-1-book")}
                />
              </div>
              <div>
                <BranchLabel text="STILL NOT INTERESTED" />
                <FlowCard
                  node={{ id: "fu-b3-2", type: "outcome-followup", label: "Leave the Door Open", script: "No worries at all — sounds like timing's probably just not right. What I might do is shoot you a quick note with what I found — if it's relevant, we can chat later." }}
                  isActive={activeNode === "fu-b3-2"}
                  onClick={() => toggle("fu-b3-2")}
                />
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
  const [scriptVersion, setScriptVersion] = useState<"original" | "new">("original");
  const [rebookingType, setRebookingType] = useState<'noshow' | 'reschedule'>('reschedule');
  const [tryLaterPitch, setTryLaterPitch] = useState<'quodo' | 'ms'>('ms');
  const [tryLaterBranch, setTryLaterBranch] = useState<'A' | 'B' | 'C' | 'D'>('A');
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
                <div className="flex items-center gap-2 print:hidden">
                  <a
                    href="#cold-call-script"
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    📞 Cold Call
                  </a>
                  <a
                    href="#followup-script"
                    className="px-3 py-2 bg-[#E6017D] hover:bg-[#c9016b] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    📞 Follow Up
                  </a>
                  <a
                    href="#rebooking-call"
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    📅 Rebooking
                  </a>
            <a
                    href="#try-later-call"
                    className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    📅 Try Later
                  </a>
                  <a
                    href="#na-x2-call"
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    📵 NA x 2
                  </a>
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

        <div id="cold-call-script" className="max-w-[1600px] mx-auto px-8 py-8 print:py-4">

          {/* Script Version Tabs (Original vs New) */}
          <div className="flex justify-center mb-8 print:hidden">
            <div className="inline-flex rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-md">
              <button
                onClick={() => { setScriptVersion("original"); setActiveNode(null); }}
                className="px-7 py-3 text-sm font-bold transition-all"
                style={{
                  background: scriptVersion === "original" ? "#0f172a" : "white",
                  color: scriptVersion === "original" ? "white" : "#475569",
                }}
              >
                📜 Original Script
              </button>
              <button
                onClick={() => { setScriptVersion("new"); setActiveNode(null); }}
                className="px-7 py-3 text-sm font-bold transition-all"
                style={{
                  background: scriptVersion === "new" ? "#E6017D" : "white",
                  color: scriptVersion === "new" ? "white" : "#475569",
                }}
              >
                ✨ New Script
              </button>
            </div>
          </div>

          {scriptVersion === "new" && (
            <div className="max-w-3xl mx-auto mb-6 print:hidden">
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-sm text-pink-900">
                <strong>New Script — In Training.</strong> This version reflects the sales team&apos;s latest amendments. Use the Original tab while the team is being trained on this version.
              </div>
            </div>
          )}

          {scriptVersion === "original" && (
          <>
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

          {/* Brand toggle */}
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
          </>
          )}

          {scriptVersion === "new" && (
          <>
          {/* ──────────────────────────────────────────── */}
          {/* NEW SCRIPT VERSION                          */}
          {/* ──────────────────────────────────────────── */}

          {/* Shared intro */}
          <div className="max-w-2xl mx-auto">
            <FlowCard
              node={{ id: "new-intro", type: "start", label: "Introduction", script: "Hi [Name], it's [Your Name] here from Marketing Sweet, how are you?" }}
              isActive={activeNode === "new-intro"}
              onClick={() => toggle("new-intro")}
            />
          </div>

          <DecisionLabel text="How do they respond?" />

          <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto items-stretch">
            <FlowCard
              node={{ id: "new-positive", type: "response", label: "Positive", script: "That's really great to hear!" }}
              isActive={activeNode === "new-positive"}
              onClick={() => toggle("new-positive")}
            />
            <FlowCard
              node={{ id: "new-negative", type: "response", label: "Negative / Busy", script: "No worries, I'll be quick." }}
              isActive={activeNode === "new-negative"}
              onClick={() => toggle("new-negative")}
            />
          </div>

          <Arrow />

          {/* Brand toggle (new) */}
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
                Quodo — Replacing / New Website
              </button>
              <button
                onClick={() => { setBrand("ms"); setActiveNode(null); }}
                className="px-8 py-4 text-base font-bold transition-all"
                style={{
                  background: brand === "ms" ? "linear-gradient(135deg, #96d16a, #7dba54)" : "white",
                  color: brand === "ms" ? "white" : "#475569",
                }}
              >
                Marketing Sweet — Existing Website
              </button>
            </div>
          </div>

          {/* Flow content (new) */}
          {brand === "quodo" ? (
            <QuodoFlowNew activeNode={activeNode} toggle={toggle} />
          ) : (
            <MarketingSweetFlowNew activeNode={activeNode} toggle={toggle} />
          )}

          {/* Outcomes Summary */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>🎯</span> 3. Outcomes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-700/30 border border-emerald-500/30 rounded-lg p-4">
                  <div className="text-xs font-bold tracking-widest uppercase text-emerald-300 mb-2">Book the Meeting</div>
                  <p className="text-sm italic leading-relaxed text-emerald-50">&ldquo;Awesome, are you free for 15-20 mins on [day] at [time]?&rdquo;</p>
                  <p className="text-xs text-emerald-200/70 mt-3">✩ Always mention the link to the relevant sales presentation so they have something visual to reference.</p>
                </div>
                <div className="bg-[#E6017D]/20 border border-[#E6017D]/40 rounded-lg p-4">
                  <div className="text-xs font-bold tracking-widest uppercase text-pink-200 mb-2">Follow Up</div>
                  <p className="text-sm italic leading-relaxed text-pink-50">&ldquo;No stress at all, I can follow up in a month or so.&rdquo;</p>
                  <p className="text-xs text-pink-200/70 mt-3">✩ Always mention the link so the prospect has something visual to reference.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Extra Qualification (new — categorised) */}
          <ExtraQualificationNew activeNode={activeNode} toggle={toggle} />

          {/* Every Follow Up = Mention the Link */}
          <div className="mt-6 max-w-3xl mx-auto">
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

          {/* Objection Handling */}
          <ObjectionHandlingNew activeNode={activeNode} toggle={toggle} />

          <div className="mt-8 text-center pb-8 print:mt-4 print:pb-2">
            <p className="text-xs text-slate-400">Reference: Module 4 — Cold Call Script (New Version, in training)</p>
          </div>
          </>
          )}

          {/* ──────────────────────────────────────────── */}
          {/* FOLLOW UP CALL SCRIPT SECTION               */}
          {/* ──────────────────────────────────────────── */}
          <div id="followup-script" className="mt-8 pt-12 border-t-2 border-slate-200 scroll-mt-24">
            <div className="mb-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#E6017D]/10 text-[#E6017D] px-3 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide uppercase">
                📞 Follow Up Call
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">Follow Up Call Script</h2>
              <p className="text-slate-500 mt-1.5 text-sm">No booking made — email sent after cold call</p>
            </div>
            <FollowUpScriptSection activeNode={activeNode} toggle={toggle} />
          </div>

          <div className="mt-8 text-center pb-12 print:hidden">
            <p className="text-xs text-slate-400">Reference: Module 4 — Follow Up Call Script</p>
          </div>

          {/* ===== REBOOKING CALL SECTION ===== */}
          <div id="rebooking-call" className="mt-8 pt-12 border-t-2 border-slate-200 scroll-mt-24">

            <div className="mb-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide uppercase">
                📅 Rebooking Call
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">Rebooking Call</h2>
              <p className="text-slate-500 mt-1.5 text-sm">For booked meetings that didn&apos;t proceed as planned</p>
            </div>

            {/* Scenario selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => setRebookingType('reschedule')}
                  className="px-8 py-4 text-base font-bold transition-all"
                  style={{
                    background: rebookingType === 'reschedule' ? 'linear-gradient(135deg, #fdba74, #fb923c)' : 'white',
                    color: rebookingType === 'reschedule' ? 'white' : '#475569',
                  }}
                >
                  📅 Rescheduled
                </button>
                <button
                  onClick={() => setRebookingType('noshow')}
                  className="px-8 py-4 text-base font-bold transition-all"
                  style={{
                    background: rebookingType === 'noshow' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'white',
                    color: rebookingType === 'noshow' ? 'white' : '#475569',
                  }}
                >
                  🚫 No Show
                </button>
              </div>
            </div>

            {/* ══ RESCHEDULE FLOW (default) ══ */}
            {rebookingType === 'reschedule' && (
              <div>
                <div className="bg-slate-900 rounded-2xl p-6 mb-4 max-w-3xl mx-auto">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">SAY</div>
                  <h3 className="font-bold text-white text-base mb-3">Opening</h3>
                  <p className="text-slate-300 text-sm italic leading-relaxed mb-2">
                    &ldquo;Hey [Name], it&apos;s [Your Name] here from Marketing Sweet. How are you going?&rdquo;
                  </p>
                  <p className="text-slate-300 text-sm italic leading-relaxed">
                    &ldquo;Yeah, really good, thank you for asking. Thanks for letting us know you couldn&apos;t make your meeting yesterday — I&apos;ve got my diary in front of me now. Can we lock in a new time?&rdquo;
                  </p>
                </div>

                <div className="flex justify-center my-3 text-slate-300 text-xl">↓</div>
                <div className="text-center mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Response?</span>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">

                  {/* A: Yes still keen */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-2">✅ A — Yes, still keen</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-2">SAY</div>
                      <p className="text-slate-500 text-sm italic leading-relaxed">
                        &ldquo;Perfect. I&apos;ve actually got an opening at [Time] on [Day] — would that work for you? It should only take 10 minutes.&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">↓</div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-green-600 mb-2">BOOK</div>
                      <p className="text-slate-500 text-sm italic leading-relaxed">
                        &ldquo;Perfect. I&apos;ll update the invite now and send the confirmation through — we&apos;ll lock in [Day] at [Time].&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* B: Not right now */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">⏱ B — Not right now</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;This week won&apos;t work&rdquo; / &ldquo;Not right now&rdquo;
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-2">SAY</div>
                      <p className="text-slate-500 text-sm italic leading-relaxed">
                        &ldquo;No worries — is it just this week that&apos;s no good? We can look at something for next week instead if that suits better. It will only take 10 minutes.&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Decision</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">📆 B1 — Needs later date</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;Gotcha. When do you reckon it&apos;ll be back on your radar — next week, next month, or a bit further out?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-1 text-slate-300 text-sm">↓</div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;Too easy. I&apos;ll make a note to touch base around then.&rdquo;
                      </p>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">🚫 B2 — No longer interested</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;No worries at all — appreciate you letting me know.&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-1 text-slate-300 text-sm">↓</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">CLOSE</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;If anything changes down the track, feel free to reach out.&rdquo;
                      </p>
                    </div>
                  </div>

                </div>
                <div className="mt-8 text-center pb-8">
                  <p className="text-xs text-slate-400">Rebooking Call — Reschedule Script</p>
                </div>
              </div>
            )}

            {/* ══ NO SHOW FLOW ══ */}
            {rebookingType === 'noshow' && (
              <div>
                <div className="bg-slate-900 rounded-2xl p-6 mb-4 max-w-3xl mx-auto">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">SAY</div>
                  <h3 className="font-bold text-white text-base mb-3">Opening</h3>
                  <p className="text-slate-300 text-sm italic leading-relaxed mb-2">
                    &ldquo;Hey [Name], it&apos;s [Your Name] here from Marketing Sweet. How are you going?&rdquo;
                  </p>
                  <p className="text-slate-300 text-sm italic leading-relaxed">
                    &ldquo;Yeah, really good, thanks. We had a meeting booked in yesterday at [Time]. I sent you through a Zoom link and gave you a call, but I couldn&apos;t get through. I assumed you must&apos;ve been busy or something popped up.&rdquo;
                  </p>
                </div>

                <div className="flex justify-center my-3 text-slate-300 text-xl">↓</div>
                <div className="text-center mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">What do they say?</span>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">

                  {/* A: Still interested */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-2">✅ A — Still interested</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-2">SAY</div>
                      <p className="text-slate-500 text-sm italic leading-relaxed mb-2">
                        &ldquo;No stress at all — don&apos;t worry about it.&rdquo;
                      </p>
                      <p className="text-slate-500 text-sm italic leading-relaxed">
                        &ldquo;I&apos;ve already done all the prep and we&apos;re ready to rock and roll. It&apos;ll only take about 10 minutes.&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">↓</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-2">Attempt same-day rebook</div>
                      <p className="text-slate-500 text-sm italic leading-relaxed mb-2">
                        &ldquo;Are you free later today around [Time]?&rdquo;
                      </p>
                      <p className="text-slate-400 text-xs mb-1">If yes → lock it in. If no → offer options:</p>
                      <p className="text-slate-500 text-sm italic leading-relaxed mb-1">
                        &ldquo;No worries — when&apos;s generally good for you?&rdquo;
                      </p>
                      <p className="text-slate-500 text-sm italic leading-relaxed mb-1">
                        &ldquo;Are you any good Thursday or Friday?&rdquo;
                      </p>
                      <p className="text-slate-500 text-sm italic leading-relaxed">
                        &ldquo;I&apos;ve got [Option 1] or [Option 2] — what works best?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">↓</div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-green-600 mb-2">BOOK</div>
                      <p className="text-slate-500 text-sm italic leading-relaxed">
                        &ldquo;Too easy. I&apos;ll resend the calendar invite and shoot you a text before the meeting as well.&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* B: Not interested */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">🚫 B — Not interested</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;We&apos;re not really interested anymore&rdquo;
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <div className="text-[10px] text-slate-400 font-semibold mb-2">Soft probe</div>
                      <p className="text-slate-500 text-sm italic leading-relaxed">
                        &ldquo;No stress at all — just quickly, was that more a timing thing or has something changed on your end?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason?</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">⏱ B1 — Timing issue</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed mb-1">
                        &ldquo;Gotcha, that makes sense.&rdquo;
                      </p>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;When do you reckon it might be back on your radar — next couple of months or further out?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-1 text-slate-300 text-sm">↓</div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;Too easy. I&apos;ll make a note to touch base then and we&apos;ll go from there.&rdquo;
                      </p>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">🚫 B2 — No longer interested</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;All good — just so I don&apos;t chase you unnecessarily, was there something specific that changed?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-1 text-slate-300 text-sm">↓</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">CLOSE</div>
                      <p className="text-slate-500 text-xs italic leading-relaxed mb-1">
                        &ldquo;No worries at all, I appreciate you letting me know.&rdquo;
                      </p>
                      <p className="text-slate-500 text-xs italic leading-relaxed">
                        &ldquo;If things change down the track, feel free to reach out.&rdquo;
                      </p>
                    </div>
                  </div>

                </div>
                <div className="mt-8 text-center pb-8">
                  <p className="text-xs text-slate-400">Rebooking Call — No Show Script</p>
                </div>
              </div>
            )}

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TRY LATER CALL SECTION                                          */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div id="try-later-call" className="mt-8 pt-12 border-t-2 border-slate-200 scroll-mt-24">

            <div className="mb-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#E6017D]/10 text-[#E6017D] px-3 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide uppercase">
                📅 Try Later Call
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">Try Later Call Script</h2>
              <p className="text-slate-500 mt-1.5 text-sm">For prospects pushed out 3, 6, 9, 12 months or longer from a previous conversation</p>
            </div>

            {/* Pre-call prep banner */}
            <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 max-w-3xl">
              <div className="flex items-start gap-3">
                <div className="text-xl">📝</div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-amber-700 mb-1">Before You Dial</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Pull up your ClickUp notes from the previous conversation. You need to know <strong>who they spoke with</strong>, <strong>when</strong>, and <strong>what was said</strong>. Without this, it&apos;s just another cold call.
                  </p>
                </div>
              </div>
            </div>

            {/* Introduction */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-4 max-w-3xl mx-auto">
              <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-3">SAY</div>
              <h3 className="font-bold text-slate-900 text-base mb-3">Introduction</h3>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;Hi [Name], it&apos;s [Your Name] here from Marketing Sweet, how have you been?&rdquo;
              </p>
            </div>

            <div className="flex justify-center my-3 text-slate-300 text-xl">↓</div>
            <div className="text-center mb-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">How do they respond?</span>
            </div>

            {/* Positive / Negative split */}
            <div className="grid md:grid-cols-2 gap-4 mb-10 max-w-3xl mx-auto">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-2">✅ Positive</div>
                <p className="text-blue-700 text-sm italic font-semibold leading-relaxed mb-3">
                  &ldquo;Yeah, really good thanks.&rdquo;
                </p>
                <div className="border-t border-blue-200 pt-3">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    &ldquo;That&apos;s really great to hear!&rdquo;
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">⚪ Negative</div>
                <p className="text-blue-700 text-sm italic font-semibold leading-relaxed mb-3">
                  &ldquo;Yeah, not too bad.&rdquo;
                </p>
                <div className="border-t border-blue-200 pt-3">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    &ldquo;No worries, I&apos;ll be quick.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ PITCH TYPE TOGGLE ═══ */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => setTryLaterPitch('quodo')}
                  className={`px-6 py-3 text-sm font-bold transition-all ${
                    tryLaterPitch === 'quodo'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🌐 Quodo — Replacing Websites
                </button>
                <button
                  onClick={() => setTryLaterPitch('ms')}
                  className={`px-6 py-3 text-sm font-bold transition-all ${
                    tryLaterPitch === 'ms'
                      ? 'bg-[#E6017D] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  📈 Marketing Sweet — Existing Websites
                </button>
              </div>
            </div>

            {/* ═══ QUODO PITCH ═══ */}
            {tryLaterPitch === 'quodo' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white border-2 border-purple-200 rounded-xl p-5 mb-6">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Reconnect &amp; Reiterate</h3>
                  <p className="text-slate-600 text-sm italic leading-relaxed mb-4">
                    &ldquo;Look, I don&apos;t expect you to remember us &mdash; I know you probably get hundreds of calls like this &mdash; but we were chatting about [topic] back in [timeframe] and discussed fixing up the website. I&apos;ve noticed nothing really has changed, so I assumed you must have been too busy and haven&apos;t had time to get to it?&rdquo;
                  </p>
                  <div className="pt-4 border-t border-purple-100">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                    <h3 className="font-bold text-slate-900 text-sm mb-2">Show the Value</h3>
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                      &ldquo;Look, we&apos;ve done many trade-based sites just like yours. I&apos;d love to show you how we operate, our process, and some sites we&apos;ve done. From there we can run through our packages and you can do what you wish with the quotation &mdash; the catch-up takes no longer than 15 minutes.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-6">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-3">SAY</div>
                  <h3 className="font-bold text-slate-900 text-base mb-3">Go For Booking</h3>
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    &ldquo;Are you available on [Day] at [Time]?&rdquo;
                  </p>
                </div>

                <div className="text-center mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">How do they respond? Select a branch:</span>
                </div>

                {/* Branch tabs — Quodo */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <button
                    onClick={() => setTryLaterBranch('A')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'A'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✅ A — Open
                  </button>
                  <button
                    onClick={() => setTryLaterBranch('B')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'B'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🔒 B — With Provider
                  </button>
                  <button
                    onClick={() => setTryLaterBranch('C')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'C'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🤔 C — Hesitant
                  </button>
                  <button
                    onClick={() => setTryLaterBranch('D')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'D'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🚫 D — Not Now
                  </button>
                </div>

                {/* Quodo Branch A */}
                {tryLaterBranch === 'A' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-emerald-200"></div>
                      <span className="text-sm font-bold text-emerald-700">✅ A — OPEN TO RECONNECTING</span>
                      <div className="h-px flex-1 bg-emerald-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;Yeah, I&apos;m open to a chat.&rdquo;
                      </p>
                    </div>

                  </div>
                )}

                {/* Quodo Branch B */}
                {tryLaterBranch === 'B' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <span className="text-sm font-bold text-slate-700">🔒 B — STILL WITH CURRENT PROVIDER</span>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;I&apos;m still with my current provider &mdash; I&apos;m liking how they&apos;re performing.&rdquo;
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Probe on Price</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;No stress at all &mdash; what were you paying, roughly, just out of interest?&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">↳ Let them answer.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">The Hook</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;If I could reduce your cost and build you a much better website, would you be open to catching up?&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">↳ Let them answer.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Go For Booking</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;I have availability on [Day] at [Time] &mdash; does that work with you?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300 text-sm">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Do they agree?</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-1">BOOK</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          Proceed to <strong>Confirm Email</strong> &amp; offer to send example sites. Then <strong>Warm Close</strong>.
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          &ldquo;No worries at all &mdash; I&apos;ll send through some examples of our recent work so you&apos;ve got something to reference. I&apos;ll touch base again in a few months.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quodo Branch C */}
                {tryLaterBranch === 'C' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-amber-200"></div>
                      <span className="text-sm font-bold text-amber-700">🤔 C — HESITANT / &ldquo;ON THE TOOLS&rdquo;</span>
                      <div className="h-px flex-1 bg-amber-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;I&apos;m on the tools / I don&apos;t have much time &mdash; how does it actually work?&rdquo;
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Qualify Their Lead Source</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;Totally understand. Just quickly &mdash; I&apos;m assuming most of your work comes through word-of-mouth and referrals?&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">↳ Let them answer (usually yes).</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">The Hook — Referrals Check Your Website</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;Yep, sweet. I&apos;m extremely confident that the people being recommended to you are checking out your website before they call &mdash; and right now, I can almost guarantee they&apos;re going to be let down when they land on it. Best thing to do is to hear us out. I&apos;ve got [Day] at [Time] free &mdash; did you have 15 minutes?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300 text-sm">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Do they agree?</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-1">BOOK</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          Proceed to <strong>Confirm Email</strong> &amp; offer to send example sites. Then <strong>Warm Close</strong>.
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          &ldquo;No worries &mdash; I&apos;ll send through some examples of our work so you&apos;ve got a reference point, and I&apos;ll touch base again in a month or so.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quodo Branch D */}
                {tryLaterBranch === 'D' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-red-200"></div>
                      <span className="text-sm font-bold text-red-600">🚫 D — NOT INTERESTED / TIMING STILL OFF</span>
                      <div className="h-px flex-1 bg-red-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;Still not the right time / Cashflow is still tight / Not a priority right now.&rdquo;
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Anchor on Time + Relevance</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;Well, the good thing is the meeting only takes 10&ndash;15 minutes, and in terms of industry experience we&apos;ve done heaps of [their trade] websites &mdash; which I can show you when we catch up. Are you available for a chat on [Day] at [Time]?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300 text-sm">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Their response?</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-1">OPEN → BOOK</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          Proceed to <strong>Confirm Email</strong> &amp; offer to send example sites. Then <strong>Warm Close</strong>.
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          &ldquo;No stress at all &mdash; I&apos;ll send through some example sites so you&apos;ve got something to reference when the timing&apos;s right. I&apos;ll touch base again in [3/6/9 months].&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ MS PITCH ═══ */}
            {tryLaterPitch === 'ms' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white border-2 border-[#E6017D]/30 rounded-xl p-5 mb-6">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Reconnect &amp; Reiterate</h3>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    &ldquo;Look, I don&apos;t expect you to remember us &mdash; I know you probably get hundreds of calls like this &mdash; but we were chatting about [topic] back in [timeframe]. I&apos;ve been keeping an eye on things and noticed not much has changed, so I thought it might be worth your while reconnecting &mdash; I&apos;ve got a few different ideas I wouldn&apos;t mind sharing with you.&rdquo;
                  </p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-6">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-3">SAY</div>
                  <h3 className="font-bold text-slate-900 text-base mb-3">Go For Booking</h3>
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    &ldquo;Are you available on [Day] at [Time]?&rdquo;
                  </p>
                </div>

                <div className="text-center mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">How do they respond? Select a branch:</span>
                </div>

                {/* Branch tabs — MS */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <button
                    onClick={() => setTryLaterBranch('A')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'A'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✅ A — Open
                  </button>
                  <button
                    onClick={() => setTryLaterBranch('B')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'B'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🔒 B — With Provider
                  </button>
                  <button
                    onClick={() => setTryLaterBranch('C')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'C'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🤔 C — Hesitant
                  </button>
                  <button
                    onClick={() => setTryLaterBranch('D')}
                    className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
                      tryLaterBranch === 'D'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🚫 D — Not Now
                  </button>
                </div>

                {/* MS Branch A */}
                {tryLaterBranch === 'A' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-emerald-200"></div>
                      <span className="text-sm font-bold text-emerald-700">✅ A — OPEN TO RECONNECTING</span>
                      <div className="h-px flex-1 bg-emerald-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;Yeah, I&apos;m open to a chat.&rdquo;
                      </p>
                    </div>

                  </div>
                )}

                {/* MS Branch B */}
                {tryLaterBranch === 'B' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <span className="text-sm font-bold text-slate-700">🔒 B — STILL WITH CURRENT PROVIDER</span>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;I&apos;m still with my current provider &mdash; I&apos;m liking how they&apos;re performing.&rdquo;
                      </p>
                    </div>

                    {/* Step 1: Probe satisfaction */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">1</span>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">SAY</div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Probe Satisfaction</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;No stress at all &mdash; how are you finding them?&rdquo;
                      </p>
                    </div>

                    {/* Step 2: How long with them */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">2</span>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">SAY</div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Qualify Tenure</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed mb-3">
                        &ldquo;How long have you been with them?&rdquo;
                      </p>

                      <div className="grid md:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        {/* 2a — More than 6 months */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="text-[10px] font-bold tracking-widest uppercase text-amber-700 mb-1">IF &gt; 6 MONTHS</div>
                          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">🔧 BEFORE THE CALL (TIP)</div>
                          <p className="text-slate-600 text-xs leading-relaxed mb-2">
                            Run their site through SEMrush. Pinpoint total traffic and identify keywords they <em>should</em> be ranking for that aren&apos;t on page 1.
                          </p>
                          <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mt-2 mb-1">SAY</div>
                          <p className="text-slate-600 text-xs italic leading-relaxed">
                            &ldquo;Based on my research I&apos;ve noticed the total traffic to the website isn&apos;t great &mdash; most of it&apos;s coming from your brand name, which is built from referrals, not SEO. For example, when someone types in [target keyword], you&apos;d want to be appearing &mdash; currently you&apos;re on page [X].&rdquo;
                          </p>
                        </div>

                        {/* 2b — Less than 3 months */}
                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                          <div className="text-[10px] font-bold tracking-widest uppercase text-sky-700 mb-1">IF &lt; 3 MONTHS</div>
                          <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                          <p className="text-slate-600 text-xs italic leading-relaxed mb-2">
                            &ldquo;No worries &mdash; we&apos;ll keep an eye on things over the next few months and touch base in 3 months. That gives the campaign enough time to show whether it&apos;s working or not.&rdquo;
                          </p>
                          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-2 mb-1">📋 ACTION</div>
                          <p className="text-slate-600 text-xs leading-relaxed">
                            Log current traffic numbers in ClickUp so you can refer back when you call in 3 months.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Ask about spend */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">3</span>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">SAY</div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Probe on Spend</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;If you don&apos;t mind me asking &mdash; what were you spending on this?&rdquo;
                      </p>
                    </div>

                    {/* Step 4: Pitch the second opinion */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">4</span>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">SAY</div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Pitch the Second Opinion</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;Best thing to do is get a second unbiased opinion. I can run through exactly what I&apos;m seeing on my software, plus I&apos;ll benchmark you against your local competition.&rdquo;
                      </p>
                    </div>

                    <div className="flex justify-center my-2 text-slate-300 text-sm">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Do they agree?</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-1">BOOK</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          Proceed to <strong>Confirm Email</strong> &amp; <strong>Warm Close</strong>.
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          &ldquo;No worries at all &mdash; I&apos;ll keep an eye on how things are tracking and touch base again in a few months.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* MS Branch C */}
                {tryLaterBranch === 'C' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-amber-200"></div>
                      <span className="text-sm font-bold text-amber-700">🤔 C — HESITANT / &ldquo;ON THE TOOLS&rdquo;</span>
                      <div className="h-px flex-1 bg-amber-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;I&apos;m on the tools / I don&apos;t have much time &mdash; how does it actually work?&rdquo;
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Lost-Business Hook</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;People are trying to find you, but at the moment they&apos;re being forced to go to the competition because we&apos;re not appearing online. Just out of interest &mdash; do you have the capacity for more work?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300 text-sm">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Do they agree?</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-1">BOOK</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          Proceed to <strong>Confirm Email</strong> &amp; <strong>Warm Close</strong>.
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          &ldquo;No worries &mdash; I&apos;ll keep monitoring how you&apos;re performing online and touch base again in a month or so.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* MS Branch D */}
                {tryLaterBranch === 'D' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-red-200"></div>
                      <span className="text-sm font-bold text-red-600">🚫 D — NOT INTERESTED / TIMING STILL OFF</span>
                      <div className="h-px flex-1 bg-red-200"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                      <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                        &ldquo;Still not the right time / Cashflow is still tight / Not a priority right now.&rdquo;
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-1">SAY</div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Anchor on Time + Results</h4>
                      <p className="text-slate-600 text-sm italic leading-relaxed">
                        &ldquo;Well, the good thing is the meeting only takes 10&ndash;15 minutes, and in terms of industry experience we work with heaps of [their industry] businesses across Australia and get really good results &mdash; which I&apos;d love to show you. Are you available for a chat on [Day] at [Time]?&rdquo;
                      </p>
                    </div>
                    <div className="flex justify-center my-2 text-slate-300 text-sm">↓</div>
                    <div className="text-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Their response?</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-1">OPEN → BOOK</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          Proceed to <strong>Confirm Email</strong> &amp; <strong>Warm Close</strong>.
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-1">FOLLOW UP</div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          &ldquo;No stress at all &mdash; I&apos;ll keep an eye on your performance and touch base again in [3/6/9 months] when the timing&apos;s better.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Email + Warm Close — shared endings */}
            <div className="mt-10 pt-8 border-t border-slate-200 max-w-3xl mx-auto">
              <div className="text-center mb-5">
                <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">If booked → close the loop</span>
              </div>

              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-3">SAY</div>
                <h3 className="font-bold text-slate-900 text-base mb-3">Set the Scene + Confirm Email</h3>
                {tryLaterPitch === 'quodo' ? (
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    &ldquo;Awesome, I&apos;ll book that in with [Closer] &mdash; he&apos;s absolutely amazing and you&apos;ll get some serious value out of what he has to show you regardless of what you decide. We&apos;ll do it over Zoom so he can show you visually. I&apos;ll also send through a few example sites we&apos;ve done &mdash; particularly for trade-based businesses like yours &mdash; so you&apos;ve got something to look at before the call. From there [Closer] will walk you through our process and put together a tailored quote. Is your best email still [xyz@xyz.com.au]?&rdquo;
                  </p>
                ) : (
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    &ldquo;Awesome, I&apos;ll book that in with [Closer] &mdash; he&apos;s absolutely amazing and you&apos;ll get some serious value out of what he has to show you regardless of what you decide. We&apos;ll do it over Zoom so he can show you visually. In the meeting he&apos;ll walk you through how you&apos;re currently performing online, benchmark you against some of your local competitors, and from there we&apos;ll put together a tailored quote. Is your best email still [xyz@xyz.com.au]?&rdquo;
                  </p>
                )}
              </div>

              <div className="flex justify-center my-3 text-slate-300 text-xl">↓</div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
                <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-3">BOOK</div>
                <h3 className="font-bold text-slate-900 text-base mb-3">Warm Close</h3>
                <p className="text-slate-700 text-sm italic leading-relaxed">
                  &ldquo;Alright fantastic, thanks so much [Name] &mdash; [Closer]&apos;s going to take great care of you on [Day] at [Time]. Speak soon!&rdquo;
                </p>
              </div>
            </div>

            {/* Key Principles */}
            <div className="mt-10 grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Reference the Previous Conversation</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Always name-drop the previous team member, timeframe, and specific topic. Without this, it&apos;s just another cold call.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">👀</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Show You&apos;ve Been Watching</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Mention what you&apos;ve observed since &mdash; traffic, rankings, no site changes. This proves you&apos;ve kept them on your radar.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">🔄</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Revisit Their Previous Objection</h4>
                <p className="text-slate-500 text-xs leading-relaxed">If cashflow was tight, ask how pipeline is looking now. If they were too busy, ask how the schedule is tracking.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">📅</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Always Lock a Next Step</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Whether booked or pushed further out, never end without a specific next date in the diary.</p>
              </div>
            </div>

            <div className="mt-8 text-center pb-8">
              <p className="text-xs text-slate-400">Try Later Call &mdash; Reconnection Script</p>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* NA x 2 SCRIPT SECTION                                           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div id="na-x2-call" className="mt-8 pt-12 border-t-2 border-slate-200 scroll-mt-24">

            <div className="mb-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide uppercase">
                📵 NA x 2 Call
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">NA x 2 Script</h2>
              <p className="text-slate-500 mt-1.5 text-sm">For clients who were booked but didn&apos;t answer the confirmation call after 2 attempts</p>
            </div>

            {/* Pre-call prep banner */}
            <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 max-w-3xl">
              <div className="flex items-start gap-3">
                <div className="text-xl">⏰</div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-amber-700 mb-1">When To Make This Call</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Completed by the <strong>Bookings Specialist / Lead Genner</strong> at <strong>9:00am</strong> on the morning of the scheduled meeting. This is the third attempt after two missed confirmation calls the day prior.
                  </p>
                </div>
              </div>
            </div>

            {/* Introduction */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-4 max-w-3xl mx-auto">
              <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-3">SAY</div>
              <h3 className="font-bold text-slate-900 text-base mb-3">Introduction</h3>
              <p className="text-slate-700 text-sm italic leading-relaxed">
                &ldquo;Hi [Name], it&apos;s [Your Name] here from Marketing Sweet &mdash; how are you?&rdquo;
              </p>
            </div>

            <div className="flex justify-center my-3 text-slate-300 text-xl">↓</div>

            {/* Positive response from client */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 max-w-3xl mx-auto">
              <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
              <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                &ldquo;Yeah, really good thanks.&rdquo;
              </p>
            </div>

            {/* Operator small talk reply */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 max-w-3xl mx-auto">
              <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-2">SAY</div>
              <p className="text-slate-600 text-sm italic leading-relaxed">
                &ldquo;That&apos;s good to hear &mdash; I&apos;m going really well, thank you.&rdquo;
              </p>
            </div>

            <div className="flex justify-center my-3 text-slate-300 text-xl">↓</div>

            {/* Reason for call */}
            <div className="bg-slate-900 rounded-2xl p-6 mb-6 max-w-3xl mx-auto">
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">SAY</div>
              <h3 className="font-bold text-white text-base mb-3">Reason For The Call</h3>
              <p className="text-slate-300 text-sm italic leading-relaxed">
                &ldquo;We struggled to get hold of you yesterday, but I&apos;m just touching base to let you know that we&apos;ve completed all of the research into your business and competitors. We&apos;re looking forward to seeing you at [Time] this afternoon and will send the Zoom link through to your email.&rdquo;
              </p>
            </div>

            <div className="flex justify-center my-3 text-slate-300 text-xl">↓</div>
            <div className="text-center mb-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">How do they respond?</span>
            </div>

            {/* Three branches */}
            <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">

              {/* A: Good to go */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">✅ A &mdash; Good To Go</div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                  <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                    &ldquo;Yep, all good &mdash; see you then.&rdquo;
                  </p>
                </div>
                <div className="flex justify-center my-2 text-slate-300">↓</div>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-2">BOOK</div>
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    &ldquo;Brilliant &mdash; [Closer] will send the Zoom link through to your email just beforehand. Speak soon!&rdquo;
                  </p>
                </div>
              </div>

              {/* B: Cancel */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">🚫 B &mdash; Needs To Cancel</div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                  <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                    &ldquo;Actually, I need to cancel.&rdquo;
                  </p>
                </div>
                <div className="flex justify-center my-2 text-slate-300">↓</div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-yellow-600 mb-2">FOLLOW UP</div>
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    &ldquo;No worries at all &mdash; we&apos;ll leave it with you for now and reach back out in 6 months to see if anything has changed.&rdquo;
                  </p>
                </div>
              </div>

              {/* C: Reschedule */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">📅 C &mdash; Needs To Reschedule</div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-blue-500 mb-2">THEY SAY</div>
                  <p className="text-blue-700 text-sm italic font-semibold leading-relaxed">
                    &ldquo;Sorry, I can&apos;t make it &mdash; can we reschedule?&rdquo;
                  </p>
                </div>
                <div className="flex justify-center my-2 text-slate-300">↓</div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 mb-2">SAY</div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    &ldquo;No stress at all &mdash; does [Time] on [Day] work to reschedule?&rdquo;
                  </p>
                </div>
                <div className="flex justify-center my-2 text-slate-300">↓</div>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 mb-2">BOOK</div>
                  <p className="text-slate-700 text-sm italic leading-relaxed">
                    &ldquo;Brilliant &mdash; I&apos;ll move a few things around in [Closer]&apos;s calendar and we&apos;ll see you then.&rdquo;
                  </p>
                </div>
              </div>

            </div>

            {/* Key Principles */}
            <div className="mt-10 grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">⏰</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">9am Sharp</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Make this call first thing on the morning of the meeting &mdash; it gives the client time to confirm or rearrange before the closer&apos;s diary fills up.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Lead With Research, Not Chasing</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Frame the call around the work you&apos;ve done for them &mdash; not the two missed calls. Position it as a courtesy heads-up, not a follow-up chase.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Always Send The Zoom Link</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Confirm their email is current and let them know the link will land just before the meeting &mdash; this removes any &ldquo;I didn&apos;t see it&rdquo; excuses.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-2xl mb-2">📅</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Never Walk Away Empty-Handed</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Whether confirmed, rescheduled, or pushed to a 6-month follow-up, always leave the call with a clear next step locked in.</p>
              </div>
            </div>

            <div className="mt-8 text-center pb-8">
              <p className="text-xs text-slate-400">NA x 2 Script &mdash; Day-Of Confirmation Call</p>
            </div>

          </div>
        </div>



</main>
    </>
  );
}


