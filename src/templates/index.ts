// Inlined as string exports (rather than read from .hbs files at runtime)
// so the serverless bundle has no filesystem dependency to trace/include —
// each function's code is 100% self-contained after bundling.

export const bookingConfirmed = `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
  <div style="background: #0f172a; padding: 24px; text-align: center;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 20px;">{{brandName}}</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb;">
    <h2 style="margin-top: 0;">Booking Confirmed 🎉</h2>
    <p>Hi {{guestName}},</p>
    <p>
      Thank you for booking with {{brandName}}! Your stay
      {{#if packageName}}at <strong>{{packageName}}</strong>{{/if}}
      {{#if destination}}in <strong>{{destination}}</strong>{{/if}}
      is confirmed. Here are your booking details:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; color: #6b7280;">Invoice #</td><td style="padding: 6px 0; text-align: right;">{{invoiceNumber}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-in</td><td style="padding: 6px 0; text-align: right;">{{checkInDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-out</td><td style="padding: 6px 0; text-align: right;">{{checkOutDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Guests</td><td style="padding: 6px 0; text-align: right;">{{guestCountLabel}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Total Amount</td><td style="padding: 6px 0; text-align: right;">{{totalRevenue}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Advance Paid</td><td style="padding: 6px 0; text-align: right;">{{advance}}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold;">Balance Due</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">{{balanceAmount}}</td></tr>
    </table>
    <p>Your invoice is attached to this email as a PDF.</p>
    <p>Need to make changes? Just reply to this email or reach us at {{supportEmail}} {{#if supportPhone}}/ {{supportPhone}}{{/if}}.</p>
    <p style="margin-top: 24px;">Looking forward to hosting you!<br />— Team {{brandName}}</p>
  </div>
</div>
`;

export const bookingUpdated = `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
  <div style="background: #0f172a; padding: 24px; text-align: center;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 20px;">{{brandName}}</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb;">
    <h2 style="margin-top: 0;">Your Booking Has Been Updated</h2>
    <p>Hi {{guestName}},</p>
    <p>
      Your booking
      {{#if packageName}}at <strong>{{packageName}}</strong>{{/if}}
      {{#if destination}}in <strong>{{destination}}</strong>{{/if}}
      has been updated. Here are the latest details:
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; color: #6b7280;">Invoice #</td><td style="padding: 6px 0; text-align: right;">{{invoiceNumber}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-in</td><td style="padding: 6px 0; text-align: right;">{{checkInDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-out</td><td style="padding: 6px 0; text-align: right;">{{checkOutDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Guests</td><td style="padding: 6px 0; text-align: right;">{{guestCountLabel}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Total Amount</td><td style="padding: 6px 0; text-align: right;">{{totalRevenue}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Advance Paid</td><td style="padding: 6px 0; text-align: right;">{{advance}}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold;">Balance Due</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">{{balanceAmount}}</td></tr>
    </table>
    <p>An updated invoice is attached to this email as a PDF.</p>
    <p>Questions? Reach us at {{supportEmail}} {{#if supportPhone}}/ {{supportPhone}}{{/if}}.</p>
    <p style="margin-top: 24px;">— Team {{brandName}}</p>
  </div>
</div>
`;

export const bookingCancelled = `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
  <div style="background: #0f172a; padding: 24px; text-align: center;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 20px;">{{brandName}}</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb;">
    <h2 style="margin-top: 0; color: #dc2626;">Booking Cancelled</h2>
    <p>Hi {{guestName}},</p>
    <p>
      This confirms your booking
      {{#if packageName}}at <strong>{{packageName}}</strong>{{/if}}
      {{#if destination}}in <strong>{{destination}}</strong>{{/if}}
      (Invoice #{{invoiceNumber}}) has been cancelled on {{cancelledAt}}.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-in</td><td style="padding: 6px 0; text-align: right;">{{checkInDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-out</td><td style="padding: 6px 0; text-align: right;">{{checkOutDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Total Amount</td><td style="padding: 6px 0; text-align: right;">{{totalRevenue}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Advance Paid</td><td style="padding: 6px 0; text-align: right;">{{advance}}</td></tr>
    </table>
    <p>A cancellation notice is attached to this email as a PDF for your records.</p>
    <p>If this wasn't expected, please contact us right away at {{supportEmail}} {{#if supportPhone}}/ {{supportPhone}}{{/if}}.</p>
    <p style="margin-top: 24px;">— Team {{brandName}}</p>
  </div>
</div>
`;

export const adminNotification = `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
  <div style="padding: 16px 24px; background: {{eventColor}}; color: white;">
    <strong>{{eventLabel}}</strong>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #6b7280;">Booking ID</td><td style="padding: 6px 0; text-align: right;">{{bookingId}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Invoice #</td><td style="padding: 6px 0; text-align: right;">{{invoiceNumber}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Guest</td><td style="padding: 6px 0; text-align: right;">{{guestName}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Phone</td><td style="padding: 6px 0; text-align: right;">{{phone}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0; text-align: right;">{{email}}</td></tr>
      {{#if packageName}}<tr><td style="padding: 6px 0; color: #6b7280;">Package</td><td style="padding: 6px 0; text-align: right;">{{packageName}}</td></tr>{{/if}}
      {{#if destination}}<tr><td style="padding: 6px 0; color: #6b7280;">Destination</td><td style="padding: 6px 0; text-align: right;">{{destination}}</td></tr>{{/if}}
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-in</td><td style="padding: 6px 0; text-align: right;">{{checkInDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Check-out</td><td style="padding: 6px 0; text-align: right;">{{checkOutDate}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Guests</td><td style="padding: 6px 0; text-align: right;">{{guestCountLabel}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Total</td><td style="padding: 6px 0; text-align: right;">{{totalRevenue}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Advance</td><td style="padding: 6px 0; text-align: right;">{{advance}}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold;">Balance Due</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">{{balanceAmount}}</td></tr>
      {{#if notes}}<tr><td style="padding: 6px 0; color: #6b7280;">Notes</td><td style="padding: 6px 0; text-align: right;">{{notes}}</td></tr>{{/if}}
    </table>
  </div>
</div>
`;
