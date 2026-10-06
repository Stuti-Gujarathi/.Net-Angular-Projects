/** Mirrors the .NET API contracts (SGTravels.Api/Contracts). */

export type FeelingKey = 'zenWild' | 'romanticAdventurous' | 'luxuryRaw';

export type Feeling = Record<FeelingKey, number>;

export interface FeelingAxis {
  key: FeelingKey;
  low: string;
  high: string;
  question: string;
}

export interface Price {
  amount: number;
  currency: string;
  note: string;
}

export interface SceneTheme {
  scene: string;
  sky: string[];
  sun: string;
  layers: string[];
  accent: string;
  night: boolean;
}

export interface JourneySummary {
  slug: string;
  title: string;
  destination: string;
  tagline: string;
  whyYoullLoveIt: string;
  days: number;
  nights: number;
  startingPrice: Price;
  arrivalAirport: string;
  route: string[];
  nextDeparture?: string;
  feeling: Feeling;
  theme: SceneTheme;
}

export interface Highlight {
  title: string;
  detail: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  location: string;
  description: string;
  overnight: string;
  meals: string[];
}

export interface Experience {
  title: string;
  description: string;
  feel: string;
}

export interface Stay {
  city: string;
  hotel: string;
  nights: number;
  category: string;
}

export interface JourneyDetail extends JourneySummary {
  summary: string;
  bestSeason: string;
  departures: string[];
  highlights: Highlight[];
  itinerary: ItineraryDay[];
  experiences: Experience[];
  stays: Stay[];
  inclusions: string[];
  exclusions: string[];
}

export interface DiscoveryMatch {
  journey: JourneySummary;
  score: number;
  sharedFeelings: string[];
  reason: string;
}

export interface DiscoveryResponse {
  feeling: Feeling;
  matches: DiscoveryMatch[];
}

export interface EnquiryRequest {
  journeySlug: string;
  fullName: string;
  email: string;
  phone: string;
  travellers: number;
  departure: string | null;
  note: string | null;
}

export interface EnquiryConfirmation {
  reference: string;
  journeySlug: string;
  journeyTitle: string;
  firstName: string;
  travellers: number;
  departure?: string;
  createdAt: string;
}

/** RFC 9457 problem details, as returned by ASP.NET Core. */
export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
