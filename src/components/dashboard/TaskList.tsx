'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Trash2, Edit2, Clock } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

interface TaskListProps {
  tasks: Task[]
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onToggleShoppingItem?: (taskId: string, itemId: string) => void
}

const statusConfig = {
  'active': { 
    icon: Circle, 
    color: 'text-white/40', 
    bg: 'bg-white/5',
    hoverBg: 'hover:bg-emerald-500/20',
    label: 'Активная',
    labelColor: 'bg-white/10 text-white/60 border-white/20',
    hoverLabelColor: 'hover:bg-white/20 hover:border-white/30',
    tooltip: 'Отметить выполненной'
  },
  'done': { 
    icon: CheckCircle2, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/20',
    hoverBg: 'hover:bg-emerald-500/30',
    label: 'Завершено',
    labelColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    hoverLabelColor: 'hover:bg-emerald-500/30 hover:border-emerald-500/50',
    tooltip: 'Вернуть в активные'
  },
}

const priorityConfig = {
  low: 'bg-blue-500/20 text-blue-300',
  medium: 'bg-amber-500/20 text-amber-300',
  high: 'bg-rose-500/20 text-rose-300',
}

// ✅ ИСПРАВЛЕНО: НЕ используем toISOString()!
// Возвращаем строку в формате "YYYY-MM-DD" из локальной даты
function parseDueDateToKey(dueDate: string): string {
  const months: Record<string, number> = {
    'янв': 0, 'фев': 1, 'мар': 2, 'апр': 3, 'май': 4, 'июн': 5,
    'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'ноя': 10, 'дек': 11
  }
  
  const match = dueDate.toLowerCase().match(/(\d{1,2})\s*(янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек)/i)
  if (!match) return 'no-date'
  
  const day = String(parseInt(match[1], 10)).padStart(2, '0')
  const monthName = match[2].toLowerCase()
  const taskMonth = months[monthName]
  
  if (taskMonth === undefined) return 'no-date'
  
  const year = new Date().getFullYear()
  const month = String(taskMonth + 1).padStart(2, '0')
  
  // ✅ Возвращаем строку БЕЗ конвертации в Date и toISOString()
  return `${year}-${month}-${day}`
}

function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}
  
  tasks.forEach(task => {
    const dateKey = parseDueDateToKey(task.dueDate)
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(task)
  })
  
  // Сортировка по датам
  const sorted: Record<string, Task[]> = {}
  Object.keys(grouped)
    .sort((a, b) => {
      if (a === 'no-date') return 1
      if (b === 'no-date') return -1
      return a.localeCompare(b)
    })
    .forEach(key => {
      sorted[key] = grouped[key].sort((a, b) => {
        const timeA = a.dueTime || '23:59'
        const timeB = b.dueTime || '23:59'
        return timeA.localeCompare(timeB)
      })
    })
  
  return sorted
}

