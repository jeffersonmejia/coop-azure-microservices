import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
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
                <td mat-cell *matCellDef="let row">{{ row.type }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Monto</th>
                <td mat-cell *matCellDef="let row">
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
                <td mat-cell *matCellDef="let row">{{ row.status }}</td>
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

          @if (loading) {
            <div class="empty"><mat-spinner [diameter]="32" /></div>
          } @else if (!rows.length) {
            <div class="empty">Sin operaciones registradas</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .table-wrap {
      overflow-x: auto;
    }

    .empty {
      padding: 24px;
      text-align: center;
      color: #6b5a85;
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
