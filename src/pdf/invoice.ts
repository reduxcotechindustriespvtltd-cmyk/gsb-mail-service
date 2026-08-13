import PDFDocument from "pdfkit";
import type { BookingEventPayload } from "../types.js";
import { LOGO_PNG_BASE64 } from "../assets/logo.js";

// PDFKit's default Helvetica base font only supports WinAnsi encoding, which
// has no glyph for ₹ (U+20B9) — it silently renders as a garbled superscript
// digit instead of throwing, so this must not be assumed to "just work"
// without embedding a Unicode font. "Rs." avoids the encoding gap entirely.
const CURRENCY = "Rs.";

// ---- palette (single source of truth for the whole invoice) ----
const C = {
  band: "#0E2A3B", // deep petrol header band
  accent: "#C9A227", // muted gold — stripe, logo mark, balance-due amount
  ink: "#17222B", // headings / strong values
  text: "#3F4C57", // body copy
  muted: "#7A8791", // labels / secondary
  hair: "#E6EAEE", // hairline rules
  panel: "#F4F7F9", // light card / zebra fill
  danger: "#C0392B", // cancelled state
  white: "#FFFFFF",
} as const;

const PAGE = { w: 595.28, h: 841.89, m: 50 } as const; // A4 in points
const LEFT = PAGE.m;
const RIGHT = PAGE.w - PAGE.m; // 545.28
const CONTENT_W = RIGHT - LEFT; // 495.28

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

// Small uppercase section label used throughout (e.g. "BILLED TO").
function sectionLabel(
  doc: PDFKit.PDFDocument,
  txt: string,
  x: number,
  y: number,
  w: number,
  align: "left" | "right" = "left",
): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(C.muted)
    .text(txt.toUpperCase(), x, y, { width: w, align, characterSpacing: 1.2 });
}

