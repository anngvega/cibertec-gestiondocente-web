import {
  Component,
  HostListener,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

type Claims = { sub?: string; name?: string; roles?: string[] };

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.html'
})
export class MainLayoutComponent {
  // UI state
  sidebarOpen = signal(false);
  userMenuOpen = signal(false);

  // ---------------- JWT helpers (lee del accessToken en localStorage) ----------------
  private decodeJwt(token: string | null): Claims {
    if (!token) return {};
    try {
      const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json) as Claims;
    } catch {
      return {};
    }
  }

  private claims = signal<Claims>(
    this.decodeJwt(localStorage.getItem('accessToken'))
  );

  username = computed(() => this.claims().sub || '');
  fullName = computed(() => this.claims().name || this.username());
  role     = computed(() => this.claims().roles?.[0] || '');
  initials = computed(() => {
    const n = (this.fullName() || '').trim();
    if (!n) return 'US';
    const parts = n.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  });

  // Nav items del sidebar
  navItems = [
    { label: 'Inicio',      path: '/dashboard', icon: 'M3 12l2-2 4 4L21 4l2 2L9 20 3 14z' },
    { label: 'Usuarios',    path: '/alumnos',     icon: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6Z' },
    { label: 'Reportes',    path: '/reports',   icon: 'M4 6h16v2H4zm0 5h10v2H4zm0 5h16v2H4z' },
    { label: 'Documentos',  path: '/documents', icon: 'M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1v5h5' },
    { label: 'Ajustes',     path: '/settings',  icon: 'M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm8 4 2-1-2-3-2 1a6.9 6.9 0 0 0-1.2-.7l-.3-2h-4l-.3 2a6.9 6.9 0 0 0-1.2.7l-2-1-2 3 2 1a7.6 7.6 0 0 0 0 1.4l-2 1 2 3 2-1a6.9 6.9 0 0 0 1.2.7l.3 2h4l.3-2a6.9 6.9 0 0 0 1.2-.7l2 1 2-3-2-1a7.6 7.6 0 0 0 0-1.4Z' }
  ];

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar()  { this.sidebarOpen.set(false); }
  toggleUserMenu(){ this.userMenuOpen.update(v => !v); }
  closeUserMenu() { this.userMenuOpen.set(false); }

  logout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  // Cerrar dropdown al clic fuera
  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const t = event.target as HTMLElement;
    // Si el clic no fue dentro del botón/menú (contenedor .user-menu), lo cerramos
    if (!t.closest('.user-menu')) this.closeUserMenu();
  }
}
