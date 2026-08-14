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

export const inquiryThankYou = `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
  <div style="background: #0f172a; padding: 24px; text-align: center;">
    <h1 style="color: #fbbf24; margin: 0; font-size: 20px;">{{brandName}}</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb;">
    <h2 style="margin-top: 0;">Thank you for your inquiry!</h2>
    <p>Hi {{fullName}},</p>
    <p>
      We've received your inquiry (Reference #{{invoiceNumber}}) and one of our travel
      experts will reach out to you within the next <strong>24–48 hours</strong> to help
      plan your trip.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      {{#if packageInterest}}<tr><td style="padding: 6px 0; color: #6b7280;">Package</td><td style="padding: 6px 0; text-align: right;">{{packageInterest}}</td></tr>{{/if}}
      {{#if checkInDate}}<tr><td style="padding: 6px 0; color: #6b7280;">Check-in</td><td style="padding: 6px 0; text-align: right;">{{checkInDate}}</td></tr>{{/if}}
      {{#if checkOutDate}}<tr><td style="padding: 6px 0; color: #6b7280;">Check-out</td><td style="padding: 6px 0; text-align: right;">{{checkOutDate}}</td></tr>{{/if}}
      {{#if guestCountLabel}}<tr><td style="padding: 6px 0; color: #6b7280;">Guests</td><td style="padding: 6px 0; text-align: right;">{{guestCountLabel}}</td></tr>{{/if}}
      {{#if message}}<tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Your message</td><td style="padding: 6px 0; text-align: right;">{{message}}</td></tr>{{/if}}
    </table>
    <p>Need to add anything or have a question in the meantime? Just reply to this email or reach us at {{supportEmail}} {{#if supportPhone}}/ {{supportPhone}}{{/if}}.</p>
    <p style="margin-top: 24px;">Talk soon!<br />— Team {{brandName}}</p>
  </div>
</div>
`;

export const inquiryAdminNotification = `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
  <div style="padding: 16px 24px; background: #16a34a; color: white;">
    <strong>New Inquiry</strong>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #6b7280;">Reference #</td><td style="padding: 6px 0; text-align: right;">{{invoiceNumber}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Name</td><td style="padding: 6px 0; text-align: right;">{{fullName}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Phone</td><td style="padding: 6px 0; text-align: right;">{{phone}}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Email</td><td style="padding: 6px 0; text-align: right;">{{email}}</td></tr>
      {{#if packageInterest}}<tr><td style="padding: 6px 0; color: #6b7280;">Package</td><td style="padding: 6px 0; text-align: right;">{{packageInterest}}</td></tr>{{/if}}
      {{#if checkInDate}}<tr><td style="padding: 6px 0; color: #6b7280;">Check-in</td><td style="padding: 6px 0; text-align: right;">{{checkInDate}}</td></tr>{{/if}}
      {{#if checkOutDate}}<tr><td style="padding: 6px 0; color: #6b7280;">Check-out</td><td style="padding: 6px 0; text-align: right;">{{checkOutDate}}</td></tr>{{/if}}
      {{#if guestCountLabel}}<tr><td style="padding: 6px 0; color: #6b7280;">Guests</td><td style="padding: 6px 0; text-align: right;">{{guestCountLabel}}</td></tr>{{/if}}
      {{#if message}}<tr><td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Message</td><td style="padding: 6px 0; text-align: right;">{{message}}</td></tr>{{/if}}
    </table>
    {{#if crmLeadUrl}}
    <p style="margin-top: 20px; text-align: center;">
      <a href="{{crmLeadUrl}}" style="background: #0f172a; color: #fbbf24; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold;">View Lead in CRM</a>
    </p>
    {{/if}}
  </div>
</div>
`;
