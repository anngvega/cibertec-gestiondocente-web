import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Alumno, PageResult } from '../models/alumno.model';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  obtener(pagina = 0, tamanio = 10, sort = 'codigo,asc', q?: string)
    : Observable<PageResult<Alumno>> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('sort', sort);
    if (q) params = params.set('q', q);
    return this.http.get<PageResult<Alumno>>(`${this.base}/api/alumnos`, { params });
  }

  porCodigo(codigo: string): Observable<Alumno> {
    return this.http.get<Alumno>(`${this.base}/api/alumnos/${codigo}`);
  }
}
