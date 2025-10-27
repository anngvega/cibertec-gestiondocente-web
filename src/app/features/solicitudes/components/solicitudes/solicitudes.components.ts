import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/auth/auth.service';
import { PaginaResult, SolicitudMaterial } from '../../model/material.model';

@Component({
  standalone: true,
  selector: 'app-solicitudes-material',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe, NgClass],
  templateUrl: './solicitudes.component.html',
})
export class SolicitudesMaterialComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.apiUrl;

  loading = signal(false);
  error = signal('');
  success = signal('');
  page = signal(0);
  size = signal(10);

  // Ordenación actualizada (fechaCreacion)
  ordenarPor = signal<'fechaCreacion' | 'estado' | 'idDocente' | 'idMaterial' | 'descripcion'>('fechaCreacion');
  direccion = signal<'asc' | 'desc'>('desc');

  filtroEstado = signal<string | null>(null);
  filtroDocente = signal<number | null>(null);
  pagina = signal<PaginaResult<SolicitudMaterial> | null>(null);
  rolUsuario = signal<'DOCENTE' | 'ADMINISTRATIVO' | string>('DOCENTE');
  docenteActualId = signal<number | null>(null);

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.maxLength(200)]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    unidad: ['unidad(es)']
  });

  ngOnInit() {
    const usuario = this.auth.getUser();
    if (usuario) {
      this.rolUsuario.set(usuario.rol);
      this.docenteActualId.set(usuario.id);
      this.filtroDocente.set(usuario.rol === 'DOCENTE' ? usuario.id : null);
    }
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    const query = new URLSearchParams();
    if (this.filtroDocente()) query.append('idDocente', this.filtroDocente()!.toString());
    if (this.filtroEstado()) query.append('estado', this.filtroEstado()!);
    query.append('page', this.page().toString());
    query.append('size', this.size().toString());
    query.append('ordenarPor', this.ordenarPor());
    query.append('direccion', this.direccion());

    this.http.get<PaginaResult<SolicitudMaterial>>(`${this.base}/api/solicitudes/materiales?${query}`)
      .subscribe({
        next: res => {
          this.loading.set(false);
          this.pagina.set(res);
          this.error.set('');
        },
        error: err => {
          this.loading.set(false);
          this.error.set(err?.error?.message || 'No se pudo cargar la lista');
        }
      });
  }

  crear() {
    if (this.rolUsuario() !== 'DOCENTE') {
      alert('Solo los docentes pueden crear solicitudes.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    this.loading.set(true);

    this.http.post(`${this.base}/api/solicitudes/materiales`, {
      idDocente: this.docenteActualId()!,
      descripcion: v.descripcion!,
      cantidad: Number(v.cantidad),
      unidad: v.unidad || undefined
    }).subscribe({
      next: _ => {
        this.loading.set(false);
        this.success.set('✅ Solicitud creada correctamente');
        this.form.reset({ cantidad: 1, unidad: 'unidad(es)' });
        setTimeout(() => this.success.set(''), 3000);
        this.cargar();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo crear la solicitud');
      }
    });
  }

  aprobar(r: SolicitudMaterial) {
    if (this.rolUsuario() !== 'ADMINISTRATIVO') {
      alert('Solo el personal administrativo puede aprobar solicitudes.');
      return;
    }

    this.http.patch(`${this.base}/api/solicitudes/materiales/${r.idMaterial}/estado`, { estado: 'APROBADA' })
      .subscribe({
        next: () => {
          this.success.set('✅ Solicitud aprobada correctamente');
          setTimeout(() => this.success.set(''), 3000);
          this.cargar();
        },
        error: err => this.error.set(err?.error?.message || 'No se pudo aprobar la solicitud')
      });
  }

  rechazar(r: SolicitudMaterial) {
    if (this.rolUsuario() !== 'ADMINISTRATIVO') {
      alert('Solo el personal administrativo puede rechazar solicitudes.');
      return;
    }

    this.http.patch(`${this.base}/api/solicitudes/materiales/${r.idMaterial}/estado`, { estado: 'RECHAZADA' })
      .subscribe({
        next: () => {
          this.success.set('🚫 Solicitud rechazada correctamente');
          setTimeout(() => this.success.set(''), 3000);
          this.cargar();
        },
        error: err => this.error.set(err?.error?.message || 'No se pudo rechazar la solicitud')
      });
  }

  cancelar(r: SolicitudMaterial) {
    if (this.rolUsuario() === 'DOCENTE' && r.idDocente !== this.docenteActualId()) {
      alert('No puedes cancelar solicitudes de otros docentes.');
      return;
    }

    if (!confirm('¿Seguro que deseas cancelar esta solicitud?')) return;

    this.http.patch(
      `${this.base}/api/solicitudes/materiales/${r.idMaterial}/estado`,
      { estado: 'CANCELADA' },
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: () => {
        r.estado = 'CANCELADA';
        this.success.set('⚠️ Solicitud cancelada correctamente');
        setTimeout(() => this.success.set(''), 3000);
      },
      error: err => {
        console.error('❌ Error al cancelar:', err);
        this.error.set(err?.error?.message || 'No se pudo cancelar la solicitud');
      }
    });
  }


  ordenarPorColumna(prop: 'fechaCreacion' | 'estado' | 'idDocente' | 'idMaterial' | 'descripcion') {
    if (this.ordenarPor() === prop) {
      this.direccion.set(this.direccion() === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(prop);
      this.direccion.set('asc');
    }
    this.cargar();
  }

  irAPagina(p: number) { this.page.set(p); this.cargar(); }
  cambiarTamanio(n: number) { this.size.set(n); this.page.set(0); this.cargar(); }
  aplicarFiltros() { this.page.set(0); this.cargar(); }

  limpiarFiltros() {
    this.filtroEstado.set(null);
    this.filtroDocente.set(this.rolUsuario() === 'DOCENTE' ? this.docenteActualId() : null);
    this.page.set(0);
    this.cargar();
  }

  chipClass = (estado: string) => ({
    'bg-yellow-100 text-yellow-800': estado === 'PENDIENTE',
    'bg-green-100 text-green-800': estado === 'APROBADA',
    'bg-red-100 text-red-700': estado === 'RECHAZADA',
    'bg-slate-200 text-slate-700': estado === 'CANCELADA',
    'px-2 py-0.5 rounded text-xs font-medium': true
  });

  rangoPaginas = computed(() => {
    const p = this.pagina();
    if (!p) return [];
    const total = p.totalPaginas;
    const actual = p.paginaActual;
    const inicio = Math.max(0, actual - 2);
    const fin = Math.min(total - 1, actual + 2);
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  });
}
