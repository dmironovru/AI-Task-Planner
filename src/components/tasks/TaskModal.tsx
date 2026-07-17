'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Calendar, Clock, Wand2, Loader2, ShoppingCart, CheckCircle2, Bell } from 'lucide-react'
import { Task, TaskFormData, ShoppingItem } from '@/types'
import { cn } from '@/lib/utils'
import { ReminderSelector } from '@/components/notifications/ReminderSelector'
import { Reminder } from '@/hooks/useReminders'
import { parseTaskFallback, generateTaskDescription, suggestPriority, isShoppingList, parseShoppingListSimple } from '@/lib/ai-service'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => void
  initialData?: Task | null
  prefilledTitle?: string
  parsedDescription?: string
  parsedPriority?: 'low' | 'medium' | 'high'
  parsedDueDate?: string
  parsedDueTime?: string
  existingShoppingItems?: ShoppingItem[]
  onToggleShoppingItem?: (itemId: string) => void
  onToggleReminder?: (taskId: string, taskTitle: string, minutes: number) => void
  activeReminder?: Reminder
  aiAvailable?: boolean
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  prefilledTitle,
  parsedDescription,
  parsedPriority,
  parsedDueDate,
  parsedDueTime,
  existingShoppingItems,
  onToggleShoppingItem,
  onToggleReminder,
  activeReminder,
  aiAvailable = false,
}: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskFormData['priority']>('medium')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [isAIParsing, setIsAIParsing] = useState(false)
  const [isAIDescription, setIsAIDescription] = useState(false)
  const [parseInput, setParseInput] = useState('')
  const [hasParsed, setHasParsed] = useState(false)
  const [isShoppingListMode, setIsShoppingListMode] = useState(false)
  const [reminderMinutes, setReminderMinutes] = useState<number | undefined>(undefined)
  const [newTaskReminder, setNewTaskReminder] = useState<number | undefined>(undefined)

  // Сброс состояния при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      if (prefilledTitle) {
        setTitle(prefilledTitle)
        setDescription(parsedDescription || '')
        setPriority(parsedPriority || 'medium')
        setDueDate(parsedDueDate || '')
        setDueTime(parsedDueTime || '')
        if (existingShoppingItems && existingShoppingItems.length > 0) {
          setShoppingItems(existingShoppingItems)
          setIsShoppingListMode(true)
        } else {
          setShoppingItems([])
          setIsShoppingListMode(false)
        }
        setReminderMinutes(undefined)
        setNewTaskReminder(undefined)
        setHasParsed(true)
      } else if (initialData) {
        setTitle(initialData.title)
        setDescription(initialData.description || '')
        setPriority(initialData.priority)
        setDueDate(initialData.dueDate)
        setDueTime(initialData.dueTime || '')
        setShoppingItems(initialData.shoppingItems || [])
        setIsShoppingListMode(!!initialData.shoppingItems?.length)
        setReminderMinutes(activeReminder?.minutes)
        setNewTaskReminder(undefined)
        setHasParsed(true)
      } else {
        setTitle('')
        setDescription('')
        setPriority('medium')
        setDueDate('')
        setDueTime('')
        setShoppingItems([])
        setIsShoppingListMode(false)
        setReminderMinutes(undefined)
        setNewTaskReminder(undefined)
        setHasParsed(false)
      }
      setParseInput('')
    }
  }, [isOpen, prefilledTitle, parsedDescription, parsedPriority, parsedDueDate, parsedDueTime, existingShoppingItems, initialData, activeReminder])

  const handleAIParse = async (text: string = parseInput) => {
    if (!text.trim()) return
    setIsAIParsing(true)
    
    if (isShoppingList(text)) {
      const { items, dueDate: parsedDueDate } = parseShoppingListSimple(text)
      if (items.length > 0) {
        setShoppingItems(items)
        setIsShoppingListMode(true)
        setTitle('Покупки')
        setDescription(items.map(i => `${i.title}${i.quantity ? ` ${i.quantity}${i.unit || ''}` : ''}`).join(', '))
        if (parsedDueDate) {
          setDueDate(parsedDueDate)
        } else {
          // Исправление даты - используем локальное время
          const today = new Date()
          const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
          setDueDate(`${today.getDate()} ${monthNames[today.getMonth()]}`)
        }
        setHasParsed(true)
        console.log('🛒 Распознан список покупок:', items, 'Дата:', parsedDueDate)
      }
    } else {
      const result = parseTaskFallback(text)
      setTitle(result.title)
      setDescription(result.description || '')
      setPriority(result.priority || 'medium')
      if (result.dueDate) setDueDate(result.dueDate)
      if (result.dueTime) setDueTime(result.dueTime)
      setShoppingItems([])
      setIsShoppingListMode(false)
      setReminderMinutes(undefined)
      setNewTaskReminder(undefined)
      setHasParsed(true)
      console.log('🟢 AI распарсил задачу:', result)
    }
    
    setParseInput('')
    setIsAIParsing(false)
  }

  const handleAIGenerateDescription = async () => {
    if (!title.trim()) return
    setIsAIDescription(true)
    const desc = await generateTaskDescription(title)
    if (desc) setDescription(desc)
    setIsAIDescription(false)
  }

  const handleAISuggestPriority = async () => {
    if (!title.trim()) return
    const priority = await suggestPriority(title, description)
    setPriority(priority)
  }

  const handleToggleShoppingItem = (itemId: string) => {
    setShoppingItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, purchased: !item.purchased } : item
    ))
    onToggleShoppingItem?.(itemId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (parseInput.trim() && !hasParsed) {
      handleAIParse(parseInput)
      return
    }
    
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      dueTime: dueTime || undefined,
      shoppingItems: shoppingItems.length > 0 ? shoppingItems : undefined,
      reminderMinutes: newTaskReminder,
    })
  }

  const priorities = [
    { value: 'low', label: 'Низкий', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { value: 'medium', label: 'Средний', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { value: 'high', label: 'Высокий', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  ] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pointer-events-auto w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="relative rounded-3xl bg-[#0f0f1a] border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {initialData ? 'Редактировать задачу' : 'Новая задача'}
                      </h2>
                      <p className="text-sm text-white/40">
                        {initialData ? 'Измените параметры' : 'Заполните информацию'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      🤖 Введите задачу или список покупок
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={parseInput}
                        onChange={(e) => setParseInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAIParse())}
                        placeholder='Например: "картошка 2 кг, молоко 1 л" или "Встреча завтра в 15:00"'
                        className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleAIParse()}
                        disabled={isAIParsing || !parseInput.trim()}
                        className="px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAIParsing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Wand2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      💡 Список покупок через запятую создаст задачу с кликабельными товарами
                    </p>
                  </div>

                  {shoppingItems.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">
                          Список покупок ({shoppingItems.filter(i => i.purchased).length}/{shoppingItems.length})
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {shoppingItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleToggleShoppingItem(item.id)}
                            className={cn(
                              'w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left',
                              item.purchased
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 rounded-lg flex items-center justify-center border transition-all',
                              item.purchased
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-white/30 text-transparent hover:border-white/50'
                            )}>
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <span className={cn(
                              'text-sm',
                              item.purchased && 'line-through'
                            )}>
                              {item.title}
                              {item.quantity && (
                                <span className="text-xs text-white/40 ml-1">
                                  {item.quantity}{item.unit}
                                </span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!shoppingItems.length && (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0f0f1a] px-2 text-white/40">или заполните вручную</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Название задачи
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Что нужно сделать?"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-white/60">
                        Описание
                      </label>
                      <button
                        type="button"
                        onClick={handleAIGenerateDescription}
                        disabled={isAIDescription || !title.trim()}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {isAIDescription ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                        <span>AI-генерация</span>
                      </button>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Детали задачи..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Дата
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          placeholder="15 июл"
                          className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Время
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          placeholder="14:30"
                          className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-white/60">
                        Приоритет
                      </label>
                      <button
                        type="button"
                        onClick={handleAISuggestPriority}
                        disabled={!title.trim()}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>AI-подсказка</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {priorities.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={cn(
                            'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all',
                            priority === p.value
                              ? p.color
                              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Напоминание - работает для новых и существующих задач */}
                  {onToggleReminder && (
                    <ReminderSelector
                      taskId={initialData?.id || 'new-task-' + Date.now()}
                      taskTitle={title}
                      onToggleReminder={onToggleReminder}
                      activeReminder={activeReminder}
                      isNewTask={!initialData}
                      onReminderChange={setNewTaskReminder}
                      reminderMinutes={newTaskReminder}
                    />
                  )}

                  <button
                    type="submit"
                    disabled={!title.trim() && !parseInput.trim()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30"
                  >
                    {initialData ? 'Сохранить изменения' : 'Создать задачу'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