export function generateInvoicePdf(payload: BookingEventPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: PAGE.m });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Everything below is positioned absolutely, so suppress PDFKit's
    // automatic page break — otherwise absolutely-placed footer/watermark
    // text drawn past the bottom margin silently spawns extra blank pages.
    doc.page.margins.bottom = 0;

    const brandName = process.env.BRAND_NAME ?? "GSB Holidays";
    const tagline = process.env.BRAND_TAGLINE ?? "Curated stays & getaways";
    const supportEmail = process.env.BRAND_SUPPORT_EMAIL ?? "";
    const supportPhone = process.env.BRAND_SUPPORT_PHONE ?? "";
    const cancelled = payload.event === "BOOKING_CANCELLED";

    // ============ HEADER BAND (full bleed) ============
    const bandH = 132;
    doc.rect(0, 0, PAGE.w, bandH).fill(C.band);
    doc.rect(0, bandH, PAGE.w, 4).fill(C.accent); // thin accent stripe under the band

    // Logo: use the embedded raster logo when it decodes, else fall back to a
    // drawn gold monogram so the header never looks broken/empty.
    const markX = LEFT;
    const markY = 34;
    const markS = 46;
    let logoDrawn = false;
    try {
      doc.image(Buffer.from(LOGO_PNG_BASE64, "base64"), markX, markY, { fit: [markS, markS] });
      logoDrawn = true;
    } catch {
      // Corrupt/unreadable logo data — fall through to the vector monogram.
    }
    if (!logoDrawn) {
      const initials = brandName
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      doc.roundedRect(markX, markY, markS, markS, 10).fill(C.accent);
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor(C.band)
        .text(initials, markX, markY + 13, { width: markS, align: "center" });
    }

    doc.font("Helvetica-Bold").fontSize(19).fillColor(C.white).text(brandName, markX + markS + 14, 40);
    doc.font("Helvetica").fontSize(9.5).fillColor("#AEBEC9").text(tagline, markX + markS + 14, 66);

    // Right meta block (reversed out white on the band).
    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor(C.white)
      .text("INVOICE", RIGHT - 240, 34, { width: 240, align: "right", characterSpacing: 2 });
    doc.font("Helvetica").fontSize(9.5).fillColor("#CBD6DE");
    const meta = [
      `Invoice #  ${payload.invoiceNumber ?? "—"}`,
      `Date  ${formatDate(new Date().toISOString())}`,
      `Booking ID  ${payload.bookingId}`,
    ];
    doc.text(meta.join("\n"), RIGHT - 240, 74, { width: 240, align: "right", lineGap: 3 });

    // ============ STATUS BADGE (cancelled only) ============
    let y = bandH + 26;
    if (cancelled) {
      const t = "CANCELLED";
      doc.font("Helvetica-Bold").fontSize(9);
      const pw = doc.widthOfString(t) + 24;
      doc.roundedRect(LEFT, y, pw, 20, 10).fill(C.danger);
      doc
        .fillColor(C.white)
        .text(t, LEFT, y + 6, { width: pw, align: "center", characterSpacing: 1 });
      y += 32; // own row, so it never collides with the columns below
    }

    // ============ BILLED TO  +  STAY SUMMARY (two columns) ============
    const colGap = 24;
    const colW = (CONTENT_W - colGap) / 2;
    const rColX = LEFT + colW + colGap;

    sectionLabel(doc, "Billed to", LEFT, y, colW);
    sectionLabel(doc, "Stay summary", rColX, y, colW);
    y += 16;

    // left column
    doc.font("Helvetica-Bold").fontSize(12).fillColor(C.ink).text(payload.guestName, LEFT, y, { width: colW });
    const ly = doc.y + 2;
    doc.font("Helvetica").fontSize(9.5).fillColor(C.text);
    doc.text(payload.phone, LEFT, ly, { width: colW });
    if (payload.email) doc.text(payload.email, LEFT, doc.y, { width: colW });
    const leftBottom = doc.y;

    // right column (key/value rows)
    const kv: [string, string][] = [
      ["Check-in", formatDate(payload.checkInDate)],
      ["Check-out", formatDate(payload.checkOutDate)],
      ["Nights", String(payload.nights)],
      ["Guests", guestCountLabel(payload)],
    ];
    let ry = y;
    for (const [k, v] of kv) {
      doc.font("Helvetica").fontSize(9.5).fillColor(C.muted).text(k, rColX, ry, { width: 78 });
      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(C.ink)
        .text(v, rColX + 82, ry, { width: colW - 82, align: "right" });
      ry = doc.y + 4;
    }
    y = Math.max(leftBottom, ry) + 16;

    // ============ TRIP DETAILS CARD (only rows that exist) ============
    const tripRows: [string, string][] = [];
    if (payload.packageName) tripRows.push(["Package", payload.packageName]);
    if (payload.destination) tripRows.push(["Destination", payload.destination]);
    if (payload.resortName) tripRows.push(["Property", payload.resortName]);
    if (payload.includesFood) tripRows.push(["Meals", "Included"]);
    if (cancelled && payload.cancelledAt) tripRows.push(["Cancelled on", formatDate(payload.cancelledAt)]);

    if (tripRows.length) {
      const rowH = 22;
      const padY = 12;
      const cardH = padY * 2 + tripRows.length * rowH;
      doc.roundedRect(LEFT, y, CONTENT_W, cardH, 8).fill(C.panel);
      let ty = y + padY;
      tripRows.forEach(([k, v], i) => {
        if (i > 0) {
          doc
            .moveTo(LEFT + 16, ty)
            .lineTo(RIGHT - 16, ty)
            .lineWidth(0.5)
            .strokeColor(C.hair)
            .stroke();
        }
        const isCancel = k === "Cancelled on";
        doc.font("Helvetica").fontSize(9.5).fillColor(C.muted).text(k, LEFT + 16, ty + 6);
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor(isCancel ? C.danger : C.ink)
          .text(v, LEFT + 130, ty + 6, { width: CONTENT_W - 146, align: "right" });
        ty += rowH;
      });
      y += cardH + 24;
    }

    // ============ PAYMENT SUMMARY TABLE ============
    sectionLabel(doc, "Payment summary", LEFT, y, CONTENT_W);
    y += 16;

    const amtW = 130;
    const descX = LEFT + 14;
    const amtX = RIGHT - amtW - 14;

    // header row
    doc.rect(LEFT, y, CONTENT_W, 26).fill(C.band);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.white);
    doc.text("DESCRIPTION", descX, y + 8, { characterSpacing: 1 });
    doc.text("AMOUNT", amtX, y + 8, { width: amtW, align: "right", characterSpacing: 1 });
    y += 26;

    const items: [string, string][] = [
      [
        `Adult stay  \u00B7  ${money(payload.adultCostPerPerson)} \u00D7 ${payload.adultCount} \u00D7 ${payload.nights} night${payload.nights === 1 ? "" : "s"}`,
        money(String(Number(payload.adultCostPerPerson) * payload.adultCount * payload.nights)),
      ],
    ];
    if (payload.kidsCount > 0) {
      items.push([
        `Kids stay  \u00B7  ${money(payload.kidsCostPerPerson)} \u00D7 ${payload.kidsCount} \u00D7 ${payload.nights} night${payload.nights === 1 ? "" : "s"}`,
        money(String(Number(payload.kidsCostPerPerson) * payload.kidsCount * payload.nights)),
      ]);
    }

    const rowH = 28;
    items.forEach(([desc, amt], i) => {
      if (i % 2 === 1) doc.rect(LEFT, y, CONTENT_W, rowH).fill(C.panel); // zebra
      doc.font("Helvetica").fontSize(9.5).fillColor(C.text).text(desc, descX, y + 9, { width: amtX - descX - 10 });
      doc.font("Helvetica").fontSize(9.5).fillColor(C.ink).text(amt, amtX, y + 9, { width: amtW, align: "right" });
      y += rowH;
    });
    doc.moveTo(LEFT, y).lineTo(RIGHT, y).lineWidth(0.5).strokeColor(C.hair).stroke();
    y += 18;

    // ============ TOTALS PANEL (right aligned) ============
    const boxW = 250;
    const boxX = RIGHT - boxW;
    const totalLine = (lbl: string, val: string, opts: { strong?: boolean; highlight?: boolean } = {}): void => {
      const { strong, highlight } = opts;
      const h = 26;
      if (highlight) doc.roundedRect(boxX, y, boxW, h + 4, 6).fill(C.band);
      doc
        .font(strong || highlight ? "Helvetica-Bold" : "Helvetica")
        .fontSize(highlight ? 11 : 9.5)
        .fillColor(highlight ? C.white : strong ? C.ink : C.text)
        .text(lbl, boxX + 14, y + (highlight ? 7 : 6));
      doc
        .font(strong || highlight ? "Helvetica-Bold" : "Helvetica")
        .fontSize(highlight ? 12 : 9.5)
        .fillColor(highlight ? C.accent : C.ink)
        .text(val, boxX + 14, y + 6, { width: boxW - 28, align: "right" });
      y += highlight ? h + 12 : h;
    };
    totalLine("Total", money(payload.totalRevenue), { strong: true });
    doc.moveTo(boxX, y).lineTo(RIGHT, y).lineWidth(0.5).strokeColor(C.hair).stroke();
    totalLine("Advance paid", money(payload.advance));
    doc.moveTo(boxX, y).lineTo(RIGHT, y).lineWidth(0.5).strokeColor(C.hair).stroke();
    y += 8;
    totalLine("Balance due", money(payload.balanceAmount), { highlight: true });

    // ============ WATERMARK (cancelled) ============
    if (cancelled) {
      // .text() under a rotated transform still advances PDFKit's internal
      // cursor (doc.x/doc.y) as if unrotated, throwing off everything drawn
      // afterward — save()/restore() only undoes the graphics-state transform,
      // not the cursor, so it must be saved/restored by hand too. (Here it is
      // the last thing drawn, but the pattern is kept to stay safe.)
      const cursorX = doc.x;
      const cursorY = doc.y;
      doc.save();
      doc
        .fillColor(C.danger)
        .fontSize(90)
        .opacity(0.08)
        .rotate(-28, { origin: [PAGE.w / 2, PAGE.h / 2] })
        .text("CANCELLED", 40, PAGE.h / 2 - 40, { width: PAGE.w - 80, align: "center" });
      doc.restore();
      doc.opacity(1);
      doc.x = cursorX;
      doc.y = cursorY;
    }

    // ============ FOOTER ============
    const footY = PAGE.h - 64;
    doc.moveTo(LEFT, footY).lineTo(RIGHT, footY).lineWidth(0.5).strokeColor(C.hair).stroke();
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(C.ink)
      .text("Thank you for booking with us.", LEFT, footY + 12, { width: CONTENT_W, align: "center" });
    const contact = [brandName, supportEmail, supportPhone].filter(Boolean).join("   \u00B7   ");
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(C.muted)
      .text(contact, LEFT, footY + 28, { width: CONTENT_W, align: "center" });

    doc.end();
  });
}