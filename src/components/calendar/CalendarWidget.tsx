'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

interface CalendarWidgetProps {
  tasks: Task[]
  onDateSelect: (date: Date | null) => void
  selectedDate: Date | null
}

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const months: Record<string, number> = {
  'янв': 0, 'фев': 1, 'мар': 2, 'апр': 3, 'май': 4, 'июн': 5,
  'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'ноя': 10, 'дек': 11
}

export function CalendarWidget({ tasks, onDateSelect, selectedDate }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date()

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6
    
    return { startDay, totalDays: lastDay.getDate(), year, month }
  }

  const { startDay, totalDays, year, month } = getDaysInMonth(currentMonth)

  // === УЛУЧШЕННЫЙ ПАРСИНГ ДАТЫ ===
  const parseDueDate = (dueDate: string): { day: number, month: number, year: number } | null => {
    const lower = dueDate.toLowerCase()
    
    // Формат 1: "29 июля", "15 янв" и т.д.
    const textMatch = lower.match(/(\d{1,2})\s*(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)/i)
    if (textMatch) {
      const day = parseInt(textMatch[1], 10)
      const monthName = textMatch[2].toLowerCase()
      const taskMonth = months[monthName]
      if (taskMonth !== undefined) {
        return { day, month: taskMonth, year }
      }
    }
    
    // Формат 2: "29.07.2026", "29.07", "15.01.2025" и т.д.
    const numericMatch = dueDate.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/)
    if (numericMatch) {
      const day = parseInt(numericMatch[1], 10)
      const monthNum = parseInt(numericMatch[2], 10) - 1 // 0-indexed
      const yearNum = numericMatch[3] ? 
        (numericMatch[3].length === 2 ? 2000 + parseInt(numericMatch[3], 10) : parseInt(numericMatch[3], 10)) 
        : year
      
      // Показываем только если месяц совпадает с текущим отображаемым
      if (monthNum === month && yearNum === year) {
        return { day, month: monthNum, year: yearNum }
      }
      return null
    }
    
    return null
  }

  // Проверяем, есть ли задача ТОЧНО на этот день
  const getTasksForDay = (day: number): Task[] => {
    return tasks.filter(task => {
      const taskDate = parseDueDate(task.dueDate)
      if (!taskDate) return false
      // ТОЛЬКО точное совпадение даты
      return taskDate.day === day && taskDate.month === month && taskDate.year === year
    })
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    onDateSelect(new Date())
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    onDateSelect(clickedDate)
  }

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const todayStr = formatDateKey(today)

  return (
    <GlassCard className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h3 className="text-sm font-semibold text-white">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Сегодня
          </button>
        </div>
        
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-white/40 font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateKey === todayStr
          const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey
          const dayTasks = getTasksForDay(day)
          const hasTasksOnDay = dayTasks.length > 0

          return (
            <motion.button
              key={day}
              onClick={() => handleDateClick(day)}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all',
                'text-sm font-medium',
                isSelected
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : isToday
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{day}</span>
              
              {hasTasksOnDay && (
                <div className={cn(
                  'absolute bottom-1.5 flex gap-0.5',
                  isSelected ? 'text-white' : 'text-violet-400'
                )}>
                  {dayTasks.length > 3 ? (
                    <Circle className="w-1 h-1 fill-current" />
                  ) : (
                    Array.from({ length: dayTasks.length }).map((_, j) => (
                      <Circle key={j} className="w-1 h-1 fill-current" />
                    ))
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span>Выбрано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span>Сегодня</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 fill-violet-400" />
          <span>Задачи</span>
        </div>
      </div>
    </GlassCard>
  )
}
