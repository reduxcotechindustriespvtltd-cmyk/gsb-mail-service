export type BookingEventType = "BOOKING_CREATED" | "BOOKING_UPDATED" | "BOOKING_CANCELLED";

// Mirrors admin_crm/src/lib/notify-booking-event.ts's BookingEventPayload
// exactly — that repo is the source of truth for booking data; this service
// has no database of its own and only ever renders/sends what it's given.
export type BookingEventPayload = {
  event: BookingEventType;
  bookingId: string;
  invoiceNumber: string | null;

  guestName: string;
  phone: string;
  email: string | null;

  checkInDate: string;
  checkOutDate: string;
  nights: number;
  stayType: string | null;

  adultCount: number;
  kidsCount: number;
  infantCount: number;

  adultCostPerPerson: string;
  kidsCostPerPerson: string;
  totalRevenue: string;
  advance: string;
  balanceAmount: string;
  includesFood: boolean;

  packageName: string | null;
  destination: string | null;
  resortName: string | null;
  location: string | null;
  notes: string | null;

  cancelledAt: string | null;

  adminRecipients: string[];
};

export function isBookingEventPayload(value: unknown): value is BookingEventPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.event === "BOOKING_CREATED" || v.event === "BOOKING_UPDATED" || v.event === "BOOKING_CANCELLED") &&
    typeof v.bookingId === "string" &&
    typeof v.guestName === "string" &&
    typeof v.phone === "string" &&
    typeof v.checkInDate === "string" &&
    typeof v.checkOutDate === "string" &&
    typeof v.nights === "number" &&
    typeof v.adultCount === "number" &&
    typeof v.kidsCount === "number" &&
    typeof v.infantCount === "number" &&
    typeof v.adultCostPerPerson === "string" &&
    typeof v.kidsCostPerPerson === "string" &&
    typeof v.totalRevenue === "string" &&
    typeof v.advance === "string" &&
    typeof v.balanceAmount === "string" &&
    typeof v.includesFood === "boolean" &&
    Array.isArray(v.adminRecipients)
  );
}
