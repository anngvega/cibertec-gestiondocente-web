export interface Reserva {
  id: number;             // ID de la reserva (backend devuelve 'id')
  idAula: number;         // ID del aula
  aulaCodigo?: string;    // Código del aula (opcional por compatibilidad)
  inicio: string;         // ISO: yyyy-MM-ddTHH:mm:ss
  fin: string;            // ISO
  estado: string;         // 'RESERVADA' | 'CANCELADA' | ...
}


export interface ReservaRequest {
  idAula: number;
  idCurso?: number | null;
  inicio: string; // 'YYYY-MM-DDTHH:mm'
  fin: string;
}

export interface PageResult<T> {
  contenido: T[];
  paginaActual: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
  primera: boolean;
  ultima: boolean;
  vacia: boolean;
}
