// scripts/seed.ts writes as the system account (authorId "sixwords-system")
// and generated commenter accounts ("seed-<name>", from SEED_NAMES). A large
// seed import posts far more than the normal per-user rate limit in a burst,
// so these known seed identities are exempt from rate limiting here. Keep
// this prefix in sync with scripts/seed.ts.
export function isSeedAuthor(authorId: string): boolean {
  return authorId === "sixwords-system" || authorId.startsWith("seed-");
}
