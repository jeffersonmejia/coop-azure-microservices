import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page, PaymentResponse } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  createPayment(
    accountNumber: string,
    amount: number,
    description: string,
  ): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>('/api/payments', {
      accountNumber,
      amount,
      description,
    });
  }

  getPayments(page: number, size: number): Observable<Page<PaymentResponse>> {
    return this.http.get<Page<PaymentResponse>>('/api/payments', {
      params: { page, size },
    });
  }
}
