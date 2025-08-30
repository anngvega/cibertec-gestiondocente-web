import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlumnoService } from '../../../alumno/services/alumno.service';
import { Alumno } from '../../../alumno/models/alumno.model';

@Component({
  selector: 'app-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumno.html',
  styleUrls: ['./alumno.component.scss'],
})
export class AlumnoComponent implements OnInit, OnDestroy {

  private service = inject(AlumnoService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);

  alumnos = signal<Alumno[]>([]);
  loading = signal(false);
  error   = signal('');

  q = signal('');

  paginacion = signal({
    actual: 0,         // 0-based
    tamanio: 10,
    totalElementos: 0,
    totalPaginas: 0,
  });

  paginasVisibles = computed(() => {
    const { actual, totalPaginas } = this.paginacion();
    const max = 5;
    if (totalPaginas <= max) return Array.from({ length: totalPaginas }, (_, i) => i);
    let inicio = Math.max(0, actual - Math.floor(max / 2));
    let fin = inicio + max;
    if (fin > totalPaginas) { fin = totalPaginas; inicio = fin - max; }
    return Array.from({ length: fin - inicio }, (_, i) => inicio + i);
  });

  private destroy$ = new Subject<void>();
  private search$  = new Subject<void>();

  ngOnInit(): void {
    // restaurar estado desde query params
    const qp = this.route.snapshot.queryParamMap;
    const page = +(qp.get('page') ?? 0);
    const size = +(qp.get('size') ?? 10);
    const qVal = qp.get('q') ?? '';

    this.q.set(qVal);
    this.paginacion.update(p => ({
      ...p,
      actual: isNaN(page) ? 0 : page,
      tamanio: isNaN(size) ? 10 : size
    }));

    this.search$.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(() => this.cargar(0));

    this.cargar(this.paginacion().actual);
  }

  onBuscarChange(v: string) { this.q.set(v); this.search$.next(); }

  cargar(pagina = 0): void {
    const { tamanio } = this.paginacion();
    this.loading.set(true); this.error.set('');

    this.service.obtener(pagina, tamanio, 'codigo,asc', this.q() || undefined).subscribe({
      next: r => {
        this.loading.set(false);
        this.alumnos.set(r.contenido ?? []);
        this.paginacion.set({
          actual: r.paginaActual,
          tamanio: r.tamanio,
          totalElementos: r.totalElementos,
          totalPaginas: r.totalPaginas,
        });
        this.updateUrl();
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudo obtener alumnos');
      }
    });
  }

  ir(p: number) { if (p !== this.paginacion().actual) this.cargar(p); }
  prev()        { if (this.paginacion().actual > 0) this.cargar(this.paginacion().actual - 1); }
  next()        { if (this.paginacion().actual < this.paginacion().totalPaginas - 1) this.cargar(this.paginacion().actual + 1); }
  first()       { this.cargar(0); }
  last()        { this.cargar(Math.max(0, this.paginacion().totalPaginas - 1)); }
  cambiarTamanio(n: number) { this.paginacion.update(p => ({ ...p, tamanio: n })); this.cargar(0); }

  private updateUrl(): void {
    const p = this.paginacion();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: p.actual, size: p.tamanio, q: this.q() || null },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
