import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse, UserResponse } from '../models/api-models';

const TOKEN_KEY = 'coop_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly token = signal<string | null>(this.readToken());

  private readToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(tap((response) => this.saveToken(response.accessToken)));
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Observable<UserResponse> {
    return this.http.post<UserResponse>('/api/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/auth/me');
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    this.token.set(null);
  }

  private saveToken(accessToken: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, accessToken);
    }
    this.token.set(accessToken);
  }
}
