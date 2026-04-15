export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'text' | 'boolean';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  timeLimit?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  configuration: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    showResults: boolean;
    allowRetries: boolean;
  };
  createdAt: string;
  createdBy: string;
}

export interface QuizSession {
  id: string;
  quizId: string;
  pin: string;
  isActive: boolean;
  participants: Participant[];
  startedAt?: string;
  endedAt?: string;
}

export interface Participant {
  id: string;
  name?: string;
  joinedAt: string;
  currentQuestionIndex: number;
  answers: Answer[];
  score: number;
  completed: boolean;
}

export interface Answer {
  questionId: string;
  value: string | string[];
  isCorrect: boolean;
  responseTime: number;
  answeredAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  createdAt: string;
}

// Interfaces adicionales para profesor y MongoDB
export type TipoPregunta = 'quiz' | 'verdadero_falso' | 'seleccion_multiple' | 'completacion';

export interface QuizMongo {
  _id: string;
  titulo: string;
  tema: string;
  cantidad_preguntas: number;
  fecha_creacion: string;
  imagen_portada?: string | null;
}

export interface Pregunta {
  id: number;
  tipo: TipoPregunta;
  pregunta: string;
  respuestas: string[];
  respuestaCorrecta: number;
  tiempo: number;
  puntos: number;
}

export interface PreguntaData {
  id: number;
  tipo: TipoPregunta;
  pregunta: string;
  respuestas: string[];
  respuestaCorrecta: number;
  respuestasCorrectas?: number[]; // Para selección múltiple
  tiempo: number;
  imagen: string | null;
}

export interface InformeResumen {
  titulo: string;
  descripcion: string;
  valor: string;
  icono: string;
  color: string;
}

export interface Reporte {
  titulo: string;
  descripcion: string;
  valor: string;
  icono: string;
}
