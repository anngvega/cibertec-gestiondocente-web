import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');
  const isRefresh = req.url.includes('/public/auth/refresh');
  const isLogin   = req.url.includes('/public/auth/login');

  if (token && !isRefresh && !isLogin && !req.headers.has('Authorization')) {
    const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(authReq);
  }
  return next(req);
};
