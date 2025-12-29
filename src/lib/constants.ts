import { Code, FileCode, Palette, Braces, Calculator, Atom, FlaskConical, Leaf, Languages, BookOpen } from "lucide-react";

export const SUBJECTS = [
  {
    id: 'python',
    name: 'Python',
    icon: Code,
    description: 'Основы программирования, структуры данных, алгоритмы',
    color: 'python',
  },
  {
    id: 'html',
    name: 'HTML',
    icon: FileCode,
    description: 'Разметка веб-страниц, семантика, формы',
    color: 'html',
  },
  {
    id: 'css',
    name: 'CSS',
    icon: Palette,
    description: 'Стилизация, Flexbox, Grid, анимации',
    color: 'css',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: Braces,
    description: 'Переменные, функции, DOM, асинхронность',
    color: 'javascript',
  },
  {
    id: 'math',
    name: 'Математика',
    icon: Calculator,
    description: 'Алгебра, геометрия, тригонометрия, анализ',
    color: 'math',
  },
  {
    id: 'physics',
    name: 'Физика',
    icon: Atom,
    description: 'Механика, электричество, оптика, термодинамика',
    color: 'physics',
  },
  {
    id: 'chemistry',
    name: 'Химия',
    icon: FlaskConical,
    description: 'Неорганическая, органическая химия, реакции',
    color: 'chemistry',
  },
  {
    id: 'biology',
    name: 'Биология',
    icon: Leaf,
    description: 'Клетка, генетика, эволюция, экология',
    color: 'biology',
  },
  {
    id: 'english',
    name: 'Английский',
    icon: Languages,
    description: 'Грамматика, лексика, чтение, письмо',
    color: 'english',
  },
  {
    id: 'russian',
    name: 'Русский язык',
    icon: BookOpen,
    description: 'Орфография, пунктуация, стилистика, литература',
    color: 'russian',
  },
] as const;

export const DIFFICULTY_LABELS = {
  easy: { label: 'Лёгкий', color: 'text-green-500' },
  medium: { label: 'Средний', color: 'text-yellow-500' },
  hard: { label: 'Сложный', color: 'text-red-500' },
} as const;

export const LEVEL_LABELS = {
  beginner: { label: 'Новичок', minPoints: 0 },
  intermediate: { label: 'Продвинутый', minPoints: 500 },
  advanced: { label: 'Эксперт', minPoints: 1500 },
  expert: { label: 'Мастер', minPoints: 3000 },
} as const;

export type SubjectType = typeof SUBJECTS[number]['id'];
export type DifficultyLevel = keyof typeof DIFFICULTY_LABELS;
export type UserLevel = keyof typeof LEVEL_LABELS;
