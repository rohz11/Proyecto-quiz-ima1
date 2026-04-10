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
