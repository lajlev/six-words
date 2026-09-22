export type Family = "Happy" | "Surprise" | "Fear" | "Anger" | "Disgust" | "Sad";
export type Language = "en" | "da";

export interface WheelWord {
  word: string;
  /** Lowercase accepted forms of this word, including the base word itself. */
  forms: string[];
}

export interface WordEntry extends WheelWord {
  family: Family;
  language: Language;
}

export const FAMILIES: Family[] = ["Happy", "Surprise", "Fear", "Anger", "Disgust", "Sad"];
export const LANGUAGES: Language[] = ["en", "da"];

const FAMILY_COLOR: Record<Family, string> = {
  Happy: "var(--happy)",
  Surprise: "var(--surprise)",
  Fear: "var(--fear)",
  Anger: "var(--anger)",
  Disgust: "var(--disgust)",
  Sad: "var(--sad)"
};

// English wheel: the original 69 words. Danish wheel words below are original
// idiomatic Danish emotion vocabulary chosen per family/color -- not literal
// translations of these.
const WHEEL_EN: Record<Family, WheelWord[]> = {
  Happy: [
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
  ],
  Surprise: [
    { word: "Shocked", forms: ["shocked", "shock", "shocks", "shocking"] },
    { word: "Dismayed", forms: ["dismayed", "dismay", "dismays", "dismaying"] },
    { word: "Disillusioned", forms: ["disillusioned", "disillusion", "disillusions", "disillusioning", "disillusionment"] },
    { word: "Perplexed", forms: ["perplexed", "perplex", "perplexes", "perplexing"] },
    { word: "Astonished", forms: ["astonished", "astonish", "astonishes", "astonishing", "astonishment"] },
    { word: "Awe", forms: ["awe", "awed", "awesome", "awestruck"] },
    { word: "Eager", forms: ["eager", "eagerly", "eagerness"] },
    { word: "Energetic", forms: ["energetic", "energetically", "energy"] }
  ],
  Fear: [
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
  ],
  Anger: [
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
  ],
  Disgust: [
    { word: "Judgmental", forms: ["judgmental", "judgmentally", "judgemental", "judgementally"] },
    { word: "Appalled", forms: ["appalled", "appall", "appalls", "appalling"] },
    { word: "Revolted", forms: ["revolted", "revolt", "revolts", "revolting"] },
    { word: "Nauseated", forms: ["nauseated", "nauseate", "nauseates", "nauseating", "nauseous"] },
    { word: "Detestable", forms: ["detestable", "detest", "detests", "detesting", "detestably"] },
    { word: "Horrified", forms: ["horrified", "horrify", "horrifies", "horrifying", "horror"] },
    { word: "Hesitant", forms: ["hesitant", "hesitantly", "hesitate", "hesitates", "hesitation"] }
  ],
  Sad: [
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
};

const WHEEL_DA: Record<Family, WheelWord[]> = {
  Happy: [
    { word: "Glad", forms: ["glad", "gladt", "glade", "glæde"] },
    { word: "Lettet", forms: ["lettet", "lettede"] },
    { word: "Stolt", forms: ["stolt", "stolte", "stolthed"] },
    { word: "Forelsket", forms: ["forelsket", "forelskede"] },
    { word: "Taknemmelig", forms: ["taknemmelig", "taknemmeligt", "taknemmelige"] },
    { word: "Tilfreds", forms: ["tilfreds", "tilfredse", "tilfredshed"] },
    { word: "Opstemt", forms: ["opstemt", "opstemte"] },
    { word: "Henrykt", forms: ["henrykt", "henrykte"] },
    { word: "Nysgerrig", forms: ["nysgerrig", "nysgerrigt", "nysgerrige"] },
    { word: "Håbefuld", forms: ["håbefuld", "håbefuldt", "håbefulde"] },
    { word: "Legesyg", forms: ["legesyg", "legesygt", "legesyge"] },
    { word: "Inspireret", forms: ["inspireret", "inspirerede"] },
    { word: "Rørt", forms: ["rørt", "rørte"] },
    { word: "Betaget", forms: ["betaget", "betagede"] },
    { word: "Fri", forms: ["fri", "frit", "frie", "frihed"] },
    { word: "Elsket", forms: ["elsket", "elskede"] }
  ],
  Surprise: [
    { word: "Chokeret", forms: ["chokeret", "chokerede"] },
    { word: "Målløs", forms: ["målløs", "målløst", "målløse"] },
    { word: "Desillusioneret", forms: ["desillusioneret", "desillusionerede"] },
    { word: "Forvirret", forms: ["forvirret", "forvirrede"] },
    { word: "Ærefrygt", forms: ["ærefrygt"] },
    { word: "Ivrig", forms: ["ivrig", "ivrigt", "ivrige"] },
    { word: "Energisk", forms: ["energisk", "energiske"] },
    { word: "Paf", forms: ["paf"] }
  ],
  Fear: [
    { word: "Latterliggjort", forms: ["latterliggjort", "latterliggjorte"] },
    { word: "Nedgjort", forms: ["nedgjort", "nedgjorte"] },
    { word: "Fremmedgjort", forms: ["fremmedgjort", "fremmedgjorte"] },
    { word: "Utilstrækkelig", forms: ["utilstrækkelig", "utilstrækkeligt", "utilstrækkelige"] },
    { word: "Ubetydelig", forms: ["ubetydelig", "ubetydeligt", "ubetydelige"] },
    { word: "Værdiløs", forms: ["værdiløs", "værdiløst", "værdiløse"] },
    { word: "Underlegen", forms: ["underlegen", "underlegent", "underlegne"] },
    { word: "Bekymret", forms: ["bekymret", "bekymrede"] },
    { word: "Overvældet", forms: ["overvældet", "overvældede"] },
    { word: "Bange", forms: ["bange"] },
    { word: "Rædselsslagen", forms: ["rædselsslagen", "rædselsslagent", "rædselsslagne"] }
  ],
  Anger: [
    { word: "Flov", forms: ["flov", "flovt", "flove"] },
    { word: "Knust", forms: ["knust", "knuste"] },
    { word: "Usikker", forms: ["usikker", "usikkert", "usikre"] },
    { word: "Skinsyg", forms: ["skinsyg", "skinsygt", "skinsyge"] },
    { word: "Bitter", forms: ["bitter", "bittert", "bitre"] },
    { word: "Krænket", forms: ["krænket", "krænkede"] },
    { word: "Rasende", forms: ["rasende"] },
    { word: "Ophidset", forms: ["ophidset", "ophidsede"] },
    { word: "Provokeret", forms: ["provokeret", "provokerede"] },
    { word: "Fjendtlig", forms: ["fjendtlig", "fjendtligt", "fjendtlige"] },
    { word: "Oprevet", forms: ["oprevet", "oprevne"] },
    { word: "Irriteret", forms: ["irriteret", "irriterede"] },
    { word: "Tilbagetrukket", forms: ["tilbagetrukket", "tilbagetrukne"] },
    { word: "Mistænksom", forms: ["mistænksom", "mistænksomt", "mistænksomme"] },
    { word: "Skeptisk", forms: ["skeptisk", "skeptiske"] },
    { word: "Sarkastisk", forms: ["sarkastisk", "sarkastiske"] }
  ],
  Disgust: [
    { word: "Dømmende", forms: ["dømmende"] },
    { word: "Forfærdet", forms: ["forfærdet", "forfærdede"] },
    { word: "Frastødt", forms: ["frastødt", "frastødte"] },
    { word: "Kvalm", forms: ["kvalm", "kvalmt", "kvalme"] },
    { word: "Afskyelig", forms: ["afskyelig", "afskyeligt", "afskyelige"] },
    { word: "Rystet", forms: ["rystet", "rystede"] },
    { word: "Tøvende", forms: ["tøvende"] }
  ],
  Sad: [
    { word: "Angerfuld", forms: ["angerfuld", "angerfuldt", "angerfulde"] },
    { word: "Skamfuld", forms: ["skamfuld", "skamfuldt", "skamfulde"] },
    { word: "Overset", forms: ["overset", "oversete"] },
    { word: "Udnyttet", forms: ["udnyttet", "udnyttede"] },
    { word: "Magtesløs", forms: ["magtesløs", "magtesløst", "magtesløse"] },
    { word: "Sårbar", forms: ["sårbar", "sårbart", "sårbare"] },
    { word: "Tom", forms: ["tom", "tomt", "tomme"] },
    { word: "Isoleret", forms: ["isoleret", "isolerede"] },
    { word: "Forladt", forms: ["forladt", "forladte"] },
    { word: "Apatisk", forms: ["apatisk", "apatiske"] },
    { word: "Ligegyldig", forms: ["ligegyldig", "ligegyldigt", "ligegyldige"] }
  ]
};

const WHEELS: Record<Language, Record<Family, WheelWord[]>> = { en: WHEEL_EN, da: WHEEL_DA };

export function familyColor(family: Family): string {
  return FAMILY_COLOR[family];
}

/** Flat list of every word on one language's wheel. */
export function allWords(language: Language): WordEntry[] {
  return FAMILIES.flatMap((family) =>
    WHEELS[language][family].map((w) => ({ ...w, family, language }))
  );
}

export function findWord(word: string, language: Language): WordEntry | undefined {
  const needle = word.trim().toLowerCase();
  return allWords(language).find((w) => w.word.toLowerCase() === needle);
}

export function randomWord(language: Language, exclude?: string): { word: string; family: Family } {
  const words = allWords(language);
  if (words.length <= 1) return words[0];
  let pick = words[Math.floor(Math.random() * words.length)];
  while (exclude && pick.word.toLowerCase() === exclude.toLowerCase()) {
    pick = words[Math.floor(Math.random() * words.length)];
  }
  return { word: pick.word, family: pick.family };
}

/** Returns a freshly shuffled copy of one language's wheel words, for the composer's word picker. */
export function shuffledWords(language: Language): { word: string; family: Family }[] {
  const copy = allWords(language).map((w) => ({ word: w.word, family: w.family }));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
