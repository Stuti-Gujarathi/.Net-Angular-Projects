// Mirrors the API DTOs in backend/AeroTrip.Api/DTOs. Enums travel as strings.

export type CabinClass = 'Economy' | 'PremiumEconomy' | 'Business';
export type BookingStatus = 'PendingPayment' | 'Confirmed' | 'Cancelled' | 'Expired';
export type PaymentMethod = 'Card' | 'Upi' | 'NetBanking';
export type PaymentStatus = 'Succeeded' | 'Failed';
export type Gender = 'Male' | 'Female' | 'Other';
export type PassengerType = 'Adult' | 'Child';
export type SeatPreference = 'NoPreference' | 'Window' | 'Aisle';
export type DiscountType = 'Percentage' | 'Flat';
export type UserRole = 'User' | 'Admin';

export const CABIN_LABELS: Record<CabinClass, string> = {
  Economy: 'Economy',
  PremiumEconomy: 'Premium Economy',
  Business: 'Business',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PendingPayment: 'Awaiting payment',
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
  Expired: 'Expired',
};

// ---------- Auth ----------
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  user: User;
}

// ---------- Catalog ----------
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  isInternational: boolean;
}

export interface Airline {
  code: string;
  name: string;
  brandColor: string;
  isFullService: boolean;
}

export interface PopularRoute {
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  lowestFare: number;
  lowestFareDate: string;
  durationMinutes: number;
  isInternational: boolean;
}

// ---------- Flights ----------
export interface Segment {
  flightId: string;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  airlineColor: string;
  origin: string;
  originCity: string;
  originName: string;
  destination: string;
  destinationCity: string;
  destinationName: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  aircraft: string;
  checkInBaggageKg: number;
  cabinBaggageKg: number;
  mealIncluded: boolean;
}

export interface Layover {
  airportCode: string;
  city: string;
  minutes: number;
}

export interface Itinerary {
  id: string;
  segments: Segment[];
  layovers: Layover[];
  stops: number;
  totalDurationMinutes: number;
  departure: string;
  arrival: string;
  cabin: CabinClass;
  farePerAdult: number;
  totalFare: number;
  seatsLeft: number;
  refundable: boolean;
  tags: string[];
}

export interface FlightSearchResponse {
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  date: string;
  passengers: number;
  cabin: CabinClass;
  totalResults: number;
  lowestFare: number | null;
  results: Itinerary[];
}

export interface FareCalendarDay {
  date: string;
  lowestFare: number | null;
  isCheapest: boolean;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  pax: number;
  cabin: CabinClass;
}

// ---------- Booking ----------
export interface Extras {
  extraBaggage: boolean;
  meal: boolean;
  travelInsurance: boolean;
  flexibleDateChange: boolean;
  seatPreference: SeatPreference;
}

export interface FareBreakdown {
  farePerAdult: number;
  baseFare: number;
  taxes: number;
  convenienceFee: number;
  baggageFee: number;
  mealFee: number;
  insuranceFee: number;
  flexFee: number;
  extrasTotal: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface PriceQuote {
  itineraryId: string;
  passengers: number;
  cabin: CabinClass;
  fare: FareBreakdown;
  appliedCoupon: string | null;
  couponMessage: string | null;
  couponValid: boolean;
}

export interface PassengerInput {
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
}

export interface CreateBookingRequest {
  itineraryId: string;
  cabin: CabinClass;
  passengers: PassengerInput[];
  contactEmail: string;
  contactPhone: string;
  extras: Extras;
  couponCode: string | null;
}

export interface Passenger extends PassengerInput {
  type: PassengerType;
}

export interface BookedSegment {
  flightInstanceId: string;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  airlineColor: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  aircraft: string;
  seats: string[];
}

export interface PaymentInfo {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference: string;
  maskedInstrument: string;
  processedAt: string;
}

export interface Booking {
  id: string;
  pnr: string;
  status: BookingStatus;
  itineraryId: string;
  cabin: CabinClass;
  segments: BookedSegment[];
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  extras: Extras;
  fare: FareBreakdown;
  couponCode: string | null;
  createdAt: string;
  holdExpiresAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  refundAmount: number;
  payment: PaymentInfo | null;
  isUpcoming: boolean;
  canCancel: boolean;
  travellerName: string;
  /** Seconds left on the seat hold while awaiting payment (computed server-side, so time zones don't matter). */
  holdSecondsLeft: number;
}

export interface BookingSummary {
  id: string;
  pnr: string;
  status: BookingStatus;
  userName: string;
  userEmail: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departure: string;
  airlineName: string;
  airlineColor: string;
  flightNumbers: string;
  stops: number;
  cabin: CabinClass;
  passengerCount: number;
  total: number;
  discount: number;
  refundAmount: number;
  createdAt: string;
}

export interface CancellationQuote {
  bookingId: string;
  totalPaid: number;
  refundAmount: number;
  cancellationCharges: number;
  policy: string;
}

// ---------- Payments ----------
export interface CardDetails {
  number: string;
  nameOnCard: string;
  expiry: string;
  cvv: string;
}

export interface PaymentRequest {
  bookingId: string;
  method: PaymentMethod;
  card?: CardDetails;
  upiId?: string;
  bankCode?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  reference: string | null;
  booking: Booking;
}

// ---------- Offers ----------
export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  value: number;
  maxDiscount: number;
  minBookingAmount: number;
  validFrom: string;
  validTo: string;
  cabin: CabinClass | null;
  airlineCode: string | null;
  internationalOnly: boolean;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  theme: string;
}

export type UpsertOffer = Omit<Offer, 'id' | 'usedCount'>;

// ---------- Admin ----------
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface RouteStat {
  origin: string;
  destination: string;
  label: string;
  bookings: number;
  revenue: number;
}

export interface AirlineShare {
  code: string;
  name: string;
  color: string;
  bookings: number;
  sharePct: number;
}

export interface AdminStats {
  netRevenue: number;
  revenueLast7Days: number;
  revenueChangePct: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalPassengers: number;
  averageBookingValue: number;
  loadFactorPct: number;
  activeFlights: number;
  activeOffers: number;
  totalUsers: number;
  discountsGiven: number;
  refundsIssued: number;
  revenueByDay: RevenuePoint[];
  topRoutes: RouteStat[];
  airlineShare: AirlineShare[];
  statusBreakdown: { status: BookingStatus; count: number }[];
  recentBookings: BookingSummary[];
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  bookings: number;
  totalSpent: number;
}

export interface FlightSchedule {
  id: string;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  airlineColor: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  durationMinutes: number;
  aircraft: string;
  operatingDays: number[];
  economyFare: number;
  premiumEconomyFare: number | null;
  businessFare: number | null;
  economySeats: number;
  premiumEconomySeats: number;
  businessSeats: number;
  checkInBaggageKg: number;
  mealIncluded: boolean;
  isActive: boolean;
  isInternational: boolean;
}

export interface UpsertFlightSchedule {
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureTime: string;
  durationMinutes: number;
  aircraft: string;
  operatingDays: number[];
  economyFare: number;
  premiumEconomyFare: number | null;
  businessFare: number | null;
  economySeats: number;
  premiumEconomySeats: number;
  businessSeats: number;
  checkInBaggageKg: number;
  mealIncluded: boolean;
  isActive: boolean;
}
