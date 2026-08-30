import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse, UserResponse } from '../models/api-models';

const TOKEN_KEY = 'coop_token';
const REMEMBERED_EMAIL_KEY = 'coop_remembered_email';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly token = signal<string | null>(this.readToken());

  private readToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  login(email: string, password: string, rememberMe: boolean): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(tap((response) => this.saveSession(response.accessToken, email, rememberMe)));
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
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
    this.token.set(null);
  }

  getRememberedEmail(): string {
    if (typeof window === 'undefined') {
      return '';
    }
    return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';
  }

  private saveSession(accessToken: string, email: string, rememberMe: boolean): void {
    if (typeof window === 'undefined') {
      this.token.set(accessToken);
      return;
    }

    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);

    if (rememberMe) {
      window.localStorage.setItem(TOKEN_KEY, accessToken);
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      window.sessionStorage.setItem(TOKEN_KEY, accessToken);
      window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
    this.token.set(accessToken);
  }
}
