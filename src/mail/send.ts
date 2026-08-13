import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import { getTransporter } from "./transport.js";
import { generateInvoicePdf } from "../pdf/invoice.js";
import type { BookingEventPayload } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, "..", "templates");
const compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

function render(templateName: string, context: Record<string, unknown>): string {
  let template = compiledTemplates.get(templateName);
  if (!template) {
    const source = fs.readFileSync(path.join(templatesDir, `${templateName}.hbs`), "utf8");
    template = Handlebars.compile(source);
    compiledTemplates.set(templateName, template);
  }
  return template(context);
}

function money(value: string): string {
  const n = Number(value);
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function guestCountLabel(payload: BookingEventPayload): string {
  const parts = [`${payload.adultCount} Adult${payload.adultCount === 1 ? "" : "s"}`];
  if (payload.kidsCount > 0) parts.push(`${payload.kidsCount} Kid${payload.kidsCount === 1 ? "" : "s"}`);
  if (payload.infantCount > 0) parts.push(`${payload.infantCount} Infant${payload.infantCount === 1 ? "" : "s"}`);
  return parts.join(", ");
}

function buildContext(payload: BookingEventPayload) {
  return {
    ...payload,
    brandName: process.env.BRAND_NAME ?? "GSB Holidays",
    supportEmail: process.env.BRAND_SUPPORT_EMAIL ?? "",
    supportPhone: process.env.BRAND_SUPPORT_PHONE ?? "",
    checkInDate: formatDate(payload.checkInDate),
    checkOutDate: formatDate(payload.checkOutDate),
    cancelledAt: formatDate(payload.cancelledAt),
    totalRevenue: money(payload.totalRevenue),
    advance: money(payload.advance),
    balanceAmount: money(payload.balanceAmount),
    guestCountLabel: guestCountLabel(payload),
  };
}

const GUEST_TEMPLATE: Record<BookingEventPayload["event"], { template: string; subject: string }> = {
  BOOKING_CREATED: { template: "booking-confirmed", subject: "Your booking is confirmed" },
  BOOKING_UPDATED: { template: "booking-updated", subject: "Your booking has been updated" },
  BOOKING_CANCELLED: { template: "booking-cancelled", subject: "Your booking has been cancelled" },
};

const ADMIN_EVENT_LABEL: Record<BookingEventPayload["event"], { label: string; color: string }> = {
  BOOKING_CREATED: { label: "New Booking Created", color: "#16a34a" },
  BOOKING_UPDATED: { label: "Booking Updated", color: "#2563eb" },
  BOOKING_CANCELLED: { label: "Booking Cancelled", color: "#dc2626" },
};

export type SendResult = { messageIds: string[] };

export async function sendBookingEventEmails(payload: BookingEventPayload): Promise<SendResult> {
  const transporter = await getTransporter();
  const from = process.env.MAIL_FROM ?? `"${process.env.BRAND_NAME ?? "GSB Holidays"}" <no-reply@example.com>`;
  const context = buildContext(payload);
  const invoicePdf = await generateInvoicePdf(payload);
  const invoiceFilename = `invoice-${payload.invoiceNumber ?? payload.bookingId}.pdf`;
  const messageIds: string[] = [];

  if (payload.email) {
    const { template, subject } = GUEST_TEMPLATE[payload.event];
    const info = await transporter.sendMail({
      from,
      to: payload.email,
      subject: `${subject} — ${context.brandName}`,
      html: render(template, context),
      attachments: [{ filename: invoiceFilename, content: invoicePdf }],
    });
    messageIds.push(info.messageId);
  }

  if (payload.adminRecipients.length > 0) {
    const { label, color } = ADMIN_EVENT_LABEL[payload.event];
    const info = await transporter.sendMail({
      from,
      to: payload.adminRecipients.join(","),
      subject: `[${label}] ${payload.guestName} — ${payload.invoiceNumber ?? payload.bookingId}`,
      html: render("admin-notification", { ...context, eventLabel: label, eventColor: color }),
      attachments: [{ filename: invoiceFilename, content: invoicePdf }],
    });
    messageIds.push(info.messageId);
  }

  return { messageIds };
}
