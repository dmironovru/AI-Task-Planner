'use client'

import { useState, useEffect, useCallback } from 'react'

export interface QuickTemplate {
  id: string
  label: string
  icon: string
  prefilledText: string  // Важно!
}

const STORAGE_KEY = 'ai-task-planner-templates'

const defaultTemplates: QuickTemplate[] = [
  { id: '1', label: 'Запланировать встречу', icon: '📅', prefilledText: 'Запланировать встречу' },
  { id: '2', label: 'Написать письмо', icon: '✉️', prefilledText: 'Написать письмо' },
  { id: '3', label: 'Расставить приоритеты', icon: '🎯', prefilledText: 'Расставить приоритеты' },
]

export function useTemplates() {
  const [templates, setTemplates] = useState<QuickTemplate[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Исправляем старые шаблоны без prefilledText
        const fixed = parsed.map((t: any) => ({
          ...t,
          prefilledText: t.prefilledText || t.text || t.label || '',
        }))
        setTemplates(fixed)
      } catch (e) {
        console.error('Failed to parse templates:', e)
        setTemplates(defaultTemplates)
      }
    } else {
      setTemplates(defaultTemplates)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    }
  }, [templates, isLoaded])

  const addTemplate = useCallback((template: Omit<QuickTemplate, 'id'>) => {
    const newTemplate: QuickTemplate = {
      ...template,
      id: crypto.randomUUID(),
    }
    setTemplates(prev => [...prev, newTemplate])
    return newTemplate
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateTemplate = useCallback((id: string, data: Partial<QuickTemplate>) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, ...data } : t
    ))
  }, [])

  return {
    templates,
    isLoaded,
    addTemplate,
    deleteTemplate,
    updateTemplate,
  }
}
