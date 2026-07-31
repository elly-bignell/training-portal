// lib/parse-quiz-docx.ts
//
// Parses a Corie-format quiz docx into the structured QuizAsset shape the
// portal renders. Used by /api/admin/sessions (form submit) to turn an
// uploaded quiz.docx into the JSON stored in Airtable Sessions.QuizJSON.
//
// Expected format (this matches every quiz Corie's team has produced):
//
//   Sales Training Quiz — Session NN         ← header block (ignored)
//   [Session title]                          ← header block (ignored)
//   8 questions  ·  ~9 minutes  ·  ...       ← header block (ignored)
//   HOW THIS WORKS ...                       ← header block (ignored)
//
//   Q1.  [prompt]
//   A.  [option A]
//   B.  [option B]
//   C.  [option C]
//   D.  [option D]
//   Q2.  ...
//   ...
//
//   Answer key & coaching notes              ← divider (ignored)
//   Q1.  Answer: [letter]
//   [rationale paragraph]
//   Q2.  Answer: [letter]
//   [rationale paragraph]
//   ...
//
// The parser is deliberately strict about the shape it expects. When it
// can't find a Q1., an A./B./C./D., or an Answer: line, it throws a clear
// error that surfaces on the form UI so the colleague knows to check the
// source file (or check with Corie's team).

import mammoth from "mammoth";
import type { MultipleChoiceQuestion, QuizAsset } from "@/types/sessions";

export interface ParsedQuiz {
  /** The 8-question quiz ready to be embedded in a Session as an asset. */
  quiz: QuizAsset;
  /** Warnings surfaced to the colleague (non-fatal). */
  warnings: string[];
}

/** Parse a quiz.docx buffer into a structured QuizAsset. Throws on
 *  unrecoverable parse errors (missing Q1, missing options, missing
 *  Answer Key section). */