// ✅ ИСПРАВЛЕНО: Используем локальную дату для отображения
function formatDateKey(dateKey: string): { day: string, weekday: string, month: string } {
  if (dateKey === 'no-date') {
    return { day: 'Без даты', weekday: '', month: '' }
  }
  
  const parts = dateKey.split('-')
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  
  // ✅ Создаём дату в локальном времени
  const date = new Date(year, month, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const monthName = monthNames[month]
  
  let weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' })
  
  // Сравниваем даты по времени (убираем время для корректного сравнения)
  const dateTime = new Date(year, month, day).setHours(0, 0, 0, 0)
  
  if (dateTime === today.getTime()) {
    weekday = 'Сегодня'
  } else if (dateTime === tomorrow.getTime()) {
    weekday = 'Завтра'
  }
  
  return { 
    day: `${day}`, 
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    month: monthName
  }
}

function formatTime(time?: string): string {
  if (!time) return ''
  return time
}

export function TaskList({ tasks, onToggleStatus, onDelete, onEdit, onToggleShoppingItem }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <Circle className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white/40">Задач нет</p>
        <p className="text-white/30 text-sm mt-1">Создайте первую задачу</p>
      </div>
    )
  }

  const groupedTasks = groupTasksByDate(tasks)
  
  // ✅ Исправлено: Получаем сегодняшнюю дату в локальном времени
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {Object.entries(groupedTasks).map(([dateKey, dateTasks]) => {
          const { day, weekday, month } = formatDateKey(dateKey)
          const isToday = dateKey === todayKey
          
          return (
            <div key={dateKey} className="relative">
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-24 flex flex-col items-center justify-start pt-2",
                "border-r border-white/10 pr-4"
              )}>
                <div className={cn(
                  "text-center px-2 py-1 rounded-lg",
                  isToday ? "bg-violet-500/20 text-violet-300" : "text-white/60"
                )}>
                  <div className="text-xs font-medium">{weekday}</div>
                  <div className="text-lg font-bold">{day}</div>
                  <div className="text-xs text-white/40">{month}</div>
                </div>
              </div>

              <div className="ml-28 space-y-3">
                {dateTasks.map((task, index) => {
                  const statusStyles = statusConfig[task.status]
                  const StatusIcon = statusStyles.icon
                  const hasShoppingItems = task.shoppingItems && task.shoppingItems.length > 0
                  const purchasedCount = task.shoppingItems?.filter(i => i.purchased).length || 0
                  
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <GlassCard 
                        tilt={false} 
                        glow={true} 
                        className={cn(
                          "p-4 hover:bg-white/10 cursor-pointer group transition-all",
                          task.status === 'done' && 'opacity-60'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center min-w-[60px]">
                            {task.dueTime ? (
                              <>
                                <Clock className="w-4 h-4 text-white/30 mb-1" />
                                <span className="text-sm font-bold text-white/80">
                                  {formatTime(task.dueTime)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-white/30">—</span>
                            )}
                          </div>

                          <div className="relative flex items-center justify-center">
                            <div className={cn(
                              "w-3 h-3 rounded-full border-2",
                              task.status === 'done' 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'bg-white/5 border-white/30'
                            )} />
                            {index < dateTasks.length - 1 && (
                              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-full bg-white/10" />
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleStatus(task.id)
                            }}
                            className={cn(
                              'p-2.5 rounded-xl transition-all duration-300 group/btn',
                              statusStyles.bg,
                              statusStyles.hoverBg,
                              'hover:scale-110'
                            )}
                            title={statusStyles.tooltip}
                          >
                            <StatusIcon className={cn('w-5 h-5', statusStyles.color)} />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                'font-medium text-base truncate',
                                task.status === 'done' ? 'text-white/40 line-through' : 'text-white'
                              )}>
                                {task.title}
                              </h4>
                              {hasShoppingItems && (
                                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <span className="text-[10px]">🛒</span>
                                  {purchasedCount}/{task.shoppingItems!.length}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                priorityConfig[task.priority]
                              )}>
                                {task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий'}
                              </span>
                            </div>
                            
                            {hasShoppingItems && (
                              <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="flex flex-wrap gap-1.5">
                                  {task.shoppingItems!.map((item) => (
                                    <button
                                      key={item.id}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleShoppingItem?.(task.id, item.id)
                                      }}
                                      className={cn(
                                        'px-2 py-1 rounded-full text-xs transition-all border',
                                        item.purchased
                                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 line-through'
                                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                                      )}
                                    >
                                      {item.title}
                                      {item.quantity && (
                                        <span className="text-white/40 ml-0.5">
                                          {item.quantity}{item.unit}
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleStatus(task.id)
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-300',
                              statusStyles.labelColor,
                              statusStyles.hoverLabelColor
                            )}
                            title={statusStyles.tooltip}
                          >
                            {statusStyles.label}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(task)
                              }}
                              className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                              title="Редактировать"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(task.id)
                              }}
                              className="p-2 rounded-xl hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
