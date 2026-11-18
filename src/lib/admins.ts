// Comma-separated list in ADMIN_EMAILS. It only seeds the role of a brand-new account:
// after that the role lives in the auth `user` table and is changed with a plain UPDATE.
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const isSeedAdminEmail = (email: string) =>
  adminEmails.includes(email.trim().toLowerCase());
