export interface Estudiante {
  estudiante_id: number;
  cedula: number;
  nombre_completo: string;
  fecha_nacimiento: string;
  genero: string;
  estado_civil: string;
  licencia: string;
  credencial_civica: string;
  cel: string;
  email: string;
}

export interface Idioma{
  idioma: string;
  nivel: string;
}

export interface Educacion {
  nivel: string;
  institucion: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  actualmente: boolean;
  fin_estimado: string;
  descripcion: string;
}

export interface Experiencia {
  puesto: string;
  empresa: string;
  fecha_inicio: string;
  fecha_fin: string;
  actualmente: boolean;
  descripcion: string;
  referencias: string;
}

export interface Habilidad {
  habilidad: string;
  nivel: string;
}

export class Cv {
  student: Estudiante[];
  educacion: Educacion[];
  experiencia: Experiencia[];
  habilidades: Habilidad[];
  constructor() {
    this.student = [];
    this.educacion = [];
    this.experiencia = [];
    this.habilidades = [];
  }
}