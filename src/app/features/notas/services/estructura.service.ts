import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Estructura { idEstructura: number; idCurso: number; descripcion: string; peso: number; }

@Injectable({ providedIn: 'root' })
export class EstructuraService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  porCurso(idCurso: number) {
    return this.http.get<Estructura[]>(`${this.base}/api/estructuras/por-curso/${idCurso}`);
  }
}
