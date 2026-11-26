/**
 * future-self-text — entry for the make.fun bounty
 * "Texts From Your Future Self" (u-motasimfuad-texts-from-your-future-self-dd44595e)
 *
 * The program writes one original text message from the user's future self
 * to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt when set).
 *
 * Deterministic by design: no network, no randomness, no time input —
 * the message is a single fixed constant, so every run produces the exact
 * same bytes.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry itself: one text from your future self, 1–200 characters
// (punctuation included, newlines excluded). A concrete habit, a specific
// detail, and a twist — no setup, no context needed.
const MESSAGE =
  "Hey, it's you from 2036. You'll own 47 phone cases and still crack the screen on the same desk corner every morning. Also, the plant on your windowsill somehow survived. Don't ask how.";

// Bounty rules, grouped as one config object so the limits live in a
// single place: the message must be 1–200 characters long, non-blank,
// and contain no newline characters.
const MESSAGE_RULES = {
  minLength: 1,
  maxLength: 200,
} as const;

// Each rule is its own check so a failing run names the exact rule that
// was violated instead of a generic "invalid message".
function checkLength(message: string): void {
  const { minLength, maxLength } = MESSAGE_RULES;
  if (message.length < minLength || message.length > maxLength) {
    throw new Error(
      `Message must be ${minLength}–${maxLength} characters, got ${message.length}.`,
    );
  }
}

function checkNotBlank(message: string): void {
  if (message.trim().length === 0) {
    throw new Error("Message must not be blank.");
  }
}

function checkNoLineBreaks(message: string): void {
  if (message.includes("\n") || message.includes("\r")) {
    throw new Error("Message must not contain line breaks.");
  }
}

function validateMessage(message: string): void {
  for (const check of [checkLength, checkNotBlank, checkNoLineBreaks]) {
    check(message);
  }
}

// Writes the validated message as a single line plus one trailing
// newline, creating the output directory if needed. Returns the path
// written so the caller can report it.
function writeEntry(message: string, outputDir: string): string {
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, "entry.txt");
  writeFileSync(outputPath, `${message}\n`, "utf8");
  return outputPath;
}

function main(): void {
  validateMessage(MESSAGE);

  // The kit sets MAKEFUN_OUTPUT_DIR; fall back to /output otherwise.
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outputPath = writeEntry(MESSAGE, outputDir);

  console.log(`Wrote ${MESSAGE.length}-character message to ${outputPath}`);
}

main();
