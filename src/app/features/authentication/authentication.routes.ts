import { Routes } from '@angular/router';

const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.Login)
  },
  { path: '**', redirectTo: 'login' }
];

export default AUTH_ROUTES;
