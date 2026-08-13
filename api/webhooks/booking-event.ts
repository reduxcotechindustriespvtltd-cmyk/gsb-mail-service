import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthorized } from "../../src/auth/verify-api-key.js";
import { isDuplicateEvent } from "../../src/idempotency.js";
import { sendBookingEventEmails } from "../../src/mail/send.js";
import { isBookingEventPayload } from "../../src/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: "Invalid or missing x-api-key" });
    return;
  }

  const payload = req.body;
  if (!isBookingEventPayload(payload)) {
    res.status(400).json({ ok: false, error: "Invalid booking event payload" });
    return;
  }

  const dedupeKey = `${payload.bookingId}:${payload.event}:${payload.invoiceNumber ?? ""}`;
  if (isDuplicateEvent(dedupeKey)) {
    res.status(200).json({ ok: true, deduped: true, messageIds: [] });
    return;
  }

  try {
    const { messageIds } = await sendBookingEventEmails(payload);
    res.status(200).json({ ok: true, deduped: false, messageIds });
  } catch (error) {
    console.error("Failed to send booking event emails", error);
    res.status(500).json({ ok: false, error: "Failed to send email" });
  }
}
