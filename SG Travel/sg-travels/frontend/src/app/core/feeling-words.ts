import { Feeling, FeelingAxis, FeelingKey } from './models';

/** Used until /api/feelings answers, so the panel never renders empty. */
export const FALLBACK_AXES: FeelingAxis[] = [
  { key: 'zenWild', low: 'Zen', high: 'Wild', question: 'How should the days move?' },
  { key: 'romanticAdventurous', low: 'Romantic', high: 'Adventurous', question: 'What should your heart be doing?' },
  { key: 'luxuryRaw', low: 'Luxury', high: 'Raw', question: 'How polished should it feel?' },
];

export const FEELING_KEYS: FeelingKey[] = ['zenWild', 'romanticAdventurous', 'luxuryRaw'];

export const DEFAULT_FEELING: Feeling = { zenWild: 28, romanticAdventurous: 32, luxuryRaw: 26 };

export interface FeelingPreset {
  label: string;
  feeling: Feeling;
}

export const PRESETS: FeelingPreset[] = [
  { label: 'A quiet honeymoon', feeling: { zenWild: 12, romanticAdventurous: 8, luxuryRaw: 14 } },
  { label: 'Proper adventure', feeling: { zenWild: 90, romanticAdventurous: 92, luxuryRaw: 74 } },
  { label: 'A bit of everything', feeling: { zenWild: 55, romanticAdventurous: 52, luxuryRaw: 48 } },
];

// Five bands per axis. Phrases are written to compose into one sentence:
// "Slow days, a little romance, polished stays."
const PHRASES: Record<FeelingKey, readonly string[]> = {
  zenWild: ['Still, silent days', 'Slow days', 'Easy-paced days', 'Lively days', 'Wild days'],
  romanticAdventurous: ['deep romance', 'a little romance', 'a bit of both', 'real adventure', 'pure adrenaline'],
  luxuryRaw: ['five-star everything', 'polished stays', 'comfortable stays', 'down-to-earth stays', 'raw and real'],
};

export function band(value: number): 0 | 1 | 2 | 3 | 4 {
  if (value < 15) return 0;
  if (value < 40) return 1;
  if (value <= 60) return 2;
  if (value <= 85) return 3;
  return 4;
}

export function describeFeeling(f: Feeling): string {
  return `${PHRASES.zenWild[band(f.zenWild)]}, ${PHRASES.romanticAdventurous[band(f.romanticAdventurous)]}, ${PHRASES.luxuryRaw[band(f.luxuryRaw)]}.`;
}

/** Screen-reader text for a dial, e.g. "Mostly zen". */
export function dialValueText(axis: FeelingAxis, value: number): string {
  switch (band(value)) {
    case 0: return `Fully ${axis.low.toLowerCase()}`;
    case 1: return `Mostly ${axis.low.toLowerCase()}`;
    case 2: return 'Balanced';
    case 3: return `Mostly ${axis.high.toLowerCase()}`;
    default: return `Fully ${axis.high.toLowerCase()}`;
  }
}

export function clampFeeling(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 50;
}
