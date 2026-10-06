import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../layout/footer/footer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'at-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, FooterComponent],
  template: `
    <div class="shell" [class.nav-open]="navOpen()">
      <aside class="side">
        <a routerLink="/" class="brand">
          <span class="glyph"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 17.5 27 7l-5.6 18.5-5.4-5.6-3.7 4.3v-5.6L23.5 10 9.8 16.4Z" /></svg></span>
          <span><b>aerotrip</b><small>Admin console</small></span>
        </a>
        <nav (click)="navOpen.set(false)">
          <a routerLink="/admin" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }"><at-icon name="chart" />Overview</a>
          <a routerLink="/admin/bookings" routerLinkActive="on"><at-icon name="ticket" />Bookings</a>
          <a routerLink="/admin/flights" routerLinkActive="on"><at-icon name="plane" />Flights</a>
          <a routerLink="/admin/offers" routerLinkActive="on"><at-icon name="tag" />Offers and discounts</a>
          <a routerLink="/admin/users" routerLinkActive="on"><at-icon name="users" />Users</a>
          <hr />
          <a routerLink="/flights"><at-icon name="globe" />Open customer site</a>
        </nav>
        <div class="me">
          <span class="avatar">{{ auth.initials() }}</span>
          <div><b>{{ auth.user()?.fullName }}</b><small>{{ auth.user()?.email }}</small></div>
          <button type="button" (click)="auth.logout()" aria-label="Log out" title="Log out"><at-icon name="logout" /></button>
        </div>
      </aside>
      <div class="main">
        <header class="mtop">
          <button type="button" class="btn btn-ghost btn-icon" (click)="navOpen.set(!navOpen())" aria-label="Menu"><at-icon name="menu" /></button>
          <b>aerotrip admin</b>
        </header>
        <div class="content"><router-outlet /></div>
        <at-footer [compact]="true" />
      </div>
    </div>
  `,
  styles: [`
    .shell { display: grid; grid-template-columns: 252px 1fr; min-height: 100vh; }
    .side { position: sticky; top: 0; height: 100vh; background: var(--ink); color: #c5cedd; display: flex; flex-direction: column; padding: 1.2rem .9rem; }
    .brand { display: flex; align-items: center; gap: .65rem; color: #fff; text-decoration: none !important; padding: .2rem .5rem 1.6rem; }
    .brand b { display: block; font-family: var(--font-display); font-size: 1.3rem; letter-spacing: -.04em; }
    .brand small { color: #8fa0bf; font-size: .74rem; }
    .glyph { width: 36px; height: 36px; border-radius: 10px; background: rgb(255 255 255 / .1); display: grid; place-items: center; }
    .glyph svg { width: 22px; fill: var(--coral); }
    nav { display: grid; gap: .15rem; flex: 1; align-content: start; }
    nav a { display: flex; align-items: center; gap: .7rem; padding: .65rem .75rem; border-radius: 10px; color: #c5cedd; font-weight: 500; font-size: .92rem; text-decoration: none !important; }
    nav a:hover { background: rgb(255 255 255 / .06); color: #fff; }
    nav a.on { background: rgb(255 255 255 / .1); color: #fff; box-shadow: inset 3px 0 var(--coral); }
    hr { border: 0; border-top: 1px solid rgb(255 255 255 / .1); margin: .7rem .4rem; }
    .me { display: grid; grid-template-columns: auto 1fr auto; gap: .6rem; align-items: center; padding: .8rem .5rem 0; border-top: 1px solid rgb(255 255 255 / .1); }
    .me div { display: grid; min-width: 0; } .me b { color: #fff; font-size: .86rem; } .me small { font-size: .74rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .me button { border: 0; background: none; color: #8fa0bf; cursor: pointer; } .me button:hover { color: #fff; }
    .avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--plum), var(--cobalt)); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: .8rem; }
    .main { min-width: 0; display: flex; flex-direction: column; }
    .content { flex: 1; padding: 2rem clamp(1rem, 3vw, 2.5rem); }
    .mtop { display: none; }
    @media (max-width: 900px) {
      .shell { grid-template-columns: 1fr; }
      .side { position: fixed; z-index: 80; width: 260px; transform: translateX(-100%); transition: transform .25s; }
      .nav-open .side { transform: none; box-shadow: var(--shadow-lg); }
      .mtop { display: flex; align-items: center; gap: .5rem; padding: .6rem 1rem; background: var(--surface); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 10; }
    }
  `],
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly navOpen = signal(false);
}
