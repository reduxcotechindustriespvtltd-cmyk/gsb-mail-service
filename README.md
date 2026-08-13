# gsb-mail-service

Standalone, stateless mail/invoice service for GSB Holidays, deployed on
Vercel. `admin_crm` calls `POST /api/webhooks/booking-event` whenever a
booking is created, updated, or cancelled; this service renders a branded
email + PDF invoice and sends it via SMTP to the guest and to the internal
team. It has no database of its own — `admin_crm` is the source of truth for
every field in the webhook payload.

Two serverless functions, no long-running server:
- `api/health.ts` — health check
- `api/webhooks/booking-event.ts` — the webhook

Templates and the logo are inlined as TypeScript modules (`src/templates/index.ts`,
`src/assets/logo.ts`) rather than read from disk at runtime, so the bundle has
no filesystem asset to trace/include.

## Local development

```bash
npm install
cp .env.example .env
# leave SMTP_HOST unset — a throwaway Ethereal inbox is used automatically,
# with a preview URL logged for every email sent
npm run dev   # runs `vercel dev`
```

Point `admin_crm`'s `.env.local` at it:

```
MAIL_SERVICE_URL=http://localhost:3000
MAIL_SERVICE_API_KEY=<same value as this service's MAIL_SERVICE_API_KEY>
ADMIN_NOTIFICATION_EMAILS=you@example.com
```

## Production deployment (Vercel)

```bash
vercel link            # first time only
vercel env add MAIL_SERVICE_API_KEY production
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_SECURE production
vercel env add SMTP_USER production
vercel env add SMTP_PASSWORD production
vercel env add MAIL_FROM production
vercel env add BRAND_NAME production
vercel env add BRAND_SUPPORT_EMAIL production
vercel env add BRAND_SUPPORT_PHONE production
vercel --prod
```

`SMTP_HOST` is required in production — the service refuses to start sending
real mail via the Ethereal fallback when `NODE_ENV=production` (Vercel sets
this automatically).

Point the corresponding `admin_crm` deployment's env at this service's
production URL (`MAIL_SERVICE_URL=https://<project>.vercel.app` or a custom
domain) with a matching `MAIL_SERVICE_API_KEY`.

## Webhook contract

`POST /api/webhooks/booking-event`
Header: `x-api-key: <MAIL_SERVICE_API_KEY>`
Body: see `src/types.ts` (`BookingEventPayload`).

Response: `{ ok: true, deduped: boolean, messageIds: string[] }` on success,
`{ ok: false, error: string }` on bad auth/payload.

Duplicate-send protection (`src/idempotency.ts`) is an in-memory, per-instance
cache — it does not persist across cold starts on Vercel, which is an
accepted trade-off given how low-volume this traffic is.
