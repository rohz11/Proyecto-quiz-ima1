import Constants from 'expo-constants';
import { LoginResponse, RegisterData } from '@/types/api';

// Leer la URL del backend desde app.json (expo.extra) o usar valor por defecto.
const API_BASE_URL =
  (Constants.expoConfig?.extra as { API_BASE_URL?: string })?.API_BASE_URL ||
  (Constants.manifest?.extra as { API_BASE_URL?: string })?.API_BASE_URL ||
  'http://192.168.0.110:8000';

export const API_URL = API_BASE_URL;

console.log('API_BASE_URL', API_BASE_URL);

/**
 * Función auxiliar para manejar respuestas de la API de forma segura
 */
async function handleResponse(response: Response) {
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        // Si la respuesta es JSON, extraemos el detalle del error
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error: ${response.status}`);
        } else {
            // Si es texto plano (Error 500), evitamos el error de JSON parse
            const errorText = await response.text();
            if (errorText.includes("UniqueViolation")) {
                throw new Error('El usuario ya existe en la base de datos.');
            }
            throw new Error(`Error del servidor (${response.status}): ${errorText.substring(0, 50)}`);
        }
    }

    // Si todo está bien, retornamos el JSON
    return response.json();
}

// --- FUNCIONES DE AUTENTICACIÓN ---

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return await handleResponse(response);
    } catch (error: any) {
        console.error('Error en login:', error.message);
        // Si el error es de red (Network request failed)
        if (error.message === 'Network request failed') {
            throw new Error('No se pudo conectar con el servidor. Revisa tu IP y Firewall.');
        }
        throw error;
    }
};

export const register = async (data: RegisterData): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await handleResponse(response);
    } catch (error: any) {
        console.error('Error en registro:', error.message);
        throw error;
    }
};

// --- FUNCIONES DE QUICES (MongoDB) ---

export async function guardarQuiz(quizData: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/quices/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quizData),
        });
        return await handleResponse(response);
    } catch (error: any) {
        console.error('Error guardando quiz:', error);
        throw error;
    }
}

export async function listarQuices(autorId: number) {
    try {
        const response = await fetch(`${API_BASE_URL}/quices/?autor_id=${autorId}`);
        return await handleResponse(response);
    } catch (error: any) {
        console.error('Error listando quices:', error);
        throw error;
    }
}

export async function obtenerQuiz(quizId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/quices/${quizId}`);
        return await handleResponse(response);
    } catch (error: any) {
        console.error('Error obteniendo quiz:', error);
        throw error;
    }
}

export async function eliminarQuiz(quizId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/quices/${quizId}`, {
            method: 'DELETE',
        });
        return await handleResponse(response);
    } catch (error: any) {
        console.error('Error eliminando quiz:', error);
        throw error;
    }
}