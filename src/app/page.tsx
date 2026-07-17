'use client'

import { useState, useEffect, useCallback } from 'react'
import { Github, Brain, Plus, Filter, Settings2, Bell, Calendar as CalendarIcon, Sparkles, Zap, ZapOff } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { TaskModal } from '@/components/tasks/TaskModal'
import { TaskList } from '@/components/dashboard/TaskList'
import { TemplateModal } from '@/components/templates/TemplateModal'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { ShoppingModal } from '@/components/shopping/ShoppingModal'
import { ToastContainer } from '@/components/notifications/ToastContainer'
import { useTasks, DateFilter, StatusFilter } from '@/hooks/useTasks'
import { useTemplates } from '@/hooks/useTemplates'
import { useReminders } from '@/hooks/useReminders'
import { useShoppingList } from '@/hooks/useShoppingList'
import { useAIStatus } from '@/hooks/useAIStatus'
import { parseTaskFallback, isShoppingList, parseShoppingListSimple, getTodayDate } from '@/lib/ai-service'
import { Task, TaskFormData, ShoppingItem } from '@/types'
import { cn } from '@/lib/utils'

export default function Home() {
  const { tasks, createTask, updateTask, deleteTask, toggleStatus, stats, isLoaded, filterByDate, filterByStatus } = useTasks()
  const { templates, addTemplate, deleteTemplate, updateTemplate, isLoaded: templatesLoaded } = useTemplates()
  const { reminders, permission, requestPermission, toggleReminder, removeTaskReminders, getTaskReminder } = useReminders()
  const { stats: shoppingStats, isLoaded: shoppingLoaded } = useShoppingList()
  const { isAvailable: aiAvailable, isChecking, checkStatus } = useAIStatus()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [shoppingRefreshKey, setShoppingRefreshKey] = useState(0)
  
  const [newTaskData, setNewTaskData] = useState<{
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
    dueTime?: string
    shoppingItems?: ShoppingItem[]
    reminderMinutes?: number
  } | null>(null)
  
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [universalInput, setUniversalInput] = useState('')

  useEffect(() => {
    if (isLoaded && permission === 'default') {
      requestPermission()
    }
  }, [isLoaded, permission, requestPermission])

  useEffect(() => {
    setShoppingRefreshKey(prev => prev + 1)
  }, [shoppingStats.total, shoppingStats.remaining])

  const handleOpenModal = (title?: string) => {
    if (title) {
      const parsed = parseTaskFallback(title)
      setNewTaskData({
        title: parsed.title,
        description: parsed.description || undefined,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
        dueTime: parsed.dueTime,
        shoppingItems: undefined,
        reminderMinutes: undefined,
      })
    } else {
      setNewTaskData(null)
    }
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setNewTaskData({
      title: task.title,
      description: task.description || undefined,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      shoppingItems: task.shoppingItems,
      reminderMinutes: undefined,
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
    setNewTaskData(null)
  }

  const handleUniversalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!universalInput.trim()) return
    
    if (isShoppingList(universalInput)) {
      const { items, dueDate } = parseShoppingListSimple(universalInput)
      if (items.length > 0) {
        createTask({
          title: 'Покупки',
          description: items.map(i => `${i.title}${i.quantity ? ` ${i.quantity}${i.unit || ''}` : ''}`).join(', '),
          priority: 'medium',
          dueDate: dueDate || getTodayDate(),
          shoppingItems: items,
        })
        setUniversalInput('')
        return
      }
    }
    
    const parsed = parseTaskFallback(universalInput)
    setNewTaskData({
      title: parsed.title,
      description: parsed.description || undefined,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      shoppingItems: undefined,
      reminderMinutes: undefined,
    })
    setIsModalOpen(true)
    setUniversalInput('')
  }

  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
    } else {
      const newTask = createTask(data)
      
      if (data.reminderMinutes && data.reminderMinutes > 0 && newTask) {
        setTimeout(() => {
          toggleReminder(newTask.id, data.title, data.reminderMinutes!)
        }, 100)
      }
    }
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    removeTaskReminders(id)
    deleteTask(id)
  }

  const handleToggleReminder = (taskId: string, taskTitle: string, minutes: number) => {
    toggleReminder(taskId, taskTitle, minutes)
  }

  const handleToggleShoppingItem = useCallback((taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task?.shoppingItems) return
    updateTask(taskId, {
      shoppingItems: task.shoppingItems.map(item =>
        item.id === itemId ? { ...item, purchased: !item.purchased } : item
      )
    })
  }, [tasks, updateTask])

  const handleDateSelect = (date: Date | null) => {
    setSelectedCalendarDate(date)
    if (date) setDateFilter('all')
  }

  const handleCloseShoppingModal = () => {
    setIsShoppingModalOpen(false)
    setShoppingRefreshKey(prev => prev + 1)
  }

  const activeRemindersCount = reminders.filter(r => !r.notified).length

  let filteredTasks = tasks
  filteredTasks = filterByDate(filteredTasks, dateFilter)
  filteredTasks = filterByStatus(filteredTasks, statusFilter)
  
  if (selectedCalendarDate) {
    const selectedDateStr = selectedCalendarDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')
    filteredTasks = filteredTasks.filter(task => task.dueDate.toLowerCase().includes(selectedDateStr.toLowerCase()))
  }

  if (!isLoaded || !templatesLoaded || !shoppingLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <main className="relative min-h-screen py-12 px-6">
      <ToastContainer />

      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-white">AI Task Planner</span>
              {aiAvailable !== null && (
                <p className="text-xs text-white/40 flex items-center gap-1">
                  {aiAvailable ? (
                    <><Zap className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">ИИ активен</span></>
                  ) : (
                    <><ZapOff className="w-3 h-3 text-white/30" /><span className="text-white/30">ИИ недоступен</span></>
                  )}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={checkStatus} disabled={isChecking} className={`p-2 rounded-xl transition-all ${aiAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
              <Sparkles className="w-5 h-5" />
            </button>
            <button onClick={requestPermission} className={`p-2 rounded-xl transition-all ${permission === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
              <Bell className="w-5 h-5" />
            </button>
            <MagneticButton variant="ghost" icon={Github} onClick={() => window.open('https://github.com/dmironovru', '_blank')}>GitHub</MagneticButton>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto pt-32 pb-12">
        <section className="mb-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Управляйте задачами с <span className="text-gradient">умом</span></h1>
            <p className="text-white/50 text-lg">{aiAvailable ? '🤖 ИИ-помощник активен!' : 'ИИ-помощник для продуктивной работы'}</p>
          </div>

          <div className="max-w-2xl mx-auto mb-6">
            <form onSubmit={handleUniversalSubmit} className="relative">
              <input
                type="text"
                value={universalInput}
                onChange={(e) => setUniversalInput(e.target.value)}
                placeholder='Введите задачу или список покупок (например: "молоко, хлеб 2 шт")'
                className="w-full px-6 py-4 rounded-3xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 transition-all pr-14"
              />
              <button type="submit" disabled={!universalInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50">
                <Plus className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-white/40 mt-2 text-center">
              💡 Список покупок через запятую создаст задачу с кликабельными товарами
            </p>
          </div>

          {/* ✅ ИСПРАВЛЕНО: Уникальные ключи даже при пустом id */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {templates.map((template, index) => {
              const uniqueKey = template.id && template.id.trim() !== '' 
                ? template.id 
                : `tpl-${index}-${template.label}`
              
              return (
                <button 
                  key={uniqueKey} 
                  onClick={() => handleOpenModal(template.prefilledText)} 
                  className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                >
                  <span>{template.icon}</span><span>{template.label}</span>
                </button>
              )
            })}
            
            <button onClick={() => setIsTemplateModalOpen(true)} className="px-4 py-3 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </section>
        
        <section className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white/40" /><span className="text-white/60 text-sm">Период:</span>
                <div className="flex gap-2">
                  {[{ value: 'all', label: 'Все' }, { value: 'today', label: 'Сегодня' }, { value: 'week', label: 'Неделя' }, { value: 'month', label: 'Месяц' }].map((f) => (
                    <button key={f.value} onClick={() => { setDateFilter(f.value as DateFilter); setSelectedCalendarDate(null) }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${dateFilter === f.value ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Статус:</span>
                <div className="flex gap-2">
                  {[{ value: 'all', label: 'Все' }, { value: 'active', label: 'Активные' }, { value: 'completed', label: 'Завершённые' }].map((f) => (
                    <button key={f.value} onClick={() => setStatusFilter(f.value as StatusFilter)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === f.value ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>{f.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {selectedCalendarDate && (
                <button onClick={() => setSelectedCalendarDate(null)} className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />{selectedCalendarDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}<span className="text-white/40">×</span>
                </button>
              )}
              <span className="text-white/40 text-sm">{filteredTasks.length} задач</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <TaskList tasks={filteredTasks} onToggleStatus={toggleStatus} onDelete={handleDelete} onEdit={handleEdit} onToggleShoppingItem={handleToggleShoppingItem} />
            </GlassCard>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <CalendarWidget tasks={tasks} onDateSelect={handleDateSelect} selectedDate={selectedCalendarDate} />
            {activeRemindersCount > 0 && (
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-violet-400" />
                  <div><p className="text-sm text-white/60">Активных напоминаний</p><p className="text-lg font-semibold text-white">{activeRemindersCount}</p></div>
                </div>
              </GlassCard>
            )}
          </div>
        </section>
        
        <footer className="mt-12 text-center">
          <p className="text-sm text-white/30">Создано с ❤️ <a href="https://dmitrymironov.ru" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">Дмитрий Миронов</a></p>
        </footer>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingTask}
        prefilledTitle={newTaskData?.title}
        parsedDescription={newTaskData?.description}
        parsedPriority={newTaskData?.priority}
        parsedDueDate={newTaskData?.dueDate}
        parsedDueTime={newTaskData?.dueTime}
        existingShoppingItems={newTaskData?.shoppingItems}
        onToggleReminder={handleToggleReminder}
        activeReminder={editingTask ? getTaskReminder(editingTask.id) : undefined}
        aiAvailable={aiAvailable || false}
      />

      <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} templates={templates} onAdd={addTemplate} onDelete={deleteTemplate} onUpdate={updateTemplate} />
      <ShoppingModal isOpen={isShoppingModalOpen} onClose={handleCloseShoppingModal} aiAvailable={aiAvailable || false} />
    </main>
  )
}
