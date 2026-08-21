import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', title: 'Iniciar sesión | Cooperativa Ecuador', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', title: 'Crear cuenta | Cooperativa Ecuador', loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent) },
  { path: 'dashboard', title: 'Resumen | Cooperativa Ecuador', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
  { path: 'transfer', title: 'Transferir | Cooperativa Ecuador', canActivate: [authGuard], loadComponent: () => import('./pages/transfer/transfer.component').then((m) => m.TransferComponent) },
  { path: 'history', title: 'Movimientos | Cooperativa Ecuador', canActivate: [authGuard], loadComponent: () => import('./pages/history/history.component').then((m) => m.HistoryComponent) },
  { path: '**', redirectTo: 'login' },
];
