import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <img src="vector/auth.svg" alt="Ilustración" class="auth-illustration" />
      </div>
      <div class="auth-right">
        <div class="auth-form">
          <h1>Iniciar sesión</h1>
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input
                matInput
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                autocomplete="email"
              />
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                name="password"
                [(ngModel)]="password"
                required
                autocomplete="current-password"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="submit-btn"
              [disabled]="loading()"
            >
              @if (loading()) {
                <mat-spinner [diameter]="20" class="btn-spinner"></mat-spinner>
                <span>Ingresando...</span>
              } @else {
                <mat-icon>login</mat-icon>
                <span>Ingresar</span>
              }
            </button>
          </form>
          <p class="switch-text">
            ¿No tienes cuenta?
            <a routerLink="/register">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .auth-container {
      display: flex;
      min-height: 100vh;
    }

    .auth-left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8f5e9;
      padding: 40px;
    }

    .auth-illustration {
      width: 100%;
      max-width: 400px;
      height: auto;
    }

    .auth-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .auth-form {
      width: 100%;
      max-width: 380px;
    }

    .auth-form h1 {
      font-size: 32px;
      font-weight: 500;
      color: #1b5e20;
      margin-bottom: 32px;
      text-align: center;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-spinner {
      display: inline-block;
    }

    .switch-text {
      text-align: center;
      margin-top: 24px;
      color: #666;
      font-size: 14px;
    }

    .switch-text a {
      color: #2e7d32;
      text-decoration: none;
      font-weight: 500;
    }

    .switch-text a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .auth-left {
        display: none;
      }

      .auth-right {
        padding: 24px;
      }
    }
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = signal(true);
  loading = signal(false);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit(): void {
    if (!this.email || !this.password) {
      return;
    }
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
