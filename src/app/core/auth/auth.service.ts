import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, switchMap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUtils } from './auth.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authenticated = false;
  private _httpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private refreshTimer: any;

  // -----------------------------
  // 🧩 Tokens (access / refresh)
  // -----------------------------
  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  set refreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  get refreshToken(): string {
    return localStorage.getItem('refreshToken') ?? '';
  }

  // -----------------------------
  // 🔐 Estado de sesión
  // -----------------------------
  isLoggedInSync(): boolean {
    const token = this.accessToken;
    if (!token) return false;
    return !AuthUtils.isTokenExpired(token, 0);
  }

  resumeSession(): void {
    this._authenticated = this.isLoggedInSync();
    if (this._authenticated) {
      this.startTokenRefreshTimer();
    } else {
      this.clearSession();
    }
  }

  // -----------------------------
  // 🚪 Login
  // -----------------------------
  signIn(credentials: { username: string; password: string }): Observable<any> {
    if (this._authenticated) {
      return throwError(() => new Error('El usuario ya ha iniciado sesión.'));
    }

    return this._httpClient.post(`${this.baseUrl}/public/auth/login`, credentials).pipe(
      switchMap((response: any) => {
        this.accessToken = response.data.accessToken;
        this.refreshToken = response.data.refreshToken;
        this._authenticated = true;
        this.startTokenRefreshTimer();
        return of(response.data);
      })
    );
  }

  // -----------------------------
  // ♻️ Refresh token
  // -----------------------------
  refreshAccessToken(): Observable<any> {
    if (!this.refreshToken) {
      return throwError(() => new Error('Refresh token no disponible'));
    }

    return this._httpClient
      .post(`${this.baseUrl}/public/auth/refresh`, { refreshToken: this.refreshToken })
      .pipe(
        switchMap((response: any) => {
          this.accessToken = response.data.accessToken;
          this.refreshToken = response.data.refreshToken;
          this.startTokenRefreshTimer();
          return of(response.data);
        })
      );
  }

  // -----------------------------
  // 🚪 Logout
  // -----------------------------
  signOut(): Observable<boolean> {
    this.clearSession();
    return of(true);
  }

  // -----------------------------
  // 🧭 Verificación del estado
  // -----------------------------
  check(): Observable<boolean> {
    if (this._authenticated) return of(true);

    if (AuthUtils.isTokenExpired(this.accessToken, 10)) {
      return this.refreshAccessToken().pipe(
        switchMap(() => of(true)),
        catchError(() => of(false))
      );
    }

    if (!this.accessToken) return of(false);
    return of(true);
  }

  // -----------------------------
  // 🕒 Timer para refrescar token
  // -----------------------------
  private startTokenRefreshTimer(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const timeUntilExpiry = AuthUtils.getTimeUntilTokenExpires(this.accessToken, 10);
    if (timeUntilExpiry > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken().subscribe({
          error: (err) => console.error('Error renovando token:', err)
        });
      }, timeUntilExpiry);
    }
  }

  // -----------------------------
  // 🧹 Limpieza de sesión
  // -----------------------------
  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this._authenticated = false;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
  }

  // -----------------------------
  // 🧍 Obtener datos del usuario (NEW)
  // -----------------------------
  getUser(): any {
    const token = this.accessToken;
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.idDocente || payload.sub || null,
        username: payload.username || payload.sub || '',
        rol: Array.isArray(payload.roles) ? payload.roles[0] : payload.role || '',
        docente: payload.docente || null
      };
    } catch (e) {
      console.error('Error decodificando token JWT:', e);
      return null;
    }
  }
}
