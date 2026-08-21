import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [MatIconModule, MatTooltipModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a class="nav-brand" routerLink="/dashboard" aria-label="Ir al resumen">
        <span class="brand-mark"><mat-icon class="brand-icon">account_balance</mat-icon></span>
        <span class="brand-text">Cooperativa <strong>EC</strong></span>
      </a>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" matTooltip="Resumen">
          <mat-icon>dashboard</mat-icon>
          <span>Dashboard</span>
        </a>
        <a routerLink="/transfer" routerLinkActive="active" class="nav-link" matTooltip="Transferir">
          <mat-icon>swap_horiz</mat-icon>
          <span>Transferencia</span>
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-link" matTooltip="Movimientos">
          <mat-icon>history</mat-icon>
          <span>Historial</span>
        </a>
        <button class="nav-link" (click)="logout()" matTooltip="Cerrar sesión">
          <mat-icon>logout</mat-icon>
          <span>Salir</span>
        </button>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      height: 72px;
      background: rgb(255 255 255 / 88%);
      border-bottom: 1px solid rgb(220 229 222 / 80%);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 1000;
      font-family: var(--coop-font);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      color: inherit;
      text-decoration: none;
    }

    .brand-mark { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--coop-accent); border-radius: 12px; background: var(--coop-accent); }

    .brand-icon {
      color: #fff;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .brand-text {
      font-size: 17px;
      font-weight: 450;
      color: var(--coop-text-primary);
      letter-spacing: -0.01em;
    }
    .brand-text strong { color: var(--coop-accent); font-weight: 700; }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 12px;
      border: none;
      background: none;
      color: var(--coop-text-secondary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: color 160ms var(--coop-ease), background 160ms var(--coop-ease), transform 160ms var(--coop-ease);
      font-family: var(--coop-font);
    }

    .nav-link:hover {
      background: var(--coop-green-50);
      color: var(--coop-accent);
      transform: translateY(-1px);
    }

    .nav-link.active {
      background: var(--coop-green-100);
      color: var(--coop-accent);
    }

    .nav-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 720px) {
      .navbar { height: 64px; padding: 0 14px; }
      .brand-text { display: none; }
      .nav-links { gap: 2px; }
      .nav-link { padding: 10px; }
      .nav-link span { display: none; }
    }
  `,
})
export class NavBarComponent {
  private readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}
