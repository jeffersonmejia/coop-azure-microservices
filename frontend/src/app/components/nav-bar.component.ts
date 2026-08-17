import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [MatToolbarModule, MatButtonModule, RouterLink],
  template: `
    <mat-toolbar>
      <span>Coop EC</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/dashboard">Dashboard</a>
      <a mat-button routerLink="/transfer">Transferencia</a>
      <a mat-button routerLink="/history">Historial</a>
      <button mat-button (click)="logout()">Salir</button>
    </mat-toolbar>
  `,
})
export class NavBarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
