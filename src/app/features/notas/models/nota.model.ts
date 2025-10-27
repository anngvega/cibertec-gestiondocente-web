export interface Nota {
  idNota: number;
  codigoAlumno: string;
  idCurso: number;
  idEstructura: number;
  idDocente: number;
  calificacion: number;
  fechaRegistro: string;
}

export interface NotaRequest {
  codigoAlumno: string;
  idCurso: number;
  idEstructura: number;
  calificacion: number;
}

export interface Estructura {
  idEstructura: number;
  idCurso: number;
  descripcion: string;
  peso: number;
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
