'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { Reminder } from '@/hooks/useReminders'

interface Toast {
  id: string
  title: string
  message: string
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const handleReminder = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ reminder: Reminder }>
    const toast: Toast = {
      id: crypto.randomUUID(),
      title: '⏰ Напоминание',
      message: customEvent.detail.reminder.taskTitle,
    }
    
    // Используем functional update
    setToasts(prev => [...prev, toast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 10000)
  }, [])

  useEffect(() => {
    window.addEventListener('task-reminder', handleReminder as EventListener)
    return () => {
      window.removeEventListener('task-reminder', handleReminder as EventListener)
    }
  }, [handleReminder])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="relative overflow-hidden rounded-2xl bg-[#0f0f1a] border border-white/10 shadow-2xl p-4 pointer-events-auto"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500" />
            
            <div className="flex items-start gap-3 pl-3">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Bell className="w-5 h-5 text-violet-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{toast.title}</p>
                <p className="text-sm text-white/60 mt-1 truncate">{toast.message}</p>
              </div>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
