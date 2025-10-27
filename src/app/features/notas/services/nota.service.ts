// src/app/features/notas/services/nota.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Nota {
  idNota: number;
  codigoAlumno: string;
  idCurso: number;
  idEstructura: number;
  calificacion: number;
}

export interface PageResult<T> {
  contenido: T[];
  paginaActual: number;
  tamanio: number;
  totalPaginas: number;
  totalElementos: number;
}

@Injectable({ providedIn: 'root' })
export class NotaService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ya la tenías
  registrar(body: { codigoAlumno: string; idCurso: number; idEstructura: number; calificacion: number }): Observable<Nota> {
    return this.http.post<Nota>(`${this.base}/api/notas`, body);
  }

  // NUEVO: listar TODAS las notas de un curso + estructura (para precargar la grilla)
  listarPorCursoEstructura(idCurso: number, idEstructura: number): Observable<Nota[]> {
    const params = new HttpParams()
      .set('idCurso', idCurso)
      .set('idEstructura', idEstructura);
    return this.http.get<Nota[]>(`${this.base}/api/notas/por-curso-estructura`, { params });
  }

  // NUEVO: actualizar una nota existente
  actualizar(idNota: number, calificacion: number): Observable<Nota> {
    return this.http.put<Nota>(`${this.base}/api/notas/${idNota}`, { calificacion });
  }

  // NUEVO: eliminar una nota existente
  eliminar(idNota: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/notas/${idNota}`);
  }

  // (opcional) tu búsqueda superior si la usas
  buscar(idCurso?: number, codigoAlumno?: string, pagina = 0, tamanio = 10): Observable<PageResult<Nota>> {
    let params = new HttpParams().set('pagina', pagina).set('tamanio', tamanio);
    if (idCurso != null) params = params.set('idCurso', idCurso);
    if (codigoAlumno) params = params.set('codigoAlumno', codigoAlumno);
    return this.http.get<PageResult<Nota>>(`${this.base}/api/notas`, { params });
  }
}
