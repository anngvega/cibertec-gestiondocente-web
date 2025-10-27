import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Alumno {
  id: number | null;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
}

export interface AlumnoSimple {
  id: number;
  codigo: string;
  nombre: string; // nombre completo
}

export interface PageResult<T> {
  contenido: T[];
  paginaActual: number;
  tamanio: number;
  totalPaginas: number;
  totalElementos: number;
}

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** ADMINISTRATIVO: lista alumnos, opcionalmente filtrados por curso */
  obtenerAdmin(
    pagina = 0,
    tamanio = 10,
    sort = 'apellido,asc',
    q?: string,
    idCurso?: number
  ): Observable<PageResult<Alumno>> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('sort', sort);
    if (q) params = params.set('q', q);
    if (idCurso != null) params = params.set('idCurso', idCurso);
    return this.http.get<PageResult<Alumno>>(`${this.base}/api/admin/alumnos`, { params });
  }

  /** DOCENTE: lista alumnos del curso asignado */
  obtenerDocente(
    idCurso: number,
    pagina = 0,
    tamanio = 10,
    sort = 'apellido,asc',
    q?: string
  ): Observable<PageResult<Alumno>> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('sort', sort)
      .set('idCurso', idCurso);
    if (q) params = params.set('q', q);
    return this.http.get<PageResult<Alumno>>(`${this.base}/api/docentes/me/alumnos`, { params });
  }

  /** Lista simple de alumnos inscritos en un curso (para registrar nota) */
  porCursoLista(idCurso: number): Observable<AlumnoSimple[]> {
    return this.http.get<AlumnoSimple[]>(`${this.base}/api/cursos/${idCurso}/alumnos`);
  }
}
