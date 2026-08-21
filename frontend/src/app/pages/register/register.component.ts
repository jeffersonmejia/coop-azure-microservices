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
  selector: 'app-register',
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
    <div class="auth-container register-page">
      <div class="auth-left">
        <div class="auth-story">
          <span class="story-kicker"><mat-icon>diversity_3</mat-icon> Una cooperativa de sus socios</span>
          <h2>Tu participación<br />construye comunidad.</h2>
          <p>Al abrir una cuenta y cumplir los requisitos de afiliación, puedes formar parte de la cooperativa y acceder a servicios financieros pensados para sus miembros.</p>
          <img src="vector/auth.svg" alt="Nuevo socio uniéndose a Cooperativa Ecuador" class="auth-illustration" width="400" height="300" />
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-form">
          <div class="auth-brand"><span><mat-icon>account_balance</mat-icon></span> Cooperativa <strong>EC</strong></div>
          <h1>Crear cuenta</h1>
          <p class="form-subtitle">Crea tu cuenta para iniciar el proceso</p>
          <form #registerForm="ngForm" (ngSubmit)="onSubmit(registerForm)" novalidate>
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput name="firstName" #firstNameField="ngModel" [(ngModel)]="firstName" required autocomplete="given-name" />
              <mat-icon matPrefix>person</mat-icon>
              @if (firstNameField.hasError('required')) {
                <mat-error>Ingresa tu nombre.</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Apellido</mat-label>
              <input matInput name="lastName" #lastNameField="ngModel" [(ngModel)]="lastName" required autocomplete="family-name" />
              <mat-icon matPrefix>person_outline</mat-icon>
              @if (lastNameField.hasError('required')) {
                <mat-error>Ingresa tu apellido.</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input
                matInput
                type="email"
                name="email"
                #emailField="ngModel"
                [(ngModel)]="email"
                (ngModelChange)="errorMessage.set('')"
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
            @if (errorMessage()) {
              <div class="field-error" role="alert">{{ errorMessage() }}</div>
            }
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                name="password"
                #passwordField="ngModel"
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
              @if (passwordField.hasError('required')) {
                <mat-error>Crea una contraseña para tu cuenta.</mat-error>
              }
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
        <app-footer />
      </div>
    </div>
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

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
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
