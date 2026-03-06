"use client";

import PasswordGate from "@/components/PasswordGate";

import { useState, useRef } from "react";

const QUESTIONS = [
  {
    id: "name",
    type: "text",
    label: "First, what is your full name?",
    placeholder: "e.g. Jordan Smith",
    required: true,
  },
  {
    id: "workExperience",
    type: "multiselect",
    label: "What work experience have you had?",
    options: [
      "Hospitality / customer service",
      "Retail",
      "Administration / office work",
      "Marketing related work",
      "Internship / work placement",
      "I have not worked yet",
      "Other",
    ],
    hasOther: true,
  },
  {
    id: "longevity",
    type: "single",
    label: "What is the longest time you have remained in a single job or role?",
    options: [
      "Less than 6 months",
      "6–12 months",
      "1–2 years",
      "2–3 years",
      "3–5 years",
      "5+ years",
      "I have not worked in a job yet",
    ],
  },
  {
    id: "expectedStay",
    type: "single",
    label: "If successful, how long would you be planning to stay with our company?",
    options: [
      "3–6 months",
      "6–12 months",
      "1–2 years",
      "2–3 years",
      "3–5 years",
      "5+ years",
    ],
  },
  {
    id: "salaryExpectation",
    type: "single",
    label: "What starting annual salary are you expecting?",
    options: [
      "$40,000",
      "$50,000",
      "$60,000",
      "$70,000",
      "$80,000",
      "$90,000+",
    ],
  },
  {
    id: "salaryReview",
    type: "single",
    label: "How often would you expect your wage to be reviewed?",
    options: [
      "Every 3 months",
      "Every 6 months",
      "Every 12 months",
      "Every 18–24 months",
      "Only when performance milestones are achieved",
    ],
  },
  {
    id: "careerAspirations",
    type: "single",
    label: "Which of the following best describes your long-term career aspirations?",
    options: [
      "Build a long-term career in marketing or business",
      "Develop professional skills early in my career",
      "Gain experience before starting my own business",
      "Work in several industries before choosing a career",
      "I am still exploring career options",
    ],
  },
  {
    id: "careerPriorities",
    type: "ranking",
    label: "Which factors are most important to you in your career?",
    helper: "Drag to rank from most to least important.",
    options: [
      "Career progression",
      "Ongoing training and development",
      "Salary / financial growth",
      "Positive team culture",
      "Work-life balance",
    ],
  },
  {
    id: "motivation",
    type: "multiselect",
    label: "What primarily motivated you to apply for this role?",
    helper: "Select up to 2.",
    maxSelect: 2,
    options: [
      "Opportunity for career progression",
      "Learning digital marketing skills",
      "Salary and financial stability",
      "Work culture and team environment",
      "Entry-level career opportunity",
    ],
  },
  {
    id: "workEnvironment",
    type: "single",
    label: "What type of working environment do you perform best in?",
    options: [
      "Structured with clear systems and expectations",
      "Fast-paced and high-performance",
      "Collaborative team environment",
      "Independent and self-managed",
      "Goal-oriented with clear performance expectations",
    ],
  },
  {
    id: "workApproach",
    type: "single",
    label: "Which statement best describes your approach to work?",
    options: [
      "I prefer a steady and predictable workload",
      "I enjoy challenging environments where performance is measured",
      "I like to work hard and continuously improve my performance",
      "I prefer a balanced pace with clear expectations",
    ],
  },
  {
    id: "research",
    type: "single",
    label: "Before applying for this role, how much research did you do about Marketing Sweet or Quodo?",
    options: [
      "I read the job description only",
      "I briefly looked at the company website",
      "I explored the website and services",
      "I researched the company and industry in detail",
    ],
  },
  {
    id: "preparedToLearn",
    type: "single",
    label: "If we were to provide additional resources about our company, would you be prepared to learn more during the application process?",
    options: [
      "Yes absolutely",
      "Maybe — depends how much",
      "Not really — I\'ve done enough research",
    ],
  },
  {
    id: "successVision",
    type: "textarea",
    label: "Tell us why we should hire you, and where you see yourself in the next 1–2 years.",
    helper: "A few sentences is perfect.",
    placeholder: "Share your thoughts here...",
    required: true,
  },
];

type Answers = Record<string, string | string[]>;

