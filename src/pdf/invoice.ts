import PDFDocument from "pdfkit";
import fs from "node:fs";
import type { BookingEventPayload } from "../types.js";

// PDFKit's default Helvetica base font only supports WinAnsi encoding, which
// has no glyph for ₹ (U+20B9) — it silently renders as a garbled superscript
// digit instead of throwing, so this must not be assumed to "just work"
// without embedding a Unicode font. "Rs." avoids the encoding gap entirely.
const CURRENCY = "Rs.";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function money(value: string): string {
  const n = Number(value);
  return `${CURRENCY} ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function guestCountLabel(payload: BookingEventPayload): string {
  const parts = [`${payload.adultCount} Adult${payload.adultCount === 1 ? "" : "s"}`];
  if (payload.kidsCount > 0) parts.push(`${payload.kidsCount} Kid${payload.kidsCount === 1 ? "" : "s"}`);
  if (payload.infantCount > 0) parts.push(`${payload.infantCount} Infant${payload.infantCount === 1 ? "" : "s"}`);
  return parts.join(", ");
}

export function generateInvoicePdf(payload: BookingEventPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const brandName = process.env.BRAND_NAME ?? "GSB Holidays";
    const supportEmail = process.env.BRAND_SUPPORT_EMAIL ?? "";
    const supportPhone = process.env.BRAND_SUPPORT_PHONE ?? "";
    const logoPath = process.env.BRAND_LOGO_PATH ?? "./assets/logo.png";

    // Header: logo + company on the left, invoice meta on the right
    const topY = doc.y;
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, topY, { width: 130 });
      } catch {
        // Corrupt/unreadable logo file — the invoice still works without it.
      }
    }

    doc
      .fontSize(20)
      .fillColor("#111827")
      .text("INVOICE", 0, topY, { align: "right" })
      .fontSize(10)
      .fillColor("#374151")
      .text(`Invoice #: ${payload.invoiceNumber ?? "—"}`, { align: "right" })
      .text(`Date: ${formatDate(new Date().toISOString())}`, { align: "right" })
      .text(`Booking ID: ${payload.bookingId}`, { align: "right" });

    doc.moveDown(3);

    if (payload.event === "BOOKING_CANCELLED") {
      // .text() under a rotated transform still advances PDFKit's internal
      // cursor (doc.x/doc.y) as if unrotated, throwing off everything drawn
      // afterward — save()/restore() only undoes the graphics-state
      // transform, not the cursor, so it must be saved/restored by hand too.
      const cursorX = doc.x;
      const cursorY = doc.y;
      doc.save();
      doc
        .fillColor("#dc2626")
        .fontSize(60)
        .opacity(0.15)
        .rotate(-30, { origin: [300, 400] })
        .text("CANCELLED", 80, 380);
      doc.restore();
      doc.opacity(1);
      doc.x = cursorX;
      doc.y = cursorY;
    }

    doc.fillColor("#111827").fontSize(12).text("Bill To", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#374151");
    doc.text(payload.guestName);
    doc.text(payload.phone);
    if (payload.email) doc.text(payload.email);

    doc.moveDown(1);
    doc.fillColor("#111827").fontSize(12).text("Stay Details", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#374151");
    if (payload.packageName) doc.text(`Package: ${payload.packageName}`);
    if (payload.destination) doc.text(`Destination: ${payload.destination}`);
    if (payload.resortName) doc.text(`Property: ${payload.resortName}`);
    doc.text(`Check-in: ${formatDate(payload.checkInDate)}`);
    doc.text(`Check-out: ${formatDate(payload.checkOutDate)}`);
    doc.text(`Nights: ${payload.nights}`);
    doc.text(`Guests: ${guestCountLabel(payload)}`);
    if (payload.includesFood) doc.text("Meals: Included");
    if (payload.event === "BOOKING_CANCELLED" && payload.cancelledAt) {
      doc.fillColor("#dc2626").text(`Cancelled on: ${formatDate(payload.cancelledAt)}`);
      doc.fillColor("#374151");
    }

    doc.moveDown(1.2);
    doc.fillColor("#111827").fontSize(12).text("Payment Summary", { underline: true });
    doc.moveDown(0.5);

    const tableLeft = 50;
    const tableWidth = 495;
    const rows: [string, string][] = [
      [
        `Adult stay (${money(payload.adultCostPerPerson)} x ${payload.adultCount} x ${payload.nights} nights)`,
        money(String(Number(payload.adultCostPerPerson) * payload.adultCount * payload.nights)),
      ],
    ];
    if (payload.kidsCount > 0) {
      rows.push([
        `Kids stay (${money(payload.kidsCostPerPerson)} x ${payload.kidsCount} x ${payload.nights} nights)`,
        money(String(Number(payload.kidsCostPerPerson) * payload.kidsCount * payload.nights)),
      ]);
    }

    doc.fontSize(10);
    for (const [label, amount] of rows) {
      doc.fillColor("#374151").text(label, tableLeft, doc.y, { continued: true, width: tableWidth - 100 });
      doc.text(amount, { align: "right" });
    }

    doc.moveDown(0.3);
    doc
      .moveTo(tableLeft, doc.y)
      .lineTo(tableLeft + tableWidth, doc.y)
      .strokeColor("#e5e7eb")
      .stroke();
    doc.moveDown(0.3);

    const totalsRows: [string, string, boolean?][] = [
      ["Total", money(payload.totalRevenue), true],
      ["Advance Paid", money(payload.advance)],
      ["Balance Due", money(payload.balanceAmount), true],
    ];
    for (const [label, amount, bold] of totalsRows) {
      doc.fillColor("#111827").font(bold ? "Helvetica-Bold" : "Helvetica");
      doc.text(label, tableLeft, doc.y, { continued: true, width: tableWidth - 100 });
      doc.text(amount, { align: "right" });
      doc.font("Helvetica");
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text(`${brandName}${supportEmail ? ` • ${supportEmail}` : ""}${supportPhone ? ` • ${supportPhone}` : ""}`, {
        align: "center",
      });

    doc.end();
  });
}
