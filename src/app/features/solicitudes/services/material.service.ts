import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResult, SolicitudMaterial } from '../model/material.model'

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/solicitudes/materiales`;

  listar(opts: {
    idDocente?: number | null;
    estado?: string | null;
    page?: number;
    size?: number;
    ordenarPor?: string;
    direccion?: 'asc' | 'desc';
  }): Observable<PaginaResult<SolicitudMaterial>> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10))
      .set('ordenarPor', opts.ordenarPor ?? 'fechaSolicitud')
      .set('direccion', (opts.direccion ?? 'desc'));
    if (opts.idDocente != null) params = params.set('idDocente', String(opts.idDocente));
    if (opts.estado) params = params.set('estado', opts.estado);
    return this.http.get<PaginaResult<SolicitudMaterial>>(this.base, { params });
  }

  crear(body: { idDocente: number; descripcion: string; cantidad: number; unidad?: string | null; }) {
    return this.http.post<SolicitudMaterial>(this.base, body);
  }

  cambiarEstado(id: number, estado: string) {
    return this.http.put<void>(`${this.base}/${id}/estado`, null, {
      params: new HttpParams().set('estado', estado)
    });
  }
}