function RankingQuestion({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const ranked = value.length === options.length ? value : [...options];

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOver.current = index;
    if (dragItem.current === null || dragItem.current === index) return;
    const newRanked = [...ranked];
    const item = newRanked.splice(dragItem.current, 1)[0];
    newRanked.splice(index, 0, item);
    dragItem.current = index;
    onChange(newRanked);
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const newRanked = [...ranked];
    const target = index + dir;
    if (target < 0 || target >= newRanked.length) return;
    [newRanked[index], newRanked[target]] = [newRanked[target], newRanked[index]];
    onChange(newRanked);
  };

  return (
    <div className="space-y-2 w-full">
      {ranked.map((item, index) => (
        <div
          key={item}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragOver={(e) => e.preventDefault()}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing select-none shadow-sm"
        >
          <span className="text-xs font-bold text-blue-500 w-5 text-center">{index + 1}</span>
          <span className="flex-1 text-sm text-gray-700">{item}</span>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => moveItem(index, -1)}
              disabled={index === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 leading-none"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, 1)}
              disabled={index === ranked.length - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 leading-none"
            >
              ▼
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionnaireContent() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [otherText, setOtherText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const question = QUESTIONS[current];
  const total = QUESTIONS.length;
  const answer = answers[question.id];
  const applicantName = (answers["name"] as string) || "";

  const isAnswered = () => {
    if (question.type === "text" || question.type === "textarea") {
      return typeof answer === "string" && answer.trim().length > 0;
    }
    if (question.type === "multiselect") {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (question.type === "single") {
      return typeof answer === "string" && answer.length > 0;
    }
    if (question.type === "ranking") {
      return Array.isArray(answer) && answer.length === question.options!.length;
    }
    return false;
  };

  const setAnswer = (val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [question.id]: val }));
  };

  const handleSingleSelect = (val: string) => {
    setAnswer(val);
    setTimeout(() => advance(), 300);
  };

  const handleMultiSelect = (val: string) => {
    const current_arr = Array.isArray(answer) ? [...answer] : [];
    const maxSelect = (question as { maxSelect?: number }).maxSelect;
    if (current_arr.includes(val)) {
      setAnswer(current_arr.filter((v) => v !== val));
    } else {
      if (maxSelect && current_arr.length >= maxSelect) return;
      setAnswer([...current_arr, val]);
    }
  };

  const advance = () => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    }
  };

  const back = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const finalAnswers = { ...answers };
    if (
      Array.isArray(finalAnswers.workExperience) &&
      finalAnswers.workExperience.includes("Other") &&
      otherText.trim()
    ) {
      finalAnswers.workExperience = finalAnswers.workExperience.map((v) =>
        v === "Other" ? `Other: ${otherText.trim()}` : v
      );
    }

    try {
      const res = await fetch("/api/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">
            Thanks, {applicantName.split(" ")[0]} — we&apos;ve received your responses.
          </h1>
          <p className="text-gray-500 text-sm">
            Our team will review them and be in touch regarding next steps.
          </p>
        </div>
      </main>
    );
  }

  const isLastQuestion = current === total - 1;
  const showOtherField =
    question.id === "workExperience" &&
    Array.isArray(answer) &&
    answer.includes("Other");

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Progress */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Question {current + 1} of {total}</span>
          <span>{Math.round(((current + 1) / total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{question.label}</h2>
        {(question as { helper?: string }).helper && (
          <p className="text-sm text-gray-400 mb-4">{(question as { helper?: string }).helper}</p>
        )}
        {!(question as { helper?: string }).helper && <div className="mb-4" />}

        {/* Text input */}
        {question.type === "text" && (
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={(question as { placeholder?: string }).placeholder}
            value={(answer as string) || ""}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isAnswered() && advance()}
            autoFocus
          />
        )}

        {/* Textarea */}
        {question.type === "textarea" && (
          <textarea
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder={(question as { placeholder?: string }).placeholder}
            value={(answer as string) || ""}
            onChange={(e) => setAnswer(e.target.value)}
          />
        )}

        {/* Single select */}
        {question.type === "single" && (
          <div className="space-y-2">
            {question.options!.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSingleSelect(opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                  answer === opt
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Multi select */}
        {question.type === "multiselect" && (
          <div className="space-y-2">
            {question.options!.map((opt) => {
              const selected = Array.isArray(answer) && answer.includes(opt);
              const maxSelect = (question as { maxSelect?: number }).maxSelect;
              const atMax = maxSelect && Array.isArray(answer) && answer.length >= maxSelect && !selected;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !atMax && handleMultiSelect(opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center gap-3 ${
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : atMax
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${selected ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300"}`}>
                    {selected && "✓"}
                  </span>
                  {opt}
                </button>
              );
            })}
            {showOtherField && (
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2"
                placeholder="Please specify..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Ranking */}
        {question.type === "ranking" && (
          <RankingQuestion
            options={question.options!}
            value={Array.isArray(answer) ? answer : []}
            onChange={(v) => setAnswer(v)}
          />
        )}

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={back}
            disabled={current === 0}
            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-0 transition-colors"
          >
            ← Back
          </button>

          {question.type !== "single" && (
            isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isAnswered() || submitting}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                type="button"
                onClick={advance}
                disabled={!isAnswered()}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            )
          )}

          {question.type === "single" && isLastQuestion && isAnswered() && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function QuestionnairePage() {
  return (
    <PasswordGate>
      <QuestionnaireContent />
    </PasswordGate>
  );
}
