import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { CursoService, Curso } from '../../services/curso.service';
import { EstructuraService, Estructura } from '../../services/estructura.service';
import { NotaService, Nota, PageResult } from '../../services/nota.service';
import { AlumnoService, AlumnoSimple } from '../../../alumno/services/alumno.service';

type NotaExistente = { idNota: number; calificacion: number };
type Rol = 'DOCENTE' | 'ADMINISTRATIVO' | 'OTRO';

@Component({
  standalone: true,
  selector: 'app-notas',
  imports: [CommonModule, FormsModule],
  templateUrl: './notas.html',
  styleUrls: ['./notas.scss']
})
export class NotasComponent implements OnInit {
  private cursoSrv = inject(CursoService);
  private estrSrv = inject(EstructuraService);
  private notaSrv = inject(NotaService);
  private alSrv = inject(AlumnoService);
  private cdr = inject(ChangeDetectorRef);

  cursos: Curso[] = [];
  cursoSel: number | null = null;
  estructuras: Estructura[] = [];
  estructuraSel: number | null = null;

  alumnosCurso: AlumnoSimple[] = [];
  draft: Record<string, number | '' | null> = {};
  existentes: Record<string, NotaExistente> = {};

  notas: Nota[] = [];
  page: PageResult<Nota> | null = null;
  filtro = { codigoAlumno: '' };

  loading = false;
  error = '';
  mensaje = ''; // Mensaje temporal visual
  role: Rol = 'OTRO'; // ✅ Rol del usuario

  ngOnInit() {
    this.role = this.leerRol();

    // Solo los docentes cargan sus cursos
    if (this.role === 'DOCENTE') {
      this.cursoSrv.misCursos().subscribe({
        next: cs => this.cursos = cs,
        error: () => this.error = 'No se pudieron cargar cursos'
      });
    } else if (this.role === 'ADMINISTRATIVO') {
      // Los administrativos no cargan cursos ni estructuras
      this.error = 'Solo disponible para visualización';
    }
  }

  private leerRol(): Rol {
    try {
      const tok = localStorage.getItem('accessToken') || '';
      const base = tok.split('.')[1];
      if (!base) return 'OTRO';
      const json = JSON.parse(decodeURIComponent(
        atob(base).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      )) as { roles?: string[] };
      const roles = json?.roles || [];
      if (roles.includes('DOCENTE')) return 'DOCENTE';
      if (roles.includes('ADMINISTRATIVO')) return 'ADMINISTRATIVO';
      return 'OTRO';
    } catch { return 'OTRO'; }
  }

  onCursoChange(id: number | null) {
    if (this.role !== 'DOCENTE') return; // 🚫 Evita acción para administrativos

    this.cursoSel = id;
    this.estructuras = []; this.estructuraSel = null;
    this.alumnosCurso = []; this.draft = {}; this.existentes = {};
    if (!id) return;

    this.estrSrv.porCurso(id).subscribe({
      next: es => this.estructuras = es,
      error: () => this.error = 'No se pudieron cargar estructuras'
    });

    this.alSrv.porCursoLista(id).subscribe({
      next: as => {
        this.alumnosCurso = as;
        this.reiniciarDraft();
      },
      error: () => this.error = 'No se pudieron cargar alumnos del curso'
    });
  }

  onEstructuraChange(id: number | null) {
    if (this.role !== 'DOCENTE') return; // 🚫 Solo docentes
    this.estructuraSel = id;
    this.existentes = {};
    this.reiniciarDraft();
    if (!this.cursoSel || !this.estructuraSel) return;

    this.notaSrv.listarPorCursoEstructura(this.cursoSel, this.estructuraSel).subscribe({
      next: notas => {
        this.existentes = {};
        for (const n of notas) {
          this.existentes[n.codigoAlumno] = { idNota: n.idNota, calificacion: n.calificacion };
        }
        for (const a of this.alumnosCurso) {
          const ex = this.existentes[a.codigo];
          this.draft[a.codigo] = ex ? ex.calificacion : null;
        }
        this.cdr.detectChanges();
      },
      error: () => this.error = 'No se pudieron cargar notas existentes'
    });
  }

  private reiniciarDraft() {
    this.draft = {};
    for (const a of this.alumnosCurso) this.draft[a.codigo] = null;
  }

  nombreAlumno(a: AlumnoSimple): string {
    if ((a as any).nombre && (a as any).nombre.trim()) return (a as any).nombre.trim();
    if ((a as any).nombreCompleto && (a as any).nombreCompleto.trim()) return (a as any).nombreCompleto.trim();
    const n = ((a as any).nombres ?? '').trim();
    const ap = ((a as any).apellidos ?? '').trim();
    const full = [n, ap].filter(Boolean).join(' ');
    return full || a.codigo;
  }

  isValida(v: unknown): boolean {
    if (v === '' || v === null || v === undefined) return false;
    const n = typeof v === 'string' ? +v : (v as number);
    return Number.isFinite(n) && n >= 0 && n <= 20;
  }

  estadoFila(cod: string): 'nueva'|'guardada'|'modificada'|'vacia' {
    const ex = this.existentes[cod];
    const val = this.draft[cod];
    if (val === '' || val === null) return 'vacia';
    if (!this.isValida(val)) return 'vacia';
    if (!ex) return 'nueva';
    return +val !== ex.calificacion ? 'modificada' : 'guardada';
  }

  guardarTodo() {
    if (this.role !== 'DOCENTE') return; // 🚫 Bloqueado para administrativos
    if (!this.cursoSel || !this.estructuraSel) return;

    const crear: Array<{codigoAlumno:string; cal:number}> = [];
    const actualizar: Array<{id:number; cal:number}> = [];
    const eliminar: Array<{id:number}> = [];

    for (const a of this.alumnosCurso) {
      const cod = a.codigo;
      const ex  = this.existentes[cod];
      const val = this.draft[cod];

      if (ex && (val === '' || val === null)) {
        eliminar.push({ id: ex.idNota });
        continue;
      }
      if (val === '' || val === null) continue;
      if (!this.isValida(val)) continue;
      if (!ex) crear.push({ codigoAlumno: cod, cal: +val });
      else if (+val !== ex.calificacion) actualizar.push({ id: ex.idNota, cal: +val });
    }

    if (crear.length + actualizar.length + eliminar.length === 0) return;

    this.loading = true; this.error = '';

    const acciones: any[] = [];
    for (const e of eliminar) acciones.push(this.notaSrv.eliminar(e.id).pipe(catchError(() => of(null))));
    for (const a of actualizar) acciones.push(this.notaSrv.actualizar(a.id, a.cal).pipe(catchError(() => of(null))));
    for (const c of crear)
      acciones.push(
        this.notaSrv.registrar({
          codigoAlumno: c.codigoAlumno,
          idCurso: this.cursoSel!,
          idEstructura: this.estructuraSel!,
          calificacion: c.cal
        }).pipe(catchError(() => of(null)))
      );

    forkJoin(acciones)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (resps: (Nota | null)[]) => {
          for (const r of resps) {
            if (r && r.idNota && r.codigoAlumno) {
              this.existentes[r.codigoAlumno] = { idNota: r.idNota, calificacion: r.calificacion };
              this.draft[r.codigoAlumno] = r.calificacion;
            }
          }
          this.mostrarMensajeTemporal('✅ Notas guardadas correctamente');
          this.cdr.detectChanges();
        },
        error: e => {
          this.error = e?.error?.message || 'Error al guardar notas';
        }
      });
  }

  mostrarMensajeTemporal(texto: string) {
    this.mensaje = texto;
    setTimeout(() => this.mensaje = '', 2000);
  }
}
