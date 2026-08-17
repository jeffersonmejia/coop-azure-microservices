import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { NavBarComponent } from '../../components/nav-bar.component';

@Component({
  selector: 'app-transfer',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NavBarComponent,
  ],
  template: `
    <app-nav-bar />
    <div class="page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Transferencia</mat-card-title>
          <mat-card-subtitle>Envía dinero a otra cuenta</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="submit()">
            <mat-form-field>
              <mat-label>Cuenta destino</mat-label>
              <input matInput name="destination" [(ngModel)]="destination" required />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Monto</mat-label>
              <input
                matInput
                type="number"
                min="0.01"
                step="0.01"
                name="amount"
                [(ngModel)]="amount"
                required
              />
            </mat-form-field>
            <button
              mat-flat-button
              type="submit"
              color="primary"
              [disabled]="submitting"
            >
              Transferir
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    mat-card {
      max-width: 480px;
      margin: 32px auto;
      padding: 24px;
    }
  `,
})
export class TransferComponent {
  destination = '';
  amount: number | null = null;
  submitting = false;

  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  submit(): void {
    if (!this.destination || !this.amount) {
      return;
    }
    this.submitting = true;
    this.accountService.transfer(this.destination, this.amount).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Transferencia realizada con éxito', 'Cerrar', {
          duration: 4000,
        });
        this.destination = '';
        this.amount = null;
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('No se pudo realizar la transferencia', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }
}
