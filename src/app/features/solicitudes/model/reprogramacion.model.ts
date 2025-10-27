export interface SolicitudReprogramacion {
  idReprogramacion: number;
  idSolicitud: number;
  idDocente: number;
  curso: string;
  fechaOriginal: string;
  fechaNueva: string;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';
}

export interface PaginaResult<T> {
  contenido: T[];
  paginaActual: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
  vacia: boolean;
}

