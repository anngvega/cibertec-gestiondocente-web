// src/app/app.routes.ts
import { Routes } from '@angular/router';
import AUTH_ROUTES from './features/authentication/authentication.routes';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { NoAuthGuard } from './core/auth/guards/noAuth.guard';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout';

export const routes: Routes = [
  // Al entrar a '/', manda al login
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },

  // Segmento público (login, registro, etc.)
  {
    path: 'auth',
    canActivate: [NoAuthGuard],
    children: AUTH_ROUTES, // aquí vive /auth/login
  },

  // Todo lo privado va dentro del layout (header/sidebar persistentes)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'alumnos',
        loadComponent: () =>
          import('./features/alumno/components/alumno/alumno')
            .then(m => m.AlumnoComponent),
      },
      // aquí agregas más páginas privadas:
      // { path: 'users', loadComponent: () => import('./features/users/users').then(m => m.UsersComponent) },
      // { path: 'reports', loadComponent: () => import('./features/reports/reports').then(m => m.ReportsComponent) },
    ],
  },

  // Cualquier otra ruta -> login
  { path: '**', redirectTo: 'auth/login' },
];
