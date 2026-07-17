'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, X } from 'lucide-react'
import { Reminder } from '@/hooks/useReminders'
import { cn } from '@/lib/utils'

interface ReminderSelectorProps {
  taskId: string
  taskTitle: string
  onToggleReminder: (taskId: string, taskTitle: string, minutes: number) => void
  activeReminder?: Reminder
  isNewTask?: boolean
  onReminderChange?: (minutes: number | undefined) => void
  reminderMinutes?: number | undefined
}

const reminderOptions = [
  { value: 5, label: 'За 5 минут' },
  { value: 15, label: 'За 15 минут' },
  { value: 30, label: 'За 30 минут' },
  { value: 60, label: 'За 1 час' },
  { value: 120, label: 'За 2 часа' },
  { value: 1440, label: 'За 1 день' },
]

export function ReminderSelector({
  taskId,
  taskTitle,
  onToggleReminder,
  activeReminder,
  isNewTask = false,
  onReminderChange,
  reminderMinutes,
}: ReminderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMinutes, setSelectedMinutes] = useState<number | undefined>(
    isNewTask ? reminderMinutes : activeReminder?.minutes
  )

  useEffect(() => {
    if (isNewTask) {
      setSelectedMinutes(reminderMinutes)
    } else {
      setSelectedMinutes(activeReminder?.minutes)
    }
  }, [isNewTask, reminderMinutes, activeReminder])

  const handleSelect = (minutes: number) => {
    setSelectedMinutes(minutes)
    setIsOpen(false)
    
    if (isNewTask) {
      onReminderChange?.(minutes)
    } else {
      onToggleReminder(taskId, taskTitle, minutes)
    }
  }

  const handleRemove = () => {
    setSelectedMinutes(undefined)
    if (!isNewTask && activeReminder) {
      onToggleReminder(taskId, taskTitle, 0)
    }
    onReminderChange?.(undefined)
  }

  const getSelectedLabel = () => {
    if (!selectedMinutes) return 'Напомнить'
    const option = reminderOptions.find(o => o.value === selectedMinutes)
    return option?.label || 'Напомнить'
  }

  return (
    <div className="relative">
      <label className="block text-sm text-white/60 mb-2">
        🔔 Напоминание
      </label>
      
      {selectedMinutes ? (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-violet-500/20 border border-violet-500/30">
          <Bell className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-violet-300 flex-1">
            {getSelectedLabel()}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 rounded-lg hover:bg-violet-500/30 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm">{getSelectedLabel()}</span>
            <Clock className="w-4 h-4 ml-auto text-white/30" />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 py-2 rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-xl">
              {reminderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {isNewTask && (
        <p className="text-xs text-white/40 mt-2">
          💡 Напоминание будет создано вместе с задачей
        </p>
      )}
    </div>
  )
}
