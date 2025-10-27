import { Routes } from '@angular/router';
import AUTH_ROUTES from './features/authentication/authentication.routes';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { NoAuthGuard } from './core/auth/guards/noAuth.guard';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [NoAuthGuard],
    children: AUTH_ROUTES,
  },
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
        path: 'dashboard-admin',
        loadComponent: () =>
          import('./features/dashboard/dashboard-admin.component').then(m => m.DashboardAdminComponent),
      },
      {
        path: 'alumnos',
        loadComponent: () =>
          import('./features/alumno/components/alumno/alumno').then(m => m.AlumnoComponent),
      },
      {
        path: 'notas',
        loadComponent: () =>
          import('./features/notas/components/nota/notas').then(m => m.NotasComponent),
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./features/reserva/components/reserva/reserva').then(m => m.ReservaComponent),
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./features/solicitudes/components/solicitudes/solicitudes.components').then(m => m.SolicitudesMaterialComponent),
      },
      {
        path: 'solicitudes/reprogramacion',
        loadComponent: () =>
          import('./features/solicitudes/components/solicitudes/solicitudes-reprogramacion.component').then(m => m.SolicitudesReprogramacionComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' }
    ],
  },
  { path: '**', redirectTo: 'auth/login' }
];
