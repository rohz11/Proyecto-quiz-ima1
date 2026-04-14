export interface Usuario {
  usu_id: number;
  usu_nombre: string;
  usu_apellido: string;
  usu_email: string;
  usu_puntos_app: number;
  usu_fk_rol: number;
  usu_activo: boolean;
  rol_nombre: string;
  usu_imagen: string | null;
}

export interface UsuarioEdit {
  usu_nombre: string;
  usu_apellido: string;
  usu_email: string;
  usu_fk_rol: number;
  usu_imagen: string | null;
}
