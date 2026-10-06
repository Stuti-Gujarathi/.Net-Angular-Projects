import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'at-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="stack" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast" [class]="'toast ' + t.kind" role="status">
          <at-icon [name]="t.kind === 'success' ? 'check' : t.kind === 'error' ? 'alert' : 'info'" [size]="18" />
          <p>{{ t.message }}</p>
          <button type="button" (click)="toasts.dismiss(t.id)" aria-label="Dismiss"><at-icon name="x" [size]="16" /></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .stack { position: fixed; z-index: 100; right: 1.25rem; bottom: 1.25rem; display: grid; gap: .6rem; width: min(380px, calc(100vw - 2.5rem)); }
    .toast { display: grid; grid-template-columns: auto 1fr auto; gap: .7rem; align-items: start; padding: .85rem 1rem; border-radius: 14px;
      background: var(--ink); color: #fff; box-shadow: var(--shadow-lg); animation: rise .25s cubic-bezier(.2, .9, .3, 1.2); font-size: .9rem; }
    .toast at-icon { margin-top: 2px; }
    .success at-icon { color: #5eead4; } .error at-icon { color: #ff8a73; } .info at-icon { color: #9db4ff; }
    button { border: 0; background: none; color: rgb(255 255 255 / .6); cursor: pointer; padding: 0; }
    button:hover { color: #fff; }
    @keyframes rise { from { opacity: 0; transform: translateY(12px) scale(.98); } }
  `],
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
}
