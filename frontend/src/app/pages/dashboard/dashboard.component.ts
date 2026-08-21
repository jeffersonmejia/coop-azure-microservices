import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NavBarComponent,
  ],
  template: `
    <app-nav-bar />
    <div class="page">
      <div class="welcome-section">
        <div class="welcome-text">
          <span class="eyebrow">Tu espacio como socio</span>
          <h1 class="page-header">Hola, {{ user?.firstName || 'bienvenido' }}</h1>
          <p class="welcome-sub">Servicios pensados para ti y nuestra comunidad.</p>
        </div>
        <img src="vector/payments.svg" alt="Ilustración de pagos digitales" class="welcome-illustration" width="160" height="120" />
      </div>

      <div class="dashboard-grid">
      @if (loadingAccounts) {
        <div class="account-skeleton" aria-label="Cargando cuenta">
          <span class="skeleton skeleton-short"></span>
          <span class="skeleton skeleton-medium"></span>
          <span class="skeleton skeleton-balance"></span>
        </div>
      } @else if (account) {
        <mat-card class="account-card">
          <mat-card-header>
            <mat-card-title class="account-number">{{ account.accountNumber }}</mat-card-title>
            <mat-card-subtitle>Cuenta {{ account.status }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="balance"><mat-icon>account_balance_wallet</mat-icon> Saldo disponible</div>
            <div class="balance-value">
              {{ account.balance | currency: 'USD' : 'symbol' : '1.2-2' }}
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="pay-card">
        <mat-card-header>
          <mat-card-title>Gestionar pago</mat-card-title>
          <mat-card-subtitle>Organiza tus pagos de manera simple</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form #paymentForm="ngForm" (ngSubmit)="pay(paymentForm)" novalidate>
            <mat-form-field appearance="outline">
              <mat-label>Cuenta destino</mat-label>
              <input matInput name="paymentAccount" #paymentAccountField="ngModel" [(ngModel)]="paymentAccount" required />
              @if (paymentAccountField.hasError('required')) {
                <mat-error>Ingresa la cuenta donde realizarás el pago.</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Monto</mat-label>
              <input
                matInput
                type="number"
                min="0.01"
                step="0.01"
                name="paymentAmount"
                #paymentAmountField="ngModel"
                [(ngModel)]="paymentAmount"
                required
              />
              @if (paymentAmountField.hasError('required')) {
                <mat-error>Ingresa el monto del pago.</mat-error>
              } @else if (paymentAmountField.hasError('min')) {
                <mat-error>El monto debe ser mayor a cero.</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Descripción</mat-label>
              <input matInput name="paymentDescription" [(ngModel)]="paymentDescription" />
            </mat-form-field>
            <button
              mat-flat-button
              type="submit"
              color="primary"
              [disabled]="paying"
              class="submit-btn"
            >
              @if (paying) {
                <mat-spinner [diameter]="20" class="btn-spinner"></mat-spinner>
                <span>Procesando...</span>
              } @else {
                <span class="btn-content">
                  <mat-icon>payment</mat-icon>
                  <span>Pagar</span>
                </span>
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-bottom: 60px;
    }

    .welcome-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .welcome-text {
      flex: 1;
    }

    .welcome-sub {
      color: var(--coop-text-secondary);
      margin-top: 4px;
      font-family: var(--coop-font);
    }
    .eyebrow { display: block; margin-bottom: 8px; color: var(--coop-accent); font-size: 13px; font-weight: 650; letter-spacing: .07em; text-transform: uppercase; }

    .welcome-illustration {
      width: 160px;
      height: auto;
      margin-left: 24px;
    }
    .dashboard-grid { display: grid; grid-template-columns: minmax(0, .9fr) minmax(360px, 1.1fr); gap: 24px; align-items: start; }

    .account-skeleton { min-height: 197px; padding: 24px; border: 1px solid var(--coop-border); border-radius: var(--coop-radius-lg); background: #fff; }
    .account-skeleton .skeleton + .skeleton { margin-top: 14px; }
    .skeleton-short { width: 38%; height: 15px; }
    .skeleton-medium { width: 60%; height: 12px; }
    .skeleton-balance { width: 72%; height: 42px; margin-top: 58px !important; }

    .account-card {
      min-height: 245px;
      overflow: hidden;
      color: #fff;
      background: linear-gradient(145deg, #1e7b3d, #145b2c) !important;
      border: 0 !important;
      box-shadow: none !important;
    }
    .account-card::after { content: ''; position: absolute; width: 210px; height: 210px; right: -75px; bottom: -100px; border: 42px solid rgb(255 255 255 / 9%); border-radius: 50%; }
    .account-card mat-card-title, .account-card mat-card-subtitle { color: #fff; }
    .account-card mat-card-subtitle { opacity: .72; }
    .account-card mat-card-content { position: relative; z-index: 1; padding-top: 44px !important; }
    .account-card:hover { transform: translateY(-2px); }

    .account-number {
      font-size: 16px;
      font-weight: 500;
    }

    .balance {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgb(255 255 255 / 74%);
      font-size: 14px;
      font-family: var(--coop-font);
    }
    .balance mat-icon { width: 18px; height: 18px; font-size: 18px; }

    .balance-value {
      font-size: 40px;
      font-weight: 500;
      margin-top: 8px;
      color: #fff;
      font-family: var(--coop-font);
    }

    .pay-card {
      min-height: 245px;
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 48px;
      font-family: var(--coop-font);
      border: none;
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
    @media (max-width: 760px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .welcome-illustration { width: 120px; }
    }
    @media (max-width: 460px) {
      .welcome-illustration { display: none; }
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

  pay(form: NgForm): void {
    if (form.invalid || this.paymentAmount === null) {
      form.control.markAllAsTouched();
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
