export interface Student {
  id: string;
  name: string;
  classId: string;
  birthDate: string;
  phone?: string;
  active: boolean;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  description?: string;
}

export interface Teacher {
  id: string;
  name: string;
  phone?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // ISO date
  present: boolean;
}

export interface LessonRequest {
  id: string;
  studentName: string;
  classId: string;
  date: string;
  delivered: boolean;
  observation?: string;
}

export interface Magazine {
  id: string;
  title: string;
  quarter: string;
  year: number;
  studied: boolean;
  read: boolean;
  pdfUrl?: string;
}

export interface LessonPrices {
  profAdulto: string;
  alunoAdulto: string;
  profCrianca: string;
  alunoCrianca: string;
  profAdolescente: string;
  alunoAdolescente: string;
}

export type Tab = 'home' | 'classes' | 'students' | 'lessons' | 'magazines' | 'studied' | 'teachers' | 'birthdays' | 'prices';
