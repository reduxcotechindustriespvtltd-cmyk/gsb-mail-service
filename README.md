# gsb-mail-service

Standalone, stateless mail/invoice service for GSB Holidays. `admin_crm` calls
`POST /webhooks/booking-event` whenever a booking is created, updated, or
cancelled; this service renders a branded email + PDF invoice and sends it via
SMTP to the guest and to the internal team. It has no database of its own —
`admin_crm` is the source of truth for every field in the webhook payload.

## Local development

```bash
npm install
cp .env.example .env
# leave SMTP_HOST unset — a throwaway Ethereal inbox is used automatically,
# with a preview URL logged for every email sent
npm run dev
```

Point `admin_crm`'s `.env.local` at it:

```
MAIL_SERVICE_URL=http://localhost:4000
MAIL_SERVICE_API_KEY=<same value as this service's MAIL_SERVICE_API_KEY>
ADMIN_NOTIFICATION_EMAILS=you@example.com
```

Then create/edit/cancel a booking in the CRM UI and check this service's
console output for the Ethereal preview link.

## Production deployment (VPS, Docker)

```bash
cp .env.example .env   # fill in real SMTP_HOST/USER/PASSWORD, MAIL_SERVICE_API_KEY, DOMAIN
docker compose -f docker-compose.prod.yml up -d --build
```

`SMTP_HOST` is required in production — the service refuses to start sending
real mail via the Ethereal fallback when `NODE_ENV=production`.

Point the corresponding `admin_crm` deployment's `.env` at this service's
public URL (`MAIL_SERVICE_URL=https://mail.yourdomain.com`) with a matching
`MAIL_SERVICE_API_KEY`.

## Webhook contract

`POST /webhooks/booking-event`
Header: `x-api-key: <MAIL_SERVICE_API_KEY>`
Body: see `src/types.ts` (`BookingEventPayload`).

Response: `{ ok: true, deduped: boolean, messageIds: string[] }` on success,
`{ ok: false, error: string }` on bad auth/payload.
