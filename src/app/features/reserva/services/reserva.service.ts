import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PageResult, Reserva, ReservaRequest } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  crear(req: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.base}/api/reservas`, req);
  }

  listar(pagina=0, tamanio=10, sort='fecha_inicio,desc',
         filtros: { idAula?: number; idDocente?: number; desde?: string; hasta?: string } = {}): Observable<PageResult<Reserva>> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('sort', sort);
    if (filtros.idAula != null) params = params.set('idAula', filtros.idAula);
    if (filtros.idDocente != null) params = params.set('idDocente', filtros.idDocente);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);

    return this.http.get<PageResult<Reserva>>(`${this.base}/api/reservas`, { params });
  }

  cancelar(id: number) {
    return this.http.post<void>(`${this.base}/api/reservas/${id}/cancelar`, {});
  }
}
