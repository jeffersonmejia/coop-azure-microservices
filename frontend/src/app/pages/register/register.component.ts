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
  selector: 'app-register',
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
          <h1>Crear cuenta</h1>
          @if (errorMessage()) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput name="firstName" [(ngModel)]="firstName" required />
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Apellido</mat-label>
              <input matInput name="lastName" [(ngModel)]="lastName" required />
              <mat-icon matPrefix>person_outline</mat-icon>
            </mat-form-field>
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
                autocomplete="new-password"
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
                <span>Registrando...</span>
              } @else {
                <span class="btn-content">
                  <mat-icon>person_add</mat-icon>
                  <span>Registrarse</span>
                </span>
              }
            </button>
          </form>
          <p class="switch-text">
            ¿Ya tienes cuenta?
            <a routerLink="/login">Inicia sesión</a>
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
      background: var(--coop-green-100);
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
      color: var(--coop-green-800);
      margin-bottom: 32px;
      text-align: center;
      font-family: var(--coop-font);
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      background: var(--coop-error-bg);
      border: 1px solid var(--coop-error-border);
      border-radius: var(--coop-radius);
      color: var(--coop-error);
      font-size: 14px;
      font-family: var(--coop-font);
    }

    .error-banner mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 16px;
      font-family: var(--coop-font);
      background: var(--coop-green-100) !important;
      color: var(--coop-green-800) !important;
      border: none;
    }

    .submit-btn:hover {
      background: var(--coop-green-200) !important;
    }

    .btn-content {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      line-height: 1;
    }

    .btn-content mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin: 0;
      vertical-align: middle;
    }

    .btn-spinner {
      display: inline-block;
    }

    .switch-text {
      text-align: center;
      margin-top: 24px;
      color: var(--coop-text-muted);
      font-size: 14px;
      font-family: var(--coop-font);
    }

    .switch-text a {
      color: var(--coop-green-600);
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
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      return;
    }
    this.errorMessage.set('');
    this.loading.set(true);
    this.auth.register(this.firstName, this.lastName, this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Error al registrar. Intenta de nuevo.';
        this.errorMessage.set(msg);
      },
    });
  }
}
