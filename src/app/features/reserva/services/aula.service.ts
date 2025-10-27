import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Aula { id: number; codigo: string; nombre: string; capacidad: number; }

@Injectable({ providedIn: 'root' })
export class AulaService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}
  activas() { return this.http.get<Aula[]>(`${this.base}/api/aulas`); }
}
