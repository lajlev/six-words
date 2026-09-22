export type Family = "Happy" | "Surprise" | "Fear" | "Anger" | "Disgust" | "Sad";

export interface WheelWord {
  word: string;
  /** Lowercase accepted forms of this word, including the base word itself. */
  forms: string[];
}

export interface WheelFamily {
  color: string;
  words: WheelWord[];
}

export const WHEEL: Record<Family, WheelFamily> = {
  Happy: {
    color: "var(--happy)",
    words: [
      { word: "Liberated", forms: ["liberated", "liberate", "liberates", "liberating", "liberation"] },
      { word: "Ecstatic", forms: ["ecstatic", "ecstatically", "ecstasy"] },
      { word: "Amused", forms: ["amused", "amuse", "amuses", "amusing", "amusement"] },
      { word: "Inquisitive", forms: ["inquisitive", "inquisitively", "inquisitiveness"] },
      { word: "Important", forms: ["important", "importantly", "importance"] },
      { word: "Confident", forms: ["confident", "confidently", "confidence"] },
      { word: "Respected", forms: ["respected", "respect", "respects", "respecting", "respectful"] },
      { word: "Fulfilled", forms: ["fulfilled", "fulfill", "fulfills", "fulfil", "fulfils", "fulfilling", "fulfillment", "fulfilment"] },
      { word: "Courageous", forms: ["courageous", "courageously", "courage"] },
      { word: "Provocative", forms: ["provocative", "provocatively"] },
      { word: "Loving", forms: ["loving", "love", "loves", "loved", "lovingly"] },
      { word: "Hopeful", forms: ["hopeful", "hopefully", "hope", "hopes", "hoping"] },
      { word: "Playful", forms: ["playful", "playfully", "playfulness"] },
      { word: "Sensitive", forms: ["sensitive", "sensitively", "sensitivity"] },
      { word: "Inspired", forms: ["inspired", "inspire", "inspires", "inspiring", "inspiration"] },
      { word: "Open", forms: ["open", "opens", "opened", "opening", "openly"] }
    ]
  },
  Surprise: {
    color: "var(--surprise)",
    words: [
      { word: "Shocked", forms: ["shocked", "shock", "shocks", "shocking"] },
      { word: "Dismayed", forms: ["dismayed", "dismay", "dismays", "dismaying"] },
      { word: "Disillusioned", forms: ["disillusioned", "disillusion", "disillusions", "disillusioning", "disillusionment"] },
      { word: "Perplexed", forms: ["perplexed", "perplex", "perplexes", "perplexing"] },
      { word: "Astonished", forms: ["astonished", "astonish", "astonishes", "astonishing", "astonishment"] },
      { word: "Awe", forms: ["awe", "awed", "awesome", "awestruck"] },
      { word: "Eager", forms: ["eager", "eagerly", "eagerness"] },
      { word: "Energetic", forms: ["energetic", "energetically", "energy"] }
    ]
  },
  Fear: {
    color: "var(--fear)",
    words: [
      { word: "Ridiculed", forms: ["ridiculed", "ridicule", "ridicules", "ridiculing", "ridiculous"] },
      { word: "Disrespected", forms: ["disrespected", "disrespect", "disrespects", "disrespecting", "disrespectful"] },
      { word: "Alienated", forms: ["alienated", "alienate", "alienates", "alienating", "alienation"] },
      { word: "Inadequate", forms: ["inadequate", "inadequately", "inadequacy"] },
      { word: "Insignificant", forms: ["insignificant", "insignificantly", "insignificance"] },
      { word: "Worthless", forms: ["worthless", "worthlessly", "worthlessness"] },
      { word: "Inferior", forms: ["inferior", "inferiorly", "inferiority"] },
      { word: "Worried", forms: ["worried", "worry", "worries", "worrying"] },
      { word: "Overwhelmed", forms: ["overwhelmed", "overwhelm", "overwhelms", "overwhelming"] },
      { word: "Frightened", forms: ["frightened", "frighten", "frightens", "frightening"] },
      { word: "Terrified", forms: ["terrified", "terrify", "terrifies", "terrifying"] }
    ]
  },
  Anger: {
    color: "var(--anger)",
    words: [
      { word: "Embarrassed", forms: ["embarrassed", "embarrass", "embarrasses", "embarrassing", "embarrassment"] },
      { word: "Devastated", forms: ["devastated", "devastate", "devastates", "devastating"] },
      { word: "Insecure", forms: ["insecure", "insecurely", "insecurity"] },
      { word: "Jealous", forms: ["jealous", "jealously", "jealousy"] },
      { word: "Resentful", forms: ["resentful", "resentfully", "resent", "resents", "resentment"] },
      { word: "Violated", forms: ["violated", "violate", "violates", "violating", "violation"] },
      { word: "Furious", forms: ["furious", "furiously", "fury"] },
      { word: "Enraged", forms: ["enraged", "enrage", "enrages", "enraging"] },
      { word: "Provoked", forms: ["provoked", "provoke", "provokes", "provoking", "provocation"] },
      { word: "Hostile", forms: ["hostile", "hostilely", "hostility"] },
      { word: "Infuriated", forms: ["infuriated", "infuriate", "infuriates", "infuriating"] },
      { word: "Irritated", forms: ["irritated", "irritate", "irritates", "irritating", "irritation"] },
      { word: "Withdrawn", forms: ["withdrawn", "withdraw", "withdraws", "withdrew", "withdrawing"] },
      { word: "Suspicious", forms: ["suspicious", "suspiciously", "suspicion"] },
      { word: "Skeptical", forms: ["skeptical", "skeptically", "skepticism", "sceptical", "sceptically", "scepticism"] },
      { word: "Sarcastic", forms: ["sarcastic", "sarcastically", "sarcasm"] }
    ]
  },
  Disgust: {
    color: "var(--disgust)",
    words: [
      { word: "Judgmental", forms: ["judgmental", "judgmentally", "judgemental", "judgementally"] },
      { word: "Appalled", forms: ["appalled", "appall", "appalls", "appalling"] },
      { word: "Revolted", forms: ["revolted", "revolt", "revolts", "revolting"] },
      { word: "Nauseated", forms: ["nauseated", "nauseate", "nauseates", "nauseating", "nauseous"] },
      { word: "Detestable", forms: ["detestable", "detest", "detests", "detesting", "detestably"] },
      { word: "Horrified", forms: ["horrified", "horrify", "horrifies", "horrifying", "horror"] },
      { word: "Hesitant", forms: ["hesitant", "hesitantly", "hesitate", "hesitates", "hesitation"] }
    ]
  },
  Sad: {
    color: "var(--sad)",
    words: [
      { word: "Remorseful", forms: ["remorseful", "remorsefully", "remorse"] },
      { word: "Ashamed", forms: ["ashamed", "shame", "shames", "shamed", "shameful"] },
      { word: "Ignored", forms: ["ignored", "ignore", "ignores", "ignoring"] },
      { word: "Victimized", forms: ["victimized", "victimize", "victimizes", "victimizing", "victimised", "victimising", "victim"] },
      { word: "Powerless", forms: ["powerless", "powerlessly", "powerlessness"] },
      { word: "Vulnerable", forms: ["vulnerable", "vulnerably", "vulnerability"] },
      { word: "Empty", forms: ["empty", "empties", "emptied", "emptying", "emptiness"] },
      { word: "Isolated", forms: ["isolated", "isolate", "isolates", "isolating", "isolation"] },
      { word: "Abandoned", forms: ["abandoned", "abandon", "abandons", "abandoning", "abandonment"] },
      { word: "Apathetic", forms: ["apathetic", "apathetically", "apathy"] },
      { word: "Indifferent", forms: ["indifferent", "indifferently", "indifference"] }
    ]
  }
};

export const FAMILIES = Object.keys(WHEEL) as Family[];

export const ALL_WORDS: { word: string; family: Family; forms: string[] }[] = FAMILIES.flatMap((family) =>
  WHEEL[family].words.map((w) => ({ word: w.word, family, forms: w.forms }))
);

export function familyColor(family: Family): string {
  return WHEEL[family].color;
}

export function findWord(word: string): { word: string; family: Family; forms: string[] } | undefined {
  const needle = word.trim().toLowerCase();
  return ALL_WORDS.find((w) => w.word.toLowerCase() === needle);
}

export function randomWord(exclude?: string): { word: string; family: Family } {
  if (ALL_WORDS.length <= 1) return ALL_WORDS[0];
  let pick = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
  while (exclude && pick.word.toLowerCase() === exclude.toLowerCase()) {
    pick = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
  }
  return { word: pick.word, family: pick.family };
}

/** Returns a freshly shuffled copy of every wheel word, for the composer's word picker. */
export function shuffledWords(): { word: string; family: Family }[] {
  const copy = ALL_WORDS.map((w) => ({ word: w.word, family: w.family }));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
