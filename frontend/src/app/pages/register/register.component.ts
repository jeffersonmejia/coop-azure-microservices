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
  selector: 'app-register',
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
          <mat-card-title>Crear cuenta</mat-card-title>
          <mat-card-subtitle>Únete a la cooperativa</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="submit()">
            <mat-form-field>
              <mat-label>Nombre</mat-label>
              <input matInput name="firstName" [(ngModel)]="firstName" required />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Apellido</mat-label>
              <input matInput name="lastName" [(ngModel)]="lastName" required />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Correo</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email" required />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                type="password"
                name="password"
                [(ngModel)]="password"
                minlength="8"
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
              Registrarme
            </button>
          </form>
          <p class="auth-link">
            ¿Ya tienes cuenta?
            <a routerLink="/login">Ingresa aquí</a>
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
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  submitting = false;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  submit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      return;
    }
    this.submitting = true;
    this.auth.register(this.firstName, this.lastName, this.email, this.password).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Cuenta creada. Ya puedes ingresar', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('No se pudo crear la cuenta', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
