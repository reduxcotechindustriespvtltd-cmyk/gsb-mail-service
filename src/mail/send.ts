import Handlebars from "handlebars";
import { getTransporter } from "./transport.js";
import { generateInvoicePdf } from "../pdf/invoice.js";
import * as templates from "../templates/index.js";
import type { BookingEventPayload, InquiryEventPayload } from "../types.js";

const TEMPLATE_SOURCES: Record<string, string> = {
  "booking-confirmed": templates.bookingConfirmed,
  "booking-updated": templates.bookingUpdated,
  "booking-cancelled": templates.bookingCancelled,
  "admin-notification": templates.adminNotification,
  "inquiry-thank-you": templates.inquiryThankYou,
  "inquiry-admin-notification": templates.inquiryAdminNotification,
};
const compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

function render(templateName: string, context: Record<string, unknown>): string {
  let template = compiledTemplates.get(templateName);
  if (!template) {
    template = Handlebars.compile(TEMPLATE_SOURCES[templateName]);
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

  // Sent in parallel, not sequentially — halves worst-case latency, which
  // matters because the caller (admin_crm) waits on this whole round-trip.
  const sends: Promise<string>[] = [];

  if (payload.email) {
    const { template, subject } = GUEST_TEMPLATE[payload.event];
    sends.push(
      transporter
        .sendMail({
          from,
          to: payload.email,
          subject: `${subject} — ${context.brandName}`,
          html: render(template, context),
          attachments: [{ filename: invoiceFilename, content: invoicePdf }],
        })
        .then((info) => info.messageId)
    );
  }

  if (payload.adminRecipients.length > 0) {
    const { label, color } = ADMIN_EVENT_LABEL[payload.event];
    sends.push(
      transporter
        .sendMail({
          from,
          to: payload.adminRecipients.join(","),
          subject: `[${label}] ${payload.guestName} — ${payload.invoiceNumber ?? payload.bookingId}`,
          html: render("admin-notification", { ...context, eventLabel: label, eventColor: color }),
          attachments: [{ filename: invoiceFilename, content: invoicePdf }],
        })
        .then((info) => info.messageId)
    );
  }

  const messageIds = await Promise.all(sends);
  return { messageIds };
}

function inquiryGuestCountLabel(payload: InquiryEventPayload): string | null {
  const parts = [
    payload.guestsAdults ? `${payload.guestsAdults} Adult${payload.guestsAdults === 1 ? "" : "s"}` : null,
    payload.guestsKids ? `${payload.guestsKids} Kid${payload.guestsKids === 1 ? "" : "s"}` : null,
    payload.guestsInfants ? `${payload.guestsInfants} Infant${payload.guestsInfants === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function buildInquiryContext(payload: InquiryEventPayload) {
  return {
    ...payload,
    brandName: process.env.BRAND_NAME ?? "GSB Holidays",
    supportEmail: process.env.BRAND_SUPPORT_EMAIL ?? "",
    supportPhone: process.env.BRAND_SUPPORT_PHONE ?? "",
    checkInDate: payload.checkInDate ? formatDate(payload.checkInDate) : null,
    checkOutDate: payload.checkOutDate ? formatDate(payload.checkOutDate) : null,
    guestCountLabel: inquiryGuestCountLabel(payload),
  };
}

// No PDF here — an inquiry has no confirmed price/booking yet, just a
// reference number, so there's nothing to invoice.
export async function sendInquiryEmails(payload: InquiryEventPayload): Promise<SendResult> {
  const transporter = await getTransporter();
  const from = process.env.MAIL_FROM ?? `"${process.env.BRAND_NAME ?? "GSB Holidays"}" <no-reply@example.com>`;
  const context = buildInquiryContext(payload);
  const sends: Promise<string>[] = [];

  if (payload.email) {
    sends.push(
      transporter
        .sendMail({
          from,
          to: payload.email,
          subject: `We've received your inquiry — ${context.brandName}`,
          html: render("inquiry-thank-you", context),
        })
        .then((info) => info.messageId)
    );
  }

  if (payload.adminRecipients.length > 0) {
    sends.push(
      transporter
        .sendMail({
          from,
          to: payload.adminRecipients.join(","),
          subject: `[New Inquiry] ${payload.fullName} — ${payload.invoiceNumber ?? payload.leadId}`,
          html: render("inquiry-admin-notification", context),
        })
        .then((info) => info.messageId)
    );
  }

  const messageIds = await Promise.all(sends);
  return { messageIds };
}