export async function parseQuizDocx(
  buffer: Buffer,
  sessionSlug: string
): Promise<ParsedQuiz> {
  const warnings: string[] = [];

  // mammoth returns raw text with paragraphs separated by \n. Runs of
  // whitespace inside a paragraph are collapsed by mammoth already.
  const { value: rawText } = await mammoth.extractRawText({ buffer });
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // ─── Split into "questions" and "answer key" halves ──────────────────
  const answerKeyIdx = lines.findIndex((l) =>
    /^answer\s*key/i.test(l)
  );
  if (answerKeyIdx === -1) {
    throw new Error(
      "Couldn't find the 'Answer key & coaching notes' section in the quiz docx. Check the file structure with Corie's team."
    );
  }
  const questionLines = lines.slice(0, answerKeyIdx);
  const answerLines = lines.slice(answerKeyIdx + 1);

  // ─── Parse questions ─────────────────────────────────────────────────
  // A question is: `Q1. [prompt]` followed by four lines starting with
  // `A. `, `B. `, `C. `, `D. `. The prompt may span multiple lines (rare
  // but possible) — we accumulate lines after Q1. until the first `A. `.
  interface RawQuestion {
    num: number;
    prompt: string;
    options: string[];
  }
  const questions: RawQuestion[] = [];
  let current: RawQuestion | null = null;
  let optionsFor: RawQuestion | null = null;

  for (const line of questionLines) {
    const qMatch = line.match(/^Q(\d+)\.\s*(.*)$/);
    if (qMatch) {
      // Save the previous question if we have one
      if (current) {
        if (current.options.length !== 4) {
          throw new Error(
            `Question Q${current.num} has ${current.options.length} options — expected exactly 4 (A/B/C/D).`
          );
        }
        questions.push(current);
      }
      current = {
        num: parseInt(qMatch[1], 10),
        prompt: qMatch[2].trim(),
        options: [],
      };
      optionsFor = current;
      continue;
    }

    const optMatch = line.match(/^([A-D])\.\s*(.*)$/);
    if (optMatch && optionsFor) {
      // The letter tells us which option index this is. We expect them in
      // A/B/C/D order, but we position by letter regardless.
      const idx = optMatch[1].charCodeAt(0) - "A".charCodeAt(0);
      optionsFor.options[idx] = optMatch[2].trim();
      continue;
    }

    // Continuation line — attach to whichever open field we last touched.
    // If we haven't hit an A. yet, this is prompt continuation. Otherwise
    // it's option continuation on the last-added option.
    if (current) {
      if (optionsFor && optionsFor.options.length > 0) {
        // Extend the last non-empty option
        for (let i = optionsFor.options.length - 1; i >= 0; i--) {
          if (optionsFor.options[i]) {
            optionsFor.options[i] = `${optionsFor.options[i]} ${line}`;
            break;
          }
        }
      } else {
        // Extend the prompt
        current.prompt = current.prompt
          ? `${current.prompt} ${line}`
          : line;
      }
    }
  }
  // Flush the last question
  if (current) {
    if (current.options.length !== 4) {
      throw new Error(
        `Question Q${current.num} has ${current.options.length} options — expected exactly 4 (A/B/C/D).`
      );
    }
    questions.push(current);
  }

  if (questions.length === 0) {
    throw new Error(
      "No questions found in the quiz docx. Expected lines like 'Q1. What is...'."
    );
  }

  // ─── Parse answer key ────────────────────────────────────────────────
  // Format:
  //   Q1.  Answer: B
  //   [rationale paragraph — may span multiple lines]
  //   Q2.  Answer: D
  //   ...
  interface RawAnswer {
    num: number;
    letter: string;
    rationale: string;
  }
  const answers: RawAnswer[] = [];
  let currentAnswer: RawAnswer | null = null;
  for (const line of answerLines) {
    const aMatch = line.match(/^Q(\d+)\.\s*Answer:\s*([A-D])\.?\s*$/i);
    if (aMatch) {
      if (currentAnswer) answers.push(currentAnswer);
      currentAnswer = {
        num: parseInt(aMatch[1], 10),
        letter: aMatch[2].toUpperCase(),
        rationale: "",
      };
      continue;
    }
    // A "Q1. Answer: B [rationale on same line]" variant, just in case
    const aInlineMatch = line.match(/^Q(\d+)\.\s*Answer:\s*([A-D])\.?\s+(.+)$/i);
    if (aInlineMatch) {
      if (currentAnswer) answers.push(currentAnswer);
      currentAnswer = {
        num: parseInt(aInlineMatch[1], 10),
        letter: aInlineMatch[2].toUpperCase(),
        rationale: aInlineMatch[3].trim(),
      };
      continue;
    }
    // Continuation of the current rationale
    if (currentAnswer) {
      currentAnswer.rationale = currentAnswer.rationale
        ? `${currentAnswer.rationale} ${line}`
        : line;
    }
  }
  if (currentAnswer) answers.push(currentAnswer);

  if (answers.length === 0) {
    throw new Error(
      "No answer entries found in the Answer Key section. Expected lines like 'Q1. Answer: B'."
    );
  }

  // ─── Cross-reference questions with answers ─────────────────────────
  const answerByNum: Record<number, RawAnswer> = {};
  for (const a of answers) answerByNum[a.num] = a;

  const mcQuestions: MultipleChoiceQuestion[] = [];
  for (const q of questions) {
    const a = answerByNum[q.num];
    if (!a) {
      warnings.push(
        `Question Q${q.num} has no matching entry in the Answer Key — skipping.`
      );
      continue;
    }
    const correctIndex = a.letter.charCodeAt(0) - "A".charCodeAt(0);
    if (correctIndex < 0 || correctIndex > 3) {
      warnings.push(
        `Q${q.num} answer '${a.letter}' isn't A/B/C/D — skipping.`
      );
      continue;
    }
    // Derive a short topic from the prompt (first ~5 words). Not perfect,
    // but keeps the "you missed two on X" feedback informative without
    // asking the colleague to fill in a Topic field manually.
    const topic = deriveTopic(q.prompt);

    mcQuestions.push({
      id: `${sessionSlug}-q${q.num}`,
      type: "multiple-choice",
      prompt: q.prompt,
      topic,
      options: q.options,
      correctAnswer: correctIndex,
      rationale: a.rationale,
    });
  }

  if (mcQuestions.length !== questions.length) {
    warnings.push(
      `${mcQuestions.length} of ${questions.length} questions matched successfully. Check the Answer Key section covers every question.`
    );
  }

  return {
    quiz: {
      kind: "quiz",
      estimate: `${mcQuestions.length} questions · ~${Math.max(
        5,
        mcQuestions.length + 1
      )} min`,
      passMark: 100,
      questions: mcQuestions,
    },
    warnings,
  };
}

/** Derives a short topic tag from a question prompt. Not shown to reps
 *  unless they fail the quiz — used only in the "you missed two on X"
 *  post-quiz feedback. Colleague can override in Airtable if desired. */
function deriveTopic(prompt: string): string {
  // Look for keywords in quotes ("...")  — often the topic
  const quoted = prompt.match(/"([^"]+)"/);
  if (quoted && quoted[1].length <= 40) return quoted[1];
  // Otherwise take the first 4-5 words, trimmed
  const words = prompt.replace(/[?"']/g, "").split(/\s+/).slice(0, 5);
  return words.join(" ");
}
