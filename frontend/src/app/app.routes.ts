import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
  { path: 'transfer', canActivate: [authGuard], loadComponent: () => import('./pages/transfer/transfer.component').then((m) => m.TransferComponent) },
  { path: 'history', canActivate: [authGuard], loadComponent: () => import('./pages/history/history.component').then((m) => m.HistoryComponent) },
  { path: '**', redirectTo: 'login' },
];
