import { Task, Stats } from '@/types'

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Аудит дизайн-системы',
    description: 'Проверка и оптимизация UI компонентов',
    status: 'done',
    priority: 'high',
    dueDate: '2594',
    tags: ['дизайн', 'ui'],
    aiSuggested: true,
  },
  {
    id: '2',
    title: 'Внедрение AI функций',
    description: 'Добавление ML модели для приоритизации',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2592',
    tags: ['ai', 'ml'],
  },
  {
    id: '3',
    title: 'Оптимизация производительности',
    description: 'Оптимизация анимаций и размера бандла',
    status: 'todo',
    priority: 'low',
    dueDate: '2194',
    tags: ['performance'],
  },
  {
    id: '4',
    title: 'Онбординг пользователей',
    description: 'Создание интерактивного туториала',
    status: 'todo',
    priority: 'low',
    dueDate: '3494',
    tags: ['ux', 'onboarding'],
  },
]

export const mockStats: Stats = {
  total: 24,
  completed: 21,
  inProgress: 3,
  aiGenerated: 8,
}