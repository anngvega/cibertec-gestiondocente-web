import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ReprogramacionService } from '../../services/reprogramacion.service';
import { PaginaResult, SolicitudReprogramacion } from '../../model/reprogramacion.model';

@Component({
  standalone: true,
  selector: 'app-solicitudes-reprogramacion',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe, NgClass],
  templateUrl: './solicitudes-reprogramacion.component.html'
})
export class SolicitudesReprogramacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ReprogramacionService);

  readonly docenteActualId = 1;

  loading = signal(false);
  error = signal('');
  page = signal(0);
  size = signal(10);
  ordenarPor = signal<'fechaNueva'|'estado'|'idDocente'|'idReprogramacion'>('fechaNueva');
  direccion = signal<'asc'|'desc'>('desc');

  filtroEstado = signal<string | null>(null);
  filtroDocente = signal<number | null>(this.docenteActualId);
  pagina = signal<PaginaResult<SolicitudReprogramacion> | null>(null);

  form = this.fb.group({
    curso: ['', [Validators.required, Validators.maxLength(100)]],
    fechaOriginal: ['', Validators.required],
    fechaNueva: ['', Validators.required],
    motivo: ['', [Validators.required, Validators.maxLength(250)]],
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.api.listar({
      idDocente: this.filtroDocente(),
      estado: this.filtroEstado(),
      page: this.page(),
      size: this.size(),
      ordenarPor: this.ordenarPor(),
      direccion: this.direccion()
    }).subscribe({
      next: res => { this.loading.set(false); this.pagina.set(res); this.error.set(''); },
      error: err => { this.loading.set(false); this.error.set(err?.error?.message || 'No se pudo cargar la lista'); }
    });
  }

  crear() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.loading.set(true);
    this.api.crear({
      idDocente: this.docenteActualId,
      curso: v.curso!,
      fechaOriginal: v.fechaOriginal!,
      fechaNueva: v.fechaNueva!,
      motivo: v.motivo!,
    }).subscribe({
      next: _ => {
        this.loading.set(false);
        this.form.reset();
        this.page.set(0);
        this.ordenarPor.set('fechaNueva');
        this.direccion.set('desc');
        this.cargar();
      },
      error: err => { this.loading.set(false); this.error.set(err?.error?.message || 'No se pudo crear la solicitud'); }
    });
  }

  irAPagina(p: number) { this.page.set(p); this.cargar(); }
  cambiarTamanio(n: number) { this.size.set(n); this.page.set(0); this.cargar(); }
  aplicarFiltros() { this.page.set(0); this.cargar(); }
  limpiarFiltros() { this.filtroEstado.set(null); this.filtroDocente.set(this.docenteActualId); this.page.set(0); this.cargar(); }

  ordenarPorColumna(prop: 'fechaNueva'|'estado'|'idDocente'|'idReprogramacion') {
    if (this.ordenarPor() === prop) {
      this.direccion.set(this.direccion() === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(prop);
      this.direccion.set('asc');
    }
    this.cargar();
  }

  chipClass = (estado: string) => ({
    'bg-yellow-100 text-yellow-800': estado === 'PENDIENTE',
    'bg-green-100 text-green-800': estado === 'APROBADA',
    'bg-red-100 text-red-700': estado === 'RECHAZADA',
    'bg-slate-200 text-slate-700': estado === 'CANCELADA',
    'px-2 py-0.5 rounded text-xs font-medium': true
  });

  aprobar(r: SolicitudReprogramacion) { alert('Habilita PUT /api/solicitudes/reprogramaciones/{id}/estado'); }
  rechazar(r: SolicitudReprogramacion) { alert('Habilita PUT /api/solicitudes/reprogramaciones/{id}/estado'); }
  cancelar(r: SolicitudReprogramacion) { alert('Habilita PUT /api/solicitudes/reprogramaciones/{id}/estado'); }

  rangoPaginas = computed(() => {
    const p = this.pagina(); if (!p) return [];
    const total = p.totalPaginas; const actual = p.paginaActual;
    const inicio = Math.max(0, actual - 2); const fin = Math.min(total - 1, actual + 2);
    return Array.from({ length: (fin - inicio + 1) }, (_, i) => inicio + i);
  });
}
