import type { FastifyReply, FastifyRequest } from "fastify";

export function verifyApiKey(request: FastifyRequest, reply: FastifyReply, done: () => void) {
  const expected = process.env.MAIL_SERVICE_API_KEY;
  const provided = request.headers["x-api-key"];

  if (!expected) {
    reply.code(500).send({ ok: false, error: "MAIL_SERVICE_API_KEY is not configured" });
    return;
  }
  if (provided !== expected) {
    reply.code(401).send({ ok: false, error: "Invalid or missing x-api-key" });
    return;
  }
  done();
}
