import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountResponse, Page, TransactionResponse } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  getMyAccounts(): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>('/api/accounts/me');
  }

  getTransactions(page: number, size: number): Observable<Page<TransactionResponse>> {
    return this.http.get<Page<TransactionResponse>>('/api/accounts/me/transactions', {
      params: { page, size },
    });
  }

  transfer(destinationAccount: string, amount: number): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>('/api/accounts/transfer', {
      destinationAccount,
      amount,
    });
  }
}
