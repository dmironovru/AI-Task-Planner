'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task, TaskFormData, Stats } from '@/types'

const STORAGE_KEY = 'ai-task-planner-tasks'

export type DateFilter = 'all' | 'today' | 'week' | 'month'
export type StatusFilter = 'all' | 'active' | 'completed'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Миграция старых статусов
        const migrated = parsed.map((task: Task) => ({
          ...task,
          status: task.status === 'todo' || task.status === 'in-progress' ? 'active' : task.status,
        }))
        setTasks(migrated)
      } catch (e) {
        console.error('Failed to parse tasks from localStorage')
      }
    } else {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Аудит дизайн-системы',
          description: 'Проверка и оптимизация UI компонентов',
          status: 'done',
          priority: 'high',
          dueDate: '25 дек',
          dueTime: '14:00',
          createdAt: new Date().toISOString(),
          aiSuggested: true,
        },
        {
          id: '2',
          title: 'Внедрение AI функций',
          description: 'Добавление ML модели для приоритизации',
          status: 'active',
          priority: 'medium',
          dueDate: '28 дек',
          dueTime: '10:00',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Оптимизация производительности',
          description: 'Оптимизация анимаций и размера бандла',
          status: 'active',
          priority: 'low',
          dueDate: '15 янв',
          dueTime: undefined,
          createdAt: new Date().toISOString(),
        },
      ]
      setTasks(mockTasks)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks, isLoaded])

  const createTask = useCallback((data: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
    return newTask
  }, [])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...data } : task
    ))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  const toggleStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task
      return { ...task, status: task.status === 'active' ? 'done' : 'active' }
    }))
  }, [])

  const stats: Stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'active').length,
    aiGenerated: tasks.filter(t => t.aiSuggested).length,
  }

  const filterByDate = useCallback((tasks: Task[], filter: DateFilter): Task[] => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const months: Record<string, number> = {
      'янв': 0, 'фев': 1, 'мар': 2, 'апр': 3, 'май': 4, 'июн': 5,
      'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'ноя': 10, 'дек': 11
    }

    const parseDueDate = (dueDate: string): Date | null => {
      const match = dueDate.toLowerCase().match(/(\d{1,2})\s*(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)/i)
      if (match) {
        const day = parseInt(match[1], 10)
        const month = months[match[2].toLowerCase()]
        const year = now.getFullYear()
        return new Date(year, month, day)
      }
      return null
    }

    return tasks.filter(task => {
      if (filter === 'all') return true
      
      const dueDate = parseDueDate(task.dueDate)
      if (!dueDate) return true

      const taskTime = dueDate.getTime()
      const todayTime = today.getTime()

      switch (filter) {
        case 'today':
          return taskTime === todayTime
        case 'week':
          return taskTime >= todayTime && taskTime <= weekFromNow.getTime()
        case 'month':
          return taskTime >= todayTime && taskTime <= monthFromNow.getTime()
        default:
          return true
      }
    })
  }, [])

  const filterByStatus = useCallback((tasks: Task[], filter: StatusFilter): Task[] => {
    switch (filter) {
      case 'active':
        return tasks.filter(t => t.status === 'active')
      case 'completed':
        return tasks.filter(t => t.status === 'done')
      default:
        return tasks
    }
  }, [])

  return {
    tasks,
    isLoaded,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    stats,
    filterByDate,
    filterByStatus,
  }
}
