import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResult, SolicitudReprogramacion } from '../model/reprogramacion.model';

@Injectable({ providedIn: 'root' })
export class ReprogramacionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/solicitudes/reprogramaciones`;

  listar(opts: {
    idDocente?: number | null;
    estado?: string | null;
    page?: number;
    size?: number;
    ordenarPor?: string;
    direccion?: 'asc' | 'desc';
  }): Observable<PaginaResult<SolicitudReprogramacion>> {
    let params = new HttpParams()
      .set('page', String(opts.page ?? 0))
      .set('size', String(opts.size ?? 10))
      .set('ordenarPor', opts.ordenarPor ?? 'fechaNueva')
      .set('direccion', opts.direccion ?? 'desc');

    if (opts.idDocente != null) params = params.set('idDocente', String(opts.idDocente));
    if (opts.estado) params = params.set('estado', opts.estado);

    return this.http.get<PaginaResult<SolicitudReprogramacion>>(this.base, { params });
  }

  crear(body: {
    idDocente: number;
    curso: string;
    fechaOriginal: string;
    fechaNueva: string;
    motivo: string;
  }) {
    return this.http.post<SolicitudReprogramacion>(this.base, body);
  }

  // ✅ CORREGIDO: el parámetro debe llamarse "nuevoEstado" (como en tu backend)
  cambiarEstado(id: number, nuevoEstado: string) {
    return this.http.put<void>(`${this.base}/${id}/estado`, null, {
      params: new HttpParams().set('nuevoEstado', nuevoEstado)
    });
  }
}
