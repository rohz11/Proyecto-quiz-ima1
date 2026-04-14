// Funciones para hablar con el backend
// Las uso en el frontend para guardar, listar y eliminar quices

// URL del backend - tiene que ser la IP de mi computadora, no localhost
// porque el celular no entiende localhost
const API_BASE_URL = 'http://192.168.1.5:8000';

// Guarda un quiz nuevo en MongoDB
// La uso cuando el profe presiona "Publicar"
export async function guardarQuiz(quizData: {
  metadatos: {
    titulo: string;
    tema: string;
    autor_id: number;
    imagen_portada?: string | null;
    recompensa_puntos_app?: number;
  };
  preguntas: Array<{
    nro_orden: number;
    tipo: string;
    enunciado: string;
    tiempo_limite_segundos: number;
    opciones: Array<{
      texto: string;
      es_correcta: boolean;
    }>;
    multimedia?: { tipo: string; url: string } | null;
    categoria?: string;
    puntos_si_es_dificultad?: number;
  }>;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/quices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al guardar el quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('Error guardando quiz:', error);
    throw error;
  }
}

// Trae todos los quices de un profesor
// La uso en la biblioteca y en el inicio
export async function listarQuices(autorId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/quices/?autor_id=${autorId}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener quices');
    }

    return await response.json();
  } catch (error) {
    console.error('Error listando quices:', error);
    throw error;
  }
}

// Trae un solo quiz completo por su ID
// La usaré cuando quiera editar o ver detalles
export async function obtenerQuiz(quizId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/quices/${quizId}`);
    
    if (!response.ok) {
      throw new Error('Quiz no encontrado');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo quiz:', error);
    throw error;
  }
}

// Borra un quiz de MongoDB
// La uso cuando el profe confirma que quiere eliminar
export async function eliminarQuiz(quizId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/quices/${quizId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al eliminar el quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('Error eliminando quiz:', error);
    throw error;
  }
}
