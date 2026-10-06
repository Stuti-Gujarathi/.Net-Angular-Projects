import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Side panel for create/edit forms and record details. */
@Component({
  selector: 'at-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (open()) {
      <div class="backdrop" (click)="closed.emit()"></div>
      <aside class="drawer" role="dialog" aria-modal="true" [attr.aria-label]="title()" [style.width]="width()">
        <header>
          <div><h2>{{ title() }}</h2>@if (subtitle()) { <p>{{ subtitle() }}</p> }</div>
          <button type="button" class="btn btn-ghost btn-icon" (click)="closed.emit()" aria-label="Close"><at-icon name="x" /></button>
        </header>
        <div class="body"><ng-content /></div>
        <footer><ng-content select="[drawer-actions]" /></footer>
      </aside>
    }
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 60; background: rgb(15 27 45 / .45); backdrop-filter: blur(2px); animation: fade .2s; }
    .drawer { position: fixed; z-index: 61; top: 0; right: 0; bottom: 0; max-width: 100vw; background: var(--surface); display: flex; flex-direction: column;
      box-shadow: var(--shadow-lg); animation: slide .28s cubic-bezier(.2, .9, .25, 1); }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--line); }
    h2 { font-size: 1.3rem; } header p { color: var(--muted); font-size: .88rem; margin-top: .25rem; }
    .body { flex: 1; overflow-y: auto; padding: 1.5rem; }
    footer { padding: 1rem 1.5rem; border-top: 1px solid var(--line); display: flex; justify-content: flex-end; gap: .6rem; }
    footer:empty { display: none; }
    @keyframes slide { from { transform: translateX(100%); } }
    @keyframes fade { from { opacity: 0; } }
  `],
})
export class DrawerComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly subtitle = input('');
  readonly width = input('520px');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}

/** Centered dialog for confirmations. */
@Component({
  selector: 'at-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="closed.emit()">
        <div class="modal" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 70; background: rgb(15 27 45 / .5); backdrop-filter: blur(3px); display: grid; place-items: center; padding: 1.25rem; animation: fade .2s; }
    .modal { width: min(460px, 100%); background: var(--surface); border-radius: 20px; padding: 1.75rem; box-shadow: var(--shadow-lg); animation: pop .25s cubic-bezier(.2, .9, .3, 1.2); }
    @keyframes fade { from { opacity: 0; } }
    @keyframes pop { from { opacity: 0; transform: scale(.96) translateY(8px); } }
  `],
})
export class ModalComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
