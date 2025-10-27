// src/app/features/alumno/components/alumno/alumno.ts
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AlumnoService, Alumno, PageResult } from '../../../alumno/services/alumno.service';
import { CursoService, Curso } from '../../../notas/services/curso.service';

type Claims = { roles?: string[]; name?: string };

@Component({
  selector: 'app-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumno.html',
  styleUrls: ['./alumno.component.scss'],
})
export class AlumnoComponent implements OnInit, OnDestroy {

  private alumnosSrv = inject(AlumnoService);
  private cursoSrv   = inject(CursoService);
  private router     = inject(Router);
  private route      = inject(ActivatedRoute);

  // estado
  alumnos = signal<Alumno[]>([]);
  loading = signal(false);
  error   = signal('');

  q = signal('');

  // cursos para el combo
  cursos: Curso[] = [];
  cursoSel: number | null = null;

  // paginación
  paginacion = signal({
    actual: 0,
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

  // rol
  role: 'DOCENTE'|'ADMINISTRATIVO'|'OTRO' = 'OTRO';

  private destroy$ = new Subject<void>();
  private search$  = new Subject<void>();

  ngOnInit(): void {
    // rol del JWT
    this.role = this.leerRol();

    // restaurar query params
    const qp = this.route.snapshot.queryParamMap;
    const page = +(qp.get('page') ?? 0);
    const size = +(qp.get('size') ?? 10);
    const qVal = qp.get('q') ?? '';
    const idCursoParam = qp.get('idCurso');

    this.q.set(qVal);
    this.cursoSel = idCursoParam ? +idCursoParam : null;

    this.paginacion.update(p => ({
      ...p,
      actual: isNaN(page) ? 0 : page,
      tamanio: isNaN(size) ? 10 : size
    }));

    // cargar cursos y luego datos
    if (this.role === 'DOCENTE') {
      this.cursoSrv.misCursos().subscribe({
        next: cs => { this.cursos = cs; this.validarCursoSel(); this.cargar(this.paginacion().actual); },
        error: _ => { this.error.set('No se pudieron cargar mis cursos'); this.cargar(this.paginacion().actual); }
      });
    }
    else if (this.role === 'ADMINISTRATIVO') {
      // Ya no cargamos cursos: directamente los alumnos globales
      this.cargar(this.paginacion().actual);
    }
    else {
      this.cargar(this.paginacion().actual);
    }

    this.search$.pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(() => this.cargar(0));
  }

  private validarCursoSel() {
    if (this.cursoSel && !this.cursos.some(c => c.id === this.cursoSel)) {
      this.cursoSel = null;
    }
  }

  onBuscarChange(v: string) { this.q.set(v); this.search$.next(); }

  onCursoChange(id: number | null) {
    this.cursoSel = id;
    this.cargar(0);
  }

  cargar(pagina = 0): void {
    const { tamanio } = this.paginacion();
    this.loading.set(true); this.error.set('');

    if (this.role === 'DOCENTE') {
      // para docente el curso es obligatorio
      if (!this.cursoSel) {
        this.loading.set(false);
        this.alumnos.set([]);
        this.paginacion.set({ actual: 0, tamanio, totalElementos: 0, totalPaginas: 0 });
        this.updateUrl();
        return;
      }
      this.alumnosSrv
        .obtenerDocente(this.cursoSel, pagina, tamanio, 'apellido,asc', this.q() || undefined)
        .subscribe({ next: r => this.ok(r), error: e => this.fail(e) });
      return;
    }

    // administrativo/global: lista completa sin filtro de curso
    this.alumnosSrv
      .obtenerAdmin(pagina, tamanio, 'apellido,asc', this.q() || undefined)
      .subscribe({ next: r => this.ok(r), error: e => this.fail(e) });
  }

  private ok(r: PageResult<Alumno>) {
    this.loading.set(false);
    this.alumnos.set(r.contenido ?? []);
    this.paginacion.set({
      actual: r.paginaActual,
      tamanio: r.tamanio,
      totalElementos: r.totalElementos,
      totalPaginas: r.totalPaginas,
    });
    this.updateUrl();
  }

  private fail(err: any) {
    this.loading.set(false);
    this.error.set(err?.error?.message || 'No se pudo obtener alumnos');
  }

  private updateUrl(): void {
    const p = this.paginacion();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: p.actual,
        size: p.tamanio,
        q: this.q() || null,
        idCurso: this.cursoSel ?? null
      },
      queryParamsHandling: 'merge',
    });
  }

  private leerRol(): 'DOCENTE'|'ADMINISTRATIVO'|'OTRO' {
    try {
      const tok = localStorage.getItem('accessToken') || '';
      const base = tok.split('.')[1];
      if (!base) return 'OTRO';
      const json = JSON.parse(decodeURIComponent(
        atob(base).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      )) as Claims;
      const roles = json?.roles || [];
      if (roles.includes('DOCENTE')) return 'DOCENTE';
      if (roles.includes('ADMINISTRATIVO')) return 'ADMINISTRATIVO';
      return 'OTRO';
    } catch { return 'OTRO'; }
  }

  // paginación
  ir(p: number) { if (p !== this.paginacion().actual) this.cargar(p); }
  prev() { if (this.paginacion().actual > 0) this.cargar(this.paginacion().actual - 1); }
  next() { if (this.paginacion().actual < this.paginacion().totalPaginas - 1) this.cargar(this.paginacion().actual + 1); }
  first() { this.cargar(0); }
  last() { this.cargar(Math.max(0, this.paginacion().totalPaginas - 1)); }
  cambiarTamanio(n: number) { this.paginacion.update(p => ({ ...p, tamanio: n })); this.cargar(0); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
