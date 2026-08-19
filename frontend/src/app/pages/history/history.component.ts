import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule,
    MatTableModule,
    NavBarComponent,
  ],
  template: `
    <app-nav-bar />
    <div class="page">
      <h1 class="page-header">Historial de operaciones</h1>
      <mat-card>
        <mat-card-content>
          @if (loading) {
            <div class="empty">
              <mat-spinner [diameter]="32" />
              <span>Cargando...</span>
            </div>
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

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px;
      color: #888;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .amount-cell {
      font-weight: 500;
      color: #2e7d32;
    }

    .type-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-completed {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-pending {
      background: #fff3e0;
      color: #e65100;
    }

    .status-failed {
      background: #ffebee;
      color: #c62828;
    }
  `,
})
export class HistoryComponent implements OnInit {
  displayedColumns = ['occurredAt', 'type', 'amount', 'source', 'destination', 'status'];
  rows: TransactionResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

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
    this.accountService.getTransactions(page, size).subscribe((result) => {
      this.rows = result.content;
      this.totalElements = result.totalElements;
      this.loading = false;
    });
  }
}
