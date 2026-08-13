import Fastify from "fastify";
import { registerBookingEventRoutes } from "./routes/booking-events.js";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

registerBookingEventRoutes(app);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`gsb-mail-service listening on :${port}`))
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
