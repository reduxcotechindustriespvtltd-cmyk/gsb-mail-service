import nodemailer, { type Transporter } from "nodemailer";

let transporterPromise: Promise<Transporter> | null = null;
let usingEthereal = false;

async function createTransporter(): Promise<Transporter> {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: SMTP_SECURE === "true",
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    });
  }

  // No SMTP configured — fall back to a throwaway Ethereal inbox so local
  // development/testing works with zero external signup. Never do this in
  // production: real mail would silently vanish into a fake inbox.
  if (process.env.NODE_ENV === "production") {
    throw new Error("SMTP_HOST is not configured and NODE_ENV=production — refusing to fall back to Ethereal");
  }
  usingEthereal = true;
  const testAccount = await nodemailer.createTestAccount();
  console.warn(
    `[mail] No SMTP_HOST set — using a throwaway Ethereal inbox for this dev session (user: ${testAccount.user})`
  );
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

export function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) transporterPromise = createTransporter();
  return transporterPromise;
}

export function isUsingEthereal(): boolean {
  return usingEthereal;
}
