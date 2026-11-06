export interface MessagePoint {
  /** The part before a colon, such as "Delivery" in "Delivery: 5 days". */
  label?: string;
  text: string;
}

export interface MessageGroup {
  heading?: string;
  points: MessagePoint[];
}

const BULLET = /^(?:[-•*–—]\s+|\d{1,2}[.)]\s+)/;
const SENTENCE_END = /(?<=[.!?।])\s+(?=["“'(]?[A-Z0-9ऀ-ॿ])/;
const ABBREVIATION = /(?:^|\s)(?:e\.g\.|i\.e\.|etc\.|vs\.|dr\.|mr\.|mrs\.|ms\.|no\.|approx\.)$/i;
const MAX_LABEL_LENGTH = 40;
const MAX_LABEL_WORDS = 5;

function stripQuotes(text: string) {
  return text.replace(/^["“](.*)["”]$/, "$1").trim();
}

/** Finds the colon that separates a label from its value, ignoring any inside brackets. */
function splitLabel(line: string): MessagePoint {
  let depth = 0;
  for (let index = 0; index < line.length - 1; index++) {
    const char = line[index];
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === ":" && depth === 0 && line[index + 1] === " ") {
      const label = line.slice(0, index).trim();
      const value = line.slice(index + 2).trim();
      const isLabel = label.length >= 2 && label.length <= MAX_LABEL_LENGTH && label.split(/\s+/).length <= MAX_LABEL_WORDS;
      return isLabel && value ? { label, text: stripQuotes(value) } : { text: stripQuotes(line) };
    }
  }
  return { text: stripQuotes(line) };
}

function splitSentences(text: string) {
  const sentences: string[] = [];
  for (const part of text.split(SENTENCE_END)) {
    const previous = sentences[sentences.length - 1];
    if (previous && ABBREVIATION.test(previous)) {
      sentences[sentences.length - 1] = `${previous} ${part}`;
    } else {
      sentences.push(part);
    }
  }
  return sentences.map((sentence) => sentence.trim()).filter(Boolean);
}

/**
 * Turns a client's free-text message into points that are quick to scan. Existing bullets and
 * "Label: value" lines are kept, and a plain paragraph becomes one point per sentence.
 */
export function parseClientMessage(message: string | null | undefined): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let current: MessageGroup = { points: [] };

  for (const rawLine of (message ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      // A blank line ends a headed section, so later text isn't listed as part of it.
      if (current.heading && current.points.length > 0) {
        groups.push(current);
        current = { points: [] };
      }
      continue;
    }

    const isBullet = BULLET.test(line);
    const content = line.replace(BULLET, "").trim();
    if (!content) continue;

    if (!isBullet && content.endsWith(":")) {
      if (current.heading || current.points.length > 0) groups.push(current);
      current = { heading: content.slice(0, -1).trim(), points: [] };
      continue;
    }

    const point = splitLabel(content);
    if (isBullet || point.label) {
      current.points.push(point);
    } else {
      splitSentences(point.text).forEach((text) => current.points.push({ text }));
    }
  }

  if (current.heading || current.points.length > 0) groups.push(current);
  return groups;
}

const BUDGET_LABELS: Record<string, string> = {
  under_5k: "Under ₹15,000",
  "5k_10k": "₹15,000 – ₹30,000",
  "10k_25k": "₹30,000 – ₹60,000",
  "25k_plus": "Above ₹60,000",
};

/** The pricing page sends budget ranges as short codes, which mean nothing to a reader. */
export function formatBudget(budget: string | null | undefined) {
  if (!budget) return null;
  return BUDGET_LABELS[budget] ?? budget;
}
