import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountService } from '../../services/account.service';
import { NavBarComponent } from '../../components/nav-bar.component';

@Component({
  selector: 'app-transfer',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NavBarComponent,
  ],
  template: `
    <app-nav-bar />
    <div class="page">
      <div class="transfer-header">
        <div class="transfer-text">
          <h1 class="page-header">Transferencia</h1>
          <p class="transfer-sub">Envía dinero a otra cuenta de forma segura</p>
        </div>
        <img src="vector/account.svg" alt="Transferencia" class="transfer-illustration" />
      </div>
      <mat-card>
        <mat-card-content>
          <form (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Cuenta destino</mat-label>
              <input matInput name="destination" [(ngModel)]="destination" required />
              <mat-icon matPrefix>account_balance</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
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
              <mat-icon matPrefix>attach_money</mat-icon>
            </mat-form-field>
            <button
              mat-flat-button
              type="submit"
              color="primary"
              [disabled]="submitting()"
              class="submit-btn"
            >
              @if (submitting()) {
                <mat-spinner [diameter]="20" class="btn-spinner"></mat-spinner>
                <span>Procesando...</span>
              } @else {
                <span class="btn-content">
                  <mat-icon>send</mat-icon>
                  <span>Transferir</span>
                </span>
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-bottom: 60px;
    }

    .transfer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .transfer-text {
      flex: 1;
    }

    .transfer-sub {
      color: var(--coop-text-muted);
      margin-top: 4px;
      font-family: var(--coop-font);
    }

    .transfer-illustration {
      width: 140px;
      height: auto;
      margin-left: 24px;
    }

    mat-card {
      max-width: 480px;
      padding: 24px;
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 48px;
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
  `,
})
export class TransferComponent {
  destination = '';
  amount: number | null = null;
  submitting = signal(false);

  private readonly accountService = inject(AccountService);
  private readonly snackBar = inject(MatSnackBar);

  submit(): void {
    if (!this.destination || !this.amount) {
      return;
    }
    this.submitting.set(true);
    this.accountService.transfer(this.destination, this.amount).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Transferencia realizada con éxito', 'Cerrar', {
          duration: 4000,
        });
        this.destination = '';
        this.amount = null;
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open('No se pudo realizar la transferencia', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }
}
