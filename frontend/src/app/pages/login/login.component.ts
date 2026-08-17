import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  template: `
    <div class="page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Bienvenido a Coop EC</mat-card-title>
          <mat-card-subtitle>Ingresa con tu correo y contraseña</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="submit()">
            <mat-form-field>
              <mat-label>Correo</mat-label>
              <input
                matInput
                type="email"
                name="email"
                [(ngModel)]="email"
                required
              />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                type="password"
                name="password"
                [(ngModel)]="password"
                required
              />
            </mat-form-field>
            <button
              mat-flat-button
              type="submit"
              color="primary"
              class="full-width"
              [disabled]="submitting"
            >
              Ingresar
            </button>
          </form>
          <p class="auth-link">
            ¿No tienes cuenta?
            <a routerLink="/register">Regístrate aquí</a>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .auth-card {
      max-width: 400px;
      margin: 64px auto;
      padding: 24px;
    }

    .auth-link {
      margin-top: 16px;
      text-align: center;
    }
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  submitting = false;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  submit(): void {
    if (!this.email || !this.password) {
      return;
    }
    this.submitting = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Credenciales inválidas', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
