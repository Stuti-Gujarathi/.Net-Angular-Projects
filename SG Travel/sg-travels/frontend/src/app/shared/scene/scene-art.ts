/**
 * Geometry for the illustrated window views. Everything is seeded, so a destination
 * always draws the same landscape. The canvas is 1200 x 800 and rendered with
 * preserveAspectRatio "slice": the portrait window crops to roughly x 330..870,
 * the wide hero to roughly y 130..670, so landmarks live in the middle.
 */

export const W = 1200;
export const H = 800;

/** Small, fast, seedable PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

export interface RidgeOptions {
  base: number;
  amp: number;
  jag?: number;
  step?: number;
}

/** A filled mountain/hill silhouette across the full width. */
export function ridge(seed: number, { base, amp, jag = 0, step = 24 }: RidgeOptions): string {
  const r = rng(seed);
  const [p1, p2, p3] = [r(), r(), r()].map((v) => v * Math.PI * 2);
  const f1 = 0.0035 + r() * 0.002;
  const f2 = 0.01 + r() * 0.004;
  const f3 = 0.026 + r() * 0.01;
  let d = `M0 ${H} `;
  for (let x = 0; x <= W; x += step) {
    const y =
      base -
      amp * (0.55 * Math.sin(x * f1 + p1) + 0.3 * Math.sin(x * f2 + p2) + 0.15 * Math.sin(x * f3 + p3)) +
      jag * (r() - 0.5);
    d += `L${x} ${f(y)} `;
  }
  return `${d}L${W} ${H} Z`;
}

export interface KarstOptions {
  base: number;
  count: number;
  minH: number;
  maxH: number;
  minW: number;
  maxW: number;
}

/** Guilin-style limestone towers: tall, rounded humps. */
export function karst(seed: number, o: KarstOptions): string {
  const r = rng(seed);
  const slot = W / o.count;
  let d = '';
  for (let i = 0; i < o.count; i++) {
    const x = slot * i + slot * (0.2 + r() * 0.6);
    const h = o.minH + r() * (o.maxH - o.minH);
    const w = o.minW + r() * (o.maxW - o.minW);
    const top = o.base - h;
    const l = x - w / 2;
    const rt = x + w / 2;
    d +=
      `M${f(l)} ${H} L${f(l)} ${o.base} ` +
      `C${f(l)} ${f(o.base - h * 0.85)} ${f(x - w * 0.3)} ${f(top)} ${f(x)} ${f(top)} ` +
      `C${f(x + w * 0.3)} ${f(top)} ${f(rt)} ${f(o.base - h * 0.85)} ${f(rt)} ${o.base} ` +
      `L${f(rt)} ${H} Z `;
  }
  return d;
}

export interface PineOptions {
  count: number;
  x0: number;
  x1: number;
  base: number;
  minH: number;
  maxH: number;
}

/** A band of conifers, each two stacked triangles. */
export function pines(seed: number, o: PineOptions): string {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < o.count; i++) {
    const x = o.x0 + r() * (o.x1 - o.x0);
    const h = o.minH + r() * (o.maxH - o.minH);
    const w = h * 0.42;
    const b = o.base + r() * 14;
    d +=
      `M${f(x - w / 2)} ${f(b)} L${f(x)} ${f(b - h * 0.62)} L${f(x + w / 2)} ${f(b)} Z ` +
      `M${f(x - w * 0.36)} ${f(b - h * 0.4)} L${f(x)} ${f(b - h)} L${f(x + w * 0.36)} ${f(b - h * 0.4)} Z `;
  }
  return d;
}

export interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  twinkle: boolean;
}

export function stars(seed: number, count: number, maxY: number): Star[] {
  const r = rng(seed);
  return Array.from({ length: count }, () => ({
    x: r() * W,
    y: r() * maxY,
    r: 0.6 + r() * 1.4,
    o: 0.35 + r() * 0.65,
    twinkle: r() > 0.7,
  }));
}

export interface Leaf {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  delay: number;
  warm: boolean;
}

/** Falling maple leaves for the koyo scene, kept inside the window's crop. */
export function leaves(seed: number, count: number): Leaf[] {
  const r = rng(seed);
  return Array.from({ length: count }, () => ({
    x: 360 + r() * 480,
    y: 60 + r() * 420,
    rotate: r() * 360,
    scale: 0.9 + r() * 1.2,
    delay: -r() * 14,
    warm: r() > 0.45,
  }));
}

export interface House {
  x: number;
  w: number;
  h: number;
  roof: string;
  wall: string;
}

/** Old-town houses with terracotta roofs, for the Adriatic scene. */
export function houses(seed: number, x0: number, x1: number): House[] {
  const r = rng(seed);
  const roofs = ['#C4643A', '#B5532F', '#D07A4A', '#A84A2C'];
  const walls = ['#EADCC0', '#E2D2AE', '#F1E6CF', '#D9C7A1'];
  const list: House[] = [];
  let x = x0;
  while (x < x1) {
    const w = 26 + r() * 30;
    list.push({
      x,
      w,
      h: 22 + r() * 34,
      roof: roofs[Math.floor(r() * roofs.length)],
      wall: walls[Math.floor(r() * walls.length)],
    });
    x += w - 4;
  }
  return list;
}

/* ---- Hand-drawn landmarks (local coordinates, ground at y = 0) ---------- */

