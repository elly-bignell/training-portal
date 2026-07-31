// Quick smoke test for the quiz parser. Run with:
//   node scripts/test-quiz-parser.mjs "path/to/quiz.docx"
//
// Uses ts-node dynamic import via tsx would be nicer, but for a smoke
// test we do the parse directly here to avoid pulling in a TS toolchain.

import mammoth from "mammoth";
import fs from "node:fs/promises";

const path = process.argv[2];
if (!path) {
  console.error("Usage: node scripts/test-quiz-parser.mjs <path-to-quiz-docx>");
  process.exit(1);
}

const buffer = await fs.readFile(path);
const { value: rawText } = await mammoth.extractRawText({ buffer });

const lines = rawText
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

const answerKeyIdx = lines.findIndex((l) => /^answer\s*key/i.test(l));
if (answerKeyIdx === -1) {
  console.error("FAIL: no 'answer key' section found");
  process.exit(1);
}

const questionLines = lines.slice(0, answerKeyIdx);
const answerLines = lines.slice(answerKeyIdx + 1);

let questions = [];
let current = null;
for (const line of questionLines) {
  const qMatch = line.match(/^Q(\d+)\.\s*(.*)$/);
  if (qMatch) {
    if (current) questions.push(current);
    current = {
      num: parseInt(qMatch[1], 10),
      prompt: qMatch[2].trim(),
      options: [],
    };
    continue;
  }
  const optMatch = line.match(/^([A-D])\.\s*(.*)$/);
  if (optMatch && current) {
    const idx = optMatch[1].charCodeAt(0) - "A".charCodeAt(0);
    current.options[idx] = optMatch[2].trim();
    continue;
  }
  if (current) {
    if (current.options.length > 0) {
      for (let i = current.options.length - 1; i >= 0; i--) {
        if (current.options[i]) {
          current.options[i] = `${current.options[i]} ${line}`;
          break;
        }
      }
    } else {
      current.prompt = current.prompt ? `${current.prompt} ${line}` : line;
    }
  }
}
if (current) questions.push(current);

let answers = [];
let currentAnswer = null;
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
  if (currentAnswer) {
    currentAnswer.rationale = currentAnswer.rationale
      ? `${currentAnswer.rationale} ${line}`
      : line;
  }
}
if (currentAnswer) answers.push(currentAnswer);

console.log(`Parsed ${questions.length} questions, ${answers.length} answers`);
console.log();
for (const q of questions) {
  const a = answers.find((x) => x.num === q.num);
  console.log(`Q${q.num}. ${q.prompt}`);
  q.options.forEach((opt, i) => {
    const letter = String.fromCharCode("A".charCodeAt(0) + i);
    const marker = a && a.letter === letter ? "★" : " ";
    console.log(`  ${marker} ${letter}. ${opt}`);
  });
  if (a) {
    console.log(`     Answer: ${a.letter}`);
    console.log(`     Rationale: ${a.rationale.slice(0, 100)}...`);
  } else {
    console.log("     ⚠ NO ANSWER FOUND");
  }
  console.log();
}
