import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Curso { id: number; codigo: string; nombre: string; }

@Injectable({ providedIn: 'root' })
export class CursoService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}
  misCursos() { return this.http.get<Curso[]>(`${this.base}/api/docentes/me/cursos`); }
  activos()   { return this.http.get<Curso[]>(`${this.base}/api/cursos`); }
}
