import type { VercelRequest } from "@vercel/node";

export function isAuthorized(req: VercelRequest): boolean {
  const expected = process.env.MAIL_SERVICE_API_KEY;
  if (!expected) return false;
  return req.headers["x-api-key"] === expected;
}