export const MAPLE_LEAF =
  'M0 -9 L2 -3 L8 -5 L4 0 L7 5 L1 3 L0 9 L-1 3 L-7 5 L-4 0 L-8 -5 L-2 -3 Z';

export const TORII = [
  'M-112 -164 Q0 -148 112 -164 L106 -150 Q0 -138 -106 -150 Z',
  'M-98 -150 H98 V-141 H-98 Z',
  'M-86 -120 H86 V-110 H-86 Z',
  'M-6 -141 H6 V-120 H-6 Z',
  'M-72 -141 L-60 -141 L-57 0 L-75 0 Z',
  'M60 -141 L72 -141 L75 0 L57 0 Z',
].join(' ');

export const FUJI = 'M190 650 C380 520 500 330 566 262 Q600 250 634 262 C700 330 820 520 1010 650 Z';
export const FUJI_SNOW =
  'M566 262 Q600 250 634 262 C650 279 664 295 678 312 L660 306 L646 324 L628 308 L612 330 L596 306 L580 326 L562 308 L540 318 C548 300 556 280 566 262 Z';

export const MATTERHORN = 'M440 660 L520 470 L560 400 L590 318 L606 286 L622 300 L640 350 L668 400 L720 480 L800 660 Z';
export const MATTERHORN_SNOW =
  'M590 318 L606 286 L622 300 L640 350 L630 362 L620 344 L610 368 L600 350 L588 366 L578 352 Z M560 400 L574 390 L584 412 L568 432 Z';

export const KILIMANJARO = 'M120 600 C280 560 360 470 470 448 L520 440 L640 436 C720 446 820 520 1060 600 Z';
export const KILIMANJARO_SNOW =
  'M470 448 L520 440 L640 436 C662 440 684 450 700 462 L676 458 L660 468 L640 458 L620 470 L600 458 L580 468 L560 456 L540 466 L520 456 L500 464 L484 456 L462 462 C464 456 466 452 470 448 Z';

export const ACACIA = [
  'M-6 0 L-3 -80 L-40 -118 L-34 -121 L0 -92 L22 -128 L28 -125 L6 -84 L8 0 Z',
  'M-120 -122 C-90 -146 -40 -150 0 -146 C40 -152 100 -146 128 -124 C90 -112 40 -116 0 -114 C-40 -112 -90 -110 -120 -122 Z',
  'M-70 -142 C-40 -160 30 -162 70 -146 C30 -138 -30 -136 -70 -142 Z',
].join(' ');

export const GIRAFFE =
  'M34 -46 L40 -40 L44 -22 L42 -22 L37 -38 L33 -36 L32 0 L28 0 L26 -30 L22 -30 L21 0 L17 0 L16 -32 ' +
  'L-6 -34 L-8 0 L-12 0 L-13 -32 L-16 -32 L-18 0 L-22 0 L-21 -36 L-24 -50 L-42 -96 L-54 -98 L-56 -103 ' +
  'L-44 -108 L-40 -114 L-37 -113 L-38 -107 L-34 -104 L-12 -54 L0 -50 Z';

export const MITRE_PEAK = 'M440 650 L500 470 L536 330 L552 282 L566 320 L590 410 L640 520 L690 650 Z';
export const FJORD_LEFT = 'M0 800 L0 170 C110 200 220 300 300 420 C330 470 352 560 372 650 L380 800 Z';
export const FJORD_RIGHT = 'M1200 800 L1200 150 C1090 190 990 300 920 410 C885 470 860 560 846 650 L838 800 Z';

export const AURORA_A =
  'M-40 330 C180 190 360 360 600 250 S980 140 1240 260 L1240 330 C1000 230 820 400 600 330 S200 280 -40 400 Z';
export const AURORA_B =
  'M-40 250 C220 150 420 300 640 200 S1000 120 1240 190 L1240 240 C1020 180 820 320 640 260 S240 210 -40 300 Z';

export const IGLOO_GRID =
  'M0 -52 L0 0 M-30 -45 Q-38 -20 -40 0 M30 -45 Q38 -20 40 0 M-50 -26 Q0 -34 50 -26 M-56 -10 Q0 -16 56 -10';

export const CHALET = {
  wall: 'M-34 -34 H34 V0 H-34 Z',
  roof: 'M-46 -32 L0 -66 L46 -32 Z',
  snow: 'M-50 -30 L0 -68 L50 -30 L46 -28 L0 -62 L-46 -28 Z',
  windows: 'M-22 -24 h12 v12 h-12 Z M10 -24 h12 v12 h-12 Z',
};

export const RAFT = {
  hull: 'M-60 0 L60 0 L56 6 L-56 6 Z',
  body: 'M8 -38 L20 -38 L22 -2 L6 -2 Z',
  hat: 'M0 -46 L14 -58 L28 -46 Z',
  pole: 'M34 -60 L58 14',
};

export const WALL_TOP = (x0: number, x1: number, y: number): string => {
  let d = `M${x0} 610 L${x0} ${y} `;
  for (let x = x0; x < x1; x += 18) {
    d += `L${x} ${y - 9} L${x + 10} ${y - 9} L${x + 10} ${y} L${x + 18} ${y} `;
  }
  return `${d}L${x1} ${y} L${x1} 610 Z`;
};
