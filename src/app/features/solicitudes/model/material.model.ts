// ===============================================
// 📘 MODELO DOCENTE (para futuros usos)
// ===============================================
export interface Docente {
  idDocente: number;
  nombre: string;
  apellido: string;
  username: string;
}

// ===============================================
// 📦 MODELO: Solicitud de Material
// ===============================================
export interface SolicitudMaterial {
  idMaterial: number;          // ✅ igual que en la entidad @Column(name="id_material")
  idDocente: number;           // ✅ coincide con columna id_docente
  nombreDocente: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA'; // ✅ restringido a valores válidos
  fechaCreacion: string;       // ✅ corresponde a fecha_creacion del backend
  fechaActualizacion?: string; // ✅ opcional
}

// ===============================================
// 📊 MODELO: Resultado de Paginación
// ===============================================
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
