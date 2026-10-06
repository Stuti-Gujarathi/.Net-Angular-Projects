import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'at-account-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <section class="band">
      <div class="container">
        <p class="hello">Hello, {{ auth.firstName() }}</p>
        <h1>Your travel dashboard</h1>
        <nav class="tabs" aria-label="Account">
          <a routerLink="/account" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }"><at-icon name="grid" [size]="16" />Overview</a>
          <a routerLink="/account/trips" routerLinkActive="on"><at-icon name="ticket" [size]="16" />My trips</a>
          <a routerLink="/account/profile" routerLinkActive="on"><at-icon name="user" [size]="16" />Profile</a>
        </nav>
      </div>
    </section>
    <div class="container content"><router-outlet /></div>
  `,
  styles: [`
    .band { background: linear-gradient(160deg, #0a1322, #15295a 75%, #24356f); color: #fff; padding: 2.5rem 0 0; position: relative; overflow: hidden; }
    .band::after { content: ''; position: absolute; right: -10%; top: -60%; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(circle, rgb(255 91 53 / .35), transparent 65%); }
    .band .container { position: relative; z-index: 1; }
    .hello { color: #ffb59f; font-weight: 600; }
    h1 { font-size: clamp(1.8rem, 3.6vw, 2.6rem); margin-top: .3rem; }
    .tabs { display: flex; gap: .3rem; margin-top: 1.8rem; }
    .tabs a { display: inline-flex; align-items: center; gap: .45rem; padding: .75rem 1.1rem; border-radius: 12px 12px 0 0; color: rgb(255 255 255 / .75); font-weight: 600; text-decoration: none; }
    .tabs a:hover { color: #fff; background: rgb(255 255 255 / .06); }
    .tabs a.on { background: var(--paper); color: var(--ink); }
    .content { padding: 2rem 0 4rem; min-height: 50vh; }
  `],
})
export class AccountLayoutComponent {
  protected readonly auth = inject(AuthService);
}
