import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SceneTheme } from '../../core/models';
import * as art from './scene-art';

let nextId = 0;

/**
 * An illustrated view of a destination, drawn from the art direction in the API
 * (palette + scene type). Used inside the window, in the journey hero and in portholes.
 */
@Component({
  selector: 'sgt-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scene.html',
  styleUrl: './scene.scss',
})
export class Scene {
  readonly theme = input.required<SceneTheme>();
  /** Accessible description. Leave empty when the scene is decorative. */
  readonly label = input('');
  /** Ambient motion (aurora sway, leaves, twinkles). Off for hidden or tiny scenes. */
  readonly animate = input(true);

  private readonly uid = `scn${nextId++}`;

  protected readonly art = art;
  protected readonly sky = computed(() => this.pad(this.theme().sky, ['#9EC3D6', '#C9DFEA', '#EEF5F9']));
  protected readonly layers = computed(() => this.pad(this.theme().layers, ['#8FA3B5', '#5D7387', '#2F4458']));

  protected readonly sun = computed(() => {
    switch (this.theme().scene) {
      case 'fuji': return { x: 790, y: 450, r: 52 };
      case 'alps': return { x: 930, y: 150, r: 34 };
      case 'aurora': return { x: 820, y: 140, r: 18 };
      case 'savanna': return { x: 600, y: 560, r: 96 };
      case 'fjord': return { x: 760, y: 170, r: 30 };
      case 'karst': return { x: 720, y: 230, r: 46 };
      case 'adriatic': return { x: 840, y: 470, r: 46 };
      default: return { x: 820, y: 180, r: 36 };
    }
  });

  // Geometry is seeded and memoised per instance.
  protected readonly stars = art.stars(7, 80, 430);
  protected readonly leaves = art.leaves(3, 14);
  protected readonly houses = art.houses(5, 384, 744);
  protected readonly ridges = {
    fujiFar: art.ridge(11, { base: 575, amp: 30, jag: 4 }),
    fujiMid: art.ridge(12, { base: 652, amp: 14 }),
    alpsFar: art.ridge(21, { base: 470, amp: 70, jag: 26, step: 30 }),
    alpsMeadow: art.ridge(22, { base: 640, amp: 26, jag: 2 }),
    alpsNear: art.ridge(23, { base: 718, amp: 18 }),
    alpsPines: art.pines(24, { count: 16, x0: 280, x1: 960, base: 700, minH: 36, maxH: 78 }),
    auroraFar: art.ridge(31, { base: 600, amp: 26 }),
    auroraMid: art.ridge(32, { base: 652, amp: 18 }),
    auroraPines: art.pines(33, { count: 18, x0: 300, x1: 920, base: 646, minH: 40, maxH: 92 }),
    auroraNear: art.ridge(34, { base: 728, amp: 10 }),
    savannaPlain: art.ridge(41, { base: 612, amp: 6, step: 40 }),
    savannaGrass: art.ridge(42, { base: 716, amp: 12, jag: 6, step: 16 }),
    fjordFar: art.ridge(51, { base: 560, amp: 40, jag: 14 }),
    karstFar: art.karst(61, { base: 560, count: 9, minH: 120, maxH: 220, minW: 90, maxW: 160 }),
    karstMid: art.karst(62, { base: 650, count: 7, minH: 140, maxH: 260, minW: 110, maxW: 190 }),
    adriaticFar: art.ridge(71, { base: 470, amp: 40, jag: 10 }),
    wall: art.WALL_TOP(330, 760, 548),
  };

  protected id(name: string): string {
    return `${this.uid}-${name}`;
  }

  protected url(name: string): string {
    return `url(#${this.id(name)})`;
  }

  private pad(values: string[] | undefined, fallback: string[]): string[] {
    return fallback.map((fb, i) => values?.[i] ?? fb);
  }
}
