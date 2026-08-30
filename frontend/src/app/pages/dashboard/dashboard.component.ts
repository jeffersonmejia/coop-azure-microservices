import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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
          <h1 class="page-header">Hola, {{ user?.firstName || 'bienvenido' }}</h1>
          <p class="welcome-sub">Servicios pensados para ti y nuestra comunidad.</p>
        </div>
        <img src="vector/payments.svg" alt="Ilustración de pagos digitales" class="welcome-illustration" width="160" height="120" />
      </div>

      @if (profileErrorMessage()) {
        <div class="dashboard-feedback" role="alert">{{ profileErrorMessage() }}</div>
      }

      <section class="dashboard-shell">
        <div class="dashboard-toggle" role="tablist" aria-label="Opciones del dashboard">
          <button mat-button type="button" role="tab" [class.active]="activePanel() === 'account'" [attr.aria-selected]="activePanel() === 'account'" (click)="activePanel.set('account')">
            Mi cuenta
          </button>
          <button mat-button type="button" role="tab" [class.active]="activePanel() === 'payment'" [attr.aria-selected]="activePanel() === 'payment'" (click)="activePanel.set('payment')">
            Gestionar pago
          </button>
        </div>

        @if (activePanel() === 'account') {
          <div class="dashboard-view">
            @if (loadingAccounts) {
              <div class="account-skeleton" aria-label="Cargando cuenta">
                <p class="loading-copy">Cargando tu cuenta...</p>
                <span class="skeleton skeleton-short"></span>
                <span class="skeleton skeleton-medium"></span>
                <span class="skeleton skeleton-balance"></span>
              </div>
            } @else if (account) {
              <mat-card class="account-card">
                <mat-card-header>
                  <mat-card-title class="account-number">{{ account.accountNumber }}</mat-card-title>
                  <mat-card-subtitle>Cuenta {{ getAccountStatusLabel(account.status) }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="balance"><mat-icon>account_balance_wallet</mat-icon> Saldo disponible</div>
                  <div class="balance-value">
                    {{ account.balance | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </div>
                </mat-card-content>
              </mat-card>
            } @else {
              <div class="account-feedback" role="alert">{{ accountErrorMessage() || 'No se encontró una cuenta disponible.' }}</div>
            }
          </div>
        } @else {
          <div class="dashboard-view payment-view">
            <div class="payment-heading">
              <h2>Gestionar pago</h2>
              <p>Organiza tus pagos de manera simple.</p>
            </div>
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
                <span class="loading-content">
                  <mat-spinner [diameter]="20" class="btn-spinner"></mat-spinner>
                  <span>Procesando...</span>
                </span>
              } @else {
                <span class="btn-content">
                  <mat-icon>payment</mat-icon>
                  <span>Pagar</span>
                </span>
              }
            </button>
          </form>
          </div>
        }
      </section>
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
    .welcome-illustration {
      width: 160px;
      height: auto;
      margin-left: 24px;
    }
    .dashboard-shell { overflow: hidden; border: 1px solid var(--coop-border-light); border-radius: var(--coop-radius-lg); background: #fff; }
    .dashboard-toggle { display: flex; gap: 6px; padding: 10px; border-bottom: 1px solid var(--coop-border-light); background: var(--coop-surface-variant); }
    .dashboard-toggle button { min-height: 40px; padding: 0 18px; border-radius: 10px; color: var(--coop-text-secondary); font-weight: 560; }
    .dashboard-toggle button.active { color: var(--coop-green-900); background: #fff; box-shadow: 0 1px 3px rgb(20 56 31 / 10%); }
    .dashboard-view { min-height: 276px; padding: 28px; }
    .dashboard-feedback, .account-feedback { padding: 12px 14px; border: 1px solid var(--coop-error-border); border-radius: var(--coop-radius); color: var(--coop-error); background: var(--coop-error-bg); font-size: 14px; line-height: 1.4; }
    .dashboard-feedback { margin: -12px 0 20px; }
    .account-feedback { min-height: 197px; box-sizing: border-box; }

    .account-skeleton { min-height: 197px; padding: 24px; border: 1px solid var(--coop-border); border-radius: var(--coop-radius); background: var(--coop-surface-variant); }
    .loading-copy { margin: 0 0 16px; color: var(--coop-text-secondary); font-size: 14px; }
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

    .payment-view { max-width: 520px; }
    .payment-heading { margin-bottom: 20px; }
    .payment-heading h2 { margin: 0; color: var(--coop-text-primary); font-size: 22px; font-weight: 560; }
    .payment-heading p { margin: 6px 0 0; color: var(--coop-text-secondary); font-size: 14px; }

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

    .loading-content { display: inline-flex; align-items: center; gap: 8px; line-height: 1; }

    .btn-content mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin: 0;
      vertical-align: middle;
    }

    .btn-spinner { display: block; flex: 0 0 auto; }
    @media (max-width: 760px) {
      .welcome-illustration { width: 120px; }
      .dashboard-view { padding: 20px; }
    }
    @media (max-width: 460px) {
      .welcome-illustration { display: none; }
      .dashboard-toggle button { flex: 1; padding: 0 10px; }
    }
  `,
})
export class DashboardComponent implements OnInit {
  user: UserResponse | null = null;
  accounts: AccountResponse[] = [];
  account: AccountResponse | null = null;
  loadingAccounts = true;
  readonly profileErrorMessage = signal('');
  readonly accountErrorMessage = signal('');
  readonly activePanel = signal<'account' | 'payment'>('account');
  paymentAccount = '';
  paymentAmount: number | null = null;
  paymentDescription = '';
  paying = false;

  private readonly auth = inject(AuthService);
  private readonly accountService = inject(AccountService);
  private readonly paymentService = inject(PaymentService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (user) => (this.user = user),
      error: (error) => this.profileErrorMessage.set(this.getErrorMessage(error, 'No se pudo cargar tu perfil.')),
    });
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loadingAccounts = true;
    this.accountErrorMessage.set('');
    this.accountService.getMyAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.account = accounts[0] ?? null;
        if (this.account) {
          this.paymentAccount = this.account.accountNumber;
        }
        this.loadingAccounts = false;
      },
      error: (error) => {
        this.account = null;
        this.accountErrorMessage.set(this.getErrorMessage(error, 'No se pudo cargar tu cuenta.'));
        this.loadingAccounts = false;
      },
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
        error: (error) => {
          this.paying = false;
          this.snackBar.open(this.getErrorMessage(error, 'No se pudo realizar el pago.'), 'Cerrar', { duration: 4000 });
        },
      });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const response = error as { error?: { message?: string }; message?: string };
      return response.error?.message || response.message || fallback;
    }
    return fallback;
  }

  getAccountStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'activa',
      INACTIVE: 'inactiva',
      BLOCKED: 'bloqueada',
      CLOSED: 'cerrada',
    };
    return labels[status] ?? status;
  }
}
