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
      <div class="nav-brand">
        <mat-icon class="brand-icon">account_balance</mat-icon>
        <span class="brand-text">Cooperativa Ecuador</span>
      </div>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <mat-icon>dashboard</mat-icon>
          <span>Dashboard</span>
        </a>
        <a routerLink="/transfer" routerLinkActive="active" class="nav-link">
          <mat-icon>swap_horiz</mat-icon>
          <span>Transferencia</span>
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-link">
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
      height: 64px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon {
      color: #2e7d32;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-text {
      font-size: 18px;
      font-weight: 500;
      color: #1b5e20;
      letter-spacing: 0.3px;
    }

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
      border-radius: 20px;
      border: none;
      background: none;
      color: #4a4a4a;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .nav-link:hover {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .nav-link.active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .nav-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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
