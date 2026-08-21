import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FooterComponent } from '../../components/footer.component';

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
    FooterComponent,
  ],
  template: `
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-story">
          <span class="story-kicker"><mat-icon>diversity_3</mat-icon> Cooperativa de ahorro y crédito</span>
          <h2>De nuestros socios,<br />para nuestros socios.</h2>
          <p>Somos una organización propiedad de sus socios. Brindamos servicios financieros para apoyar el bienestar y crecimiento de nuestros miembros.</p>
          <img src="vector/auth.svg" alt="Socio gestionando su cuenta cooperativa" class="auth-illustration" width="400" height="300" />
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-form">
          <div class="auth-brand"><span><mat-icon>account_balance</mat-icon></span> Cooperativa <strong>EC</strong></div>
          <h1>Iniciar sesión</h1>
          <p class="form-subtitle">Accede a tu cuenta en Cooperativa Ecuador</p>
          <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)" novalidate>
            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input
                matInput
                type="email"
                name="email"
                #emailField="ngModel"
                [(ngModel)]="email"
                required
                email
                autocomplete="email"
              />
              <mat-icon matPrefix>email</mat-icon>
              @if (emailField.hasError('required')) {
                <mat-error>Ingresa tu correo electrónico.</mat-error>
              } @else if (emailField.hasError('email')) {
                <mat-error>Escribe un correo válido, por ejemplo nombre&#64;correo.com.</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                name="password"
                #passwordField="ngModel"
                [(ngModel)]="password"
                (ngModelChange)="errorMessage.set('')"
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
              @if (passwordField.hasError('required')) {
                <mat-error>Ingresa tu contraseña.</mat-error>
              }
            </mat-form-field>
            @if (errorMessage()) {
              <div class="field-error" role="alert">{{ errorMessage() }}</div>
            }
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
                <span class="btn-content">
                  <mat-icon>login</mat-icon>
                  <span>Ingresar</span>
                </span>
              }
            </button>
          </form>
          <p class="switch-text">
            ¿No tienes cuenta?
            <a routerLink="/register">Regístrate aquí</a>
          </p>
        </div>
        <app-footer />
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Credenciales incorrectas. Intenta de nuevo.';
        this.errorMessage.set(msg);
      },
    });
  }
}
