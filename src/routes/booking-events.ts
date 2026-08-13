import type { FastifyInstance } from "fastify";
import { verifyApiKey } from "../auth/verify-api-key.js";
import { isDuplicateEvent } from "../idempotency.js";
import { sendBookingEventEmails } from "../mail/send.js";
import { isBookingEventPayload } from "../types.js";

export function registerBookingEventRoutes(app: FastifyInstance) {
  app.post("/webhooks/booking-event", { onRequest: verifyApiKey }, async (request, reply) => {
    const payload = request.body;
    if (!isBookingEventPayload(payload)) {
      reply.code(400).send({ ok: false, error: "Invalid booking event payload" });
      return;
    }

    const dedupeKey = `${payload.bookingId}:${payload.event}:${payload.invoiceNumber ?? ""}`;
    if (isDuplicateEvent(dedupeKey)) {
      reply.send({ ok: true, deduped: true, messageIds: [] });
      return;
    }

    try {
      const { messageIds } = await sendBookingEventEmails(payload);
      reply.send({ ok: true, deduped: false, messageIds });
    } catch (error) {
      request.log.error(error, "Failed to send booking event emails");
      reply.code(500).send({ ok: false, error: "Failed to send email" });
    }
  });
}
