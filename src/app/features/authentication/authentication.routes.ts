import {Routes} from '@angular/router';
import {Login} from './components/login/login';


export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: Login
  }
];

export default AUTH_ROUTES;
