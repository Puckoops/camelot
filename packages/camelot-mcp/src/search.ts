import type { ComponentEntry } from "./catalog-types.js";

export interface SearchHit {
  entry: ComponentEntry;
  score: number;
  matched: string[];
}

const STOP_WORDS = new Set(
  "a an and any are as be can component components do for from how i in is it me my need of on or show some something that the this to ui use want what when which with".split(" "),
);

const words = (text: string) =>
  text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const stem = (word: string) => (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word);

const stems = (texts: string[]) => new Set(texts.flatMap(words).map(stem));

const hasPrefix = (set: Set<string>, term: string) => term.length >= 4 && [...set].some((w) => w.startsWith(term));

function score(entry: ComponentEntry, phrase: string, terms: string[]): SearchHit {
  const matched = new Set<string>();
  let total = 0;
  const shortName = entry.name.split("/").pop() ?? entry.name;
  const names = [entry.name, shortName, ...entry.exports].map((n) => n.toLowerCase());
  const squashed = phrase.replace(/[\s_-]+/g, "");
  if (names.some((n) => n === phrase || n === squashed)) {
    total += 100;
    matched.add("name");
  } else if (squashed.length >= 3 && names.some((n) => n.startsWith(squashed))) {
    total += 40;
    matched.add("name");
  } else if (squashed.length >= 3 && names.some((n) => n.includes(squashed))) {
    total += 25;
    matched.add("name");
  }

  const keywords = entry.keywords.map((k) => k.toLowerCase());
  if (keywords.includes(phrase)) {
    total += 30;
    matched.add("keywords");
  } else if (phrase.length >= 3 && keywords.some((k) => k.includes(phrase))) {
    total += 12;
    matched.add("keywords");
  }
  if (phrase.includes(" ")) {
    if (entry.summary.toLowerCase().includes(phrase)) {
      total += 8;
      matched.add("summary");
    }
    if (entry.whenToUse.toLowerCase().includes(phrase)) {
      total += 3;
      matched.add("when to use");
    }
  }

  const nameWords = stems([entry.name, shortName, ...entry.exports]);
  const keywordWords = stems(entry.keywords);
  const summaryWords = stems([entry.summary]);
  const whenWords = stems([entry.whenToUse]);
  const categoryWords = stems([entry.category]);
  let covered = 0;
  for (const term of terms) {
    let hit = false;
    if (nameWords.has(term)) {
      total += 14;
      hit = true;
      matched.add("name");
    } else if (hasPrefix(nameWords, term)) {
      total += 7;
      hit = true;
      matched.add("name");
    }
    if (keywordWords.has(term)) {
      total += 9;
      hit = true;
      matched.add("keywords");
    } else if (hasPrefix(keywordWords, term)) {
      total += 4;
      hit = true;
      matched.add("keywords");
    }
    if (summaryWords.has(term)) {
      total += 4;
      hit = true;
      matched.add("summary");
    }
    if (whenWords.has(term)) {
      total += 1.5;
      hit = true;
      matched.add("when to use");
    }
    if (categoryWords.has(term)) {
      total += 3;
      hit = true;
      matched.add("category");
    }
    if (hit) covered++;
  }
  if (terms.length > 1 && covered) total += (covered / terms.length) * 10;
  return { entry, score: Math.round(total * 10) / 10, matched: [...matched] };
}

export function searchComponents(entries: ComponentEntry[], query: string, limit = 8): SearchHit[] {
  const phrase = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!phrase) return [];
  const terms = [...new Set(words(query).filter((w) => !STOP_WORDS.has(w)).map(stem))];
  return entries
    .map((entry) => score(entry, phrase, terms))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit);
}
