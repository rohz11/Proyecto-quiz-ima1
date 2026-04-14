export const API_URL = "http://192.168.1.5:8000";

export interface LoginResponse {
    token_acceso: string;
    usuario: {
        usu_id: number;
        usu_nombre: string;
        usu_apellido: string;
        usu_email: string;
        usu_puntos_app: number;
        usu_fk_rol: number;
        usu_activo: boolean;
        rol_nombre: string;
        usu_imagen: string | null;
    };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
 
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error en el login');
  }
 
  return response.json();
};

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  tipo: 'estudiante' | 'profesor';
  imagen?: string;
}

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error en el registro');
  }

  return response.json();
};