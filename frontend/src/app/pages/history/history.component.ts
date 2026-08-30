import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { TransactionResponse } from '../../models/api-models';
import { AccountService } from '../../services/account.service';
import { NavBarComponent } from '../../components/nav-bar.component';

@Component({
  selector: 'app-history',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    NavBarComponent,
  ],
  template: `
    <app-nav-bar />
    <div class="page">
      <div class="history-heading">
        <div>
          <span class="eyebrow">Actividad de tu cuenta</span>
          <h1 class="page-header">Movimientos</h1>
          <p>Revisa tus pagos y transferencias recientes.</p>
        </div>
        <span class="history-icon"><mat-icon>receipt_long</mat-icon></span>
      </div>
      <mat-card>
        <mat-card-content>
          @if (loading) {
            <div class="table-skeleton" aria-label="Cargando movimientos">
              @for (item of skeletonRows; track item) {
                <div class="skeleton-row">
                  <span class="skeleton skeleton-date"></span>
                  <span class="skeleton skeleton-type"></span>
                  <span class="skeleton skeleton-amount"></span>
                  <span class="skeleton skeleton-status"></span>
                </div>
              }
            </div>
          } @else if (errorMessage) {
            <div class="history-error" role="alert">{{ errorMessage }}</div>
          } @else if (!rows.length) {
            <div class="empty">
              <mat-icon class="empty-icon">history</mat-icon>
              <span>Sin operaciones registradas</span>
            </div>
          } @else {
            <div class="table-wrap">
              <table mat-table [dataSource]="rows">
                <ng-container matColumnDef="occurredAt">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let row">
                    {{ row.occurredAt | date: 'short' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="type-badge">{{ row.type }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let row" class="amount-cell">
                    {{ row.amount | currency: 'USD' : 'symbol' : '1.2-2' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="source">
                  <th mat-header-cell *matHeaderCellDef>Cuenta origen</th>
                  <td mat-cell *matCellDef="let row">
                    {{ row.sourceAccountNumber ?? '-' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="destination">
                  <th mat-header-cell *matHeaderCellDef>Cuenta destino</th>
                  <td mat-cell *matCellDef="let row">
                    {{ row.destinationAccountNumber ?? '-' }}
                  </td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let row">
                    <span [class]="'status-badge status-' + row.status.toLowerCase()">
                      {{ row.status }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            </div>

            <mat-paginator
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 20]"
              (page)="onPage($event)"
              showFirstLastButtons
            />
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-bottom: 60px;
    }

    .table-wrap {
      overflow-x: auto;
    }
    .table-skeleton { padding: 4px 0; }
    .skeleton-row { display: grid; grid-template-columns: 1.3fr .8fr 1fr .7fr; gap: 24px; align-items: center; min-height: 58px; padding: 0 8px; border-bottom: 1px solid var(--coop-border-light); }
    .skeleton-row .skeleton { height: 13px; }
    .skeleton-date { width: 80%; }
    .skeleton-type { width: 70%; }
    .skeleton-amount { width: 75%; }
    .skeleton-status { width: 82%; height: 24px !important; border-radius: 999px; }
    .history-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .history-heading p { margin: 6px 0 0; color: var(--coop-text-secondary); }
    .eyebrow { display: block; margin-bottom: 8px; color: var(--coop-accent); font-size: 13px; font-weight: 650; letter-spacing: .07em; text-transform: uppercase; }
    .history-icon { display: grid; width: 54px; height: 54px; place-items: center; border-radius: 18px; color: var(--coop-accent); background: var(--coop-green-100); }
    .history-icon mat-icon { width: 26px; height: 26px; font-size: 26px; }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px;
      color: var(--coop-text-muted);
      font-family: var(--coop-font);
    }

    .history-error { padding: 14px; border: 1px solid var(--coop-error-border); border-radius: var(--coop-radius); color: var(--coop-error); background: var(--coop-error-bg); font-size: 14px; }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--coop-border);
    }

    .amount-cell {
      font-weight: 500;
      color: var(--coop-accent);
    }

    .type-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: var(--coop-radius-lg);
      background: var(--coop-green-50);
      color: var(--coop-accent);
      font-size: 12px;
      font-weight: 500;
      font-family: var(--coop-font);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: var(--coop-radius-lg);
      font-size: 12px;
      font-weight: 500;
      font-family: var(--coop-font);
    }

    .status-completed {
      background: var(--coop-green-50);
      color: var(--coop-accent);
    }

    .status-pending {
      background: #fff3e0;
      color: #e65100;
    }

    .status-failed {
      background: var(--coop-error-bg);
      color: var(--coop-error);
    }
    table { width: 100%; }
    tr.mat-mdc-row { transition: background 150ms var(--coop-ease); }
    tr.mat-mdc-row:hover { background: var(--coop-green-50); }
  `,
})
export class HistoryComponent implements OnInit {
  readonly skeletonRows = [1, 2, 3, 4, 5];
  displayedColumns = ['occurredAt', 'type', 'amount', 'source', 'destination', 'status'];
  rows: TransactionResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  errorMessage = '';

  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    this.loadPage(0, this.pageSize);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPage(this.pageIndex, this.pageSize);
  }

  private loadPage(page: number, size: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.accountService.getTransactions(page, size).subscribe({
      next: (result) => {
        this.rows = result.content;
        this.totalElements = result.totalElements;
        this.loading = false;
      },
      error: (error: unknown) => {
        const response = error as { error?: { message?: string }; message?: string };
        this.errorMessage = response.error?.message || response.message || 'No se pudieron cargar los movimientos.';
        this.loading = false;
      },
    });
  }
}
