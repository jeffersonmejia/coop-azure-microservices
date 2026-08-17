import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountResponse, UserResponse } from '../../models/api-models';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { NavBarComponent } from '../../components/nav-bar.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NavBarComponent,
  ],
  template: `
    <app-nav-bar />
    <div class="page">
      <h1 class="page-header">Hola, {{ user?.firstName }}</h1>

      @if (loadingAccounts) {
        <mat-spinner [diameter]="32" />
      } @else if (account) {
        <mat-card class="account-card">
          <mat-card-header>
            <mat-card-title>{{ account.accountNumber }}</mat-card-title>
            <mat-card-subtitle>Cuenta {{ account.status }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="balance">Saldo disponible</div>
            <div class="balance-value">
              {{ account.balance | currency: 'USD' : 'symbol' : '1.2-2' }}
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="pay-card">
        <mat-card-header>
          <mat-card-title>Realizar pago</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="pay()">
            <mat-form-field>
              <mat-label>Cuenta destino</mat-label>
              <input matInput name="paymentAccount" [(ngModel)]="paymentAccount" required />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Monto</mat-label>
              <input
                matInput
                type="number"
                min="0.01"
                step="0.01"
                name="paymentAmount"
                [(ngModel)]="paymentAmount"
                required
              />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Descripción</mat-label>
              <input matInput name="paymentDescription" [(ngModel)]="paymentDescription" />
            </mat-form-field>
            <button
              mat-flat-button
              type="submit"
              color="primary"
              [disabled]="paying"
            >
              Pagar
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .account-card {
      margin-bottom: 24px;
    }

    .balance {
      color: #6b5a85;
    }

    .balance-value {
      font-size: 40px;
      font-weight: 500;
      margin-top: 8px;
      color: #5e3fa8;
    }

    .pay-card {
      margin-bottom: 24px;
    }
  `,
})
export class DashboardComponent implements OnInit {
  user: UserResponse | null = null;
  accounts: AccountResponse[] = [];
  account: AccountResponse | null = null;
  loadingAccounts = true;
  paymentAccount = '';
  paymentAmount: number | null = null;
  paymentDescription = '';
  paying = false;

  private readonly auth = inject(AuthService);
  private readonly accountService = inject(AccountService);
  private readonly paymentService = inject(PaymentService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.auth.me().subscribe((user) => (this.user = user));
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loadingAccounts = true;
    this.accountService.getMyAccounts().subscribe((accounts) => {
      this.accounts = accounts;
      this.account = accounts[0] ?? null;
      if (this.account) {
        this.paymentAccount = this.account.accountNumber;
      }
      this.loadingAccounts = false;
    });
  }

  pay(): void {
    if (!this.paymentAccount || !this.paymentAmount) {
      return;
    }
    this.paying = true;
    this.paymentService
      .createPayment(this.paymentAccount, this.paymentAmount, this.paymentDescription)
      .subscribe({
        next: (payment) => {
          this.paying = false;
          if (payment.status === 'COMPLETED') {
            this.snackBar.open('Pago realizado con éxito', 'Cerrar', { duration: 4000 });
            this.paymentAmount = null;
            this.paymentDescription = '';
            this.loadAccounts();
          } else {
            this.snackBar.open('El pago fue rechazado', 'Cerrar', { duration: 4000 });
          }
        },
        error: () => {
          this.paying = false;
          this.snackBar.open('No se pudo realizar el pago', 'Cerrar', { duration: 4000 });
        },
      });
  }
}
