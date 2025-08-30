export interface Alumno {
  id: number | null;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
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
