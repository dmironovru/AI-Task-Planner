'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Reminder {
  id: string
  taskId: string
  taskTitle: string
  minutes: number
  notified: boolean
  scheduledTime: number
}

const STORAGE_KEY = 'ai-task-planner-reminders'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoaded, setIsLoaded] = useState(false)

  // Загрузка
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setReminders(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse reminders:', e)
      }
    }
    setPermission(Notification.permission)
    setIsLoaded(true)
  }, [])

  // Сохранение
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
    }
  }, [reminders, isLoaded])

  // Проверка и запрос разрешения
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Не запрашиваем автоматически, только по клику
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPermission(permission)
    }
  }, [])

  const toggleReminder = useCallback((taskId: string, taskTitle: string, minutes: number) => {
    if (minutes <= 0) {
      // Удалить напоминание
      setReminders(prev => prev.filter(r => r.taskId !== taskId))
      return
    }

    setReminders(prev => {
      const existing = prev.find(r => r.taskId === taskId)
      if (existing) {
        // Обновить существующее
        return prev.map(r =>
          r.taskId === taskId
            ? { ...r, minutes, scheduledTime: Date.now() + minutes * 60 * 1000, notified: false }
            : r
        )
      } else {
        // Создать новое
        const newReminder: Reminder = {
          id: crypto.randomUUID(),
          taskId,
          taskTitle,
          minutes,
          notified: false,
          scheduledTime: Date.now() + minutes * 60 * 1000,
        }
        return [...prev, newReminder]
      }
    })
  }, [])

  const removeTaskReminders = useCallback((taskId: string) => {
    setReminders(prev => prev.filter(r => r.taskId !== taskId))
  }, [])

  const getTaskReminder = useCallback((taskId: string): Reminder | undefined => {
    return reminders.find(r => r.taskId === taskId)
  }, [reminders])

  const markAsNotified = useCallback((taskId: string) => {
    setReminders(prev =>
      prev.map(r => (r.taskId === taskId ? { ...r, notified: true } : r))
    )
  }, [])

  // Проверка напоминаний
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now()
      reminders.forEach(reminder => {
        if (!reminder.notified && now >= reminder.scheduledTime) {
          // Показать уведомление
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⏰ Напоминание', {
              body: reminder.taskTitle,
              icon: '/favicon.ico',
            })
          }
          // Звук
          const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
          audio.play().catch(() => {})
          
          markAsNotified(reminder.taskId)
        }
      })
    }, 5000)

    return () => clearInterval(checkInterval)
  }, [reminders, markAsNotified])

  return {
    reminders,
    permission,
    requestPermission,
    toggleReminder,
    removeTaskReminders,
    getTaskReminder,
    isLoaded,
  }
}
