'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, ShoppingCart, Calendar, Trash2 } from 'lucide-react'
import { ShoppingItem, ShoppingItemFormData } from '@/types'
import { cn } from '@/lib/utils'
import { useShoppingList } from '@/hooks/useShoppingList'

interface ShoppingModalProps {
  isOpen: boolean
  onClose: () => void
  aiAvailable?: boolean
}

export function ShoppingModal({ isOpen, onClose, aiAvailable = false }: ShoppingModalProps) {
  const { items, addItem, togglePurchased, deleteItem, stats, categories, itemsByCategory } = useShoppingList()
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('other')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('')
  const [newItemDate, setNewItemDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemTitle.trim()) return

    addItem({
      title: newItemTitle.trim(),
      category: newItemCategory,
      quantity: newItemQuantity || undefined,
      unit: newItemUnit || undefined,
      dueDate: newItemDate || new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    })
    setNewItemTitle('')
    setNewItemCategory('other')
    setNewItemQuantity('')
    setNewItemUnit('')
    setNewItemDate('')
  }

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(c => c.value === categoryValue) || categories[categories.length - 1]
  }

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
            <div className="pointer-events-auto w-full max-w-5xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
              <div className="relative rounded-3xl bg-[#0f0f1a] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Список покупок</h2>
                      <p className="text-sm text-white/40">{stats.purchased} из {stats.total} куплено</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-80 p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-4 bg-white/5">
                    <h3 className="text-sm font-medium text-white/60 mb-3">Добавить товар</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          placeholder="Например: молоко, хлеб 2 шт"
                          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={!newItemTitle.trim()}
                        className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-medium hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить</span>
                      </button>
                      
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-[#0f0f1a] px-2 text-white/30">или вручную</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Категория</label>
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/40 transition-all text-sm"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value} className="bg-[#0f0f1a]">
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-white/40 mb-1">Кол-во</label>
                          <input
                            type="text"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(e.target.value)}
                            placeholder="1, 2, 5..."
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-emerald-500/40 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/40 mb-1">Ед.</label>
                          <select
                            value={newItemUnit}
                            onChange={(e) => setNewItemUnit(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/40 transition-all text-sm"
                          >
                            <option value="" className="bg-[#0f0f1a]">—</option>
                            <option value="кг" className="bg-[#0f0f1a]">кг</option>
                            <option value="г" className="bg-[#0f0f1a]">г</option>
                            <option value="л" className="bg-[#0f0f1a]">л</option>
                            <option value="мл" className="bg-[#0f0f1a]">мл</option>
                            <option value="шт" className="bg-[#0f0f1a]">шт</option>
                            <option value="уп" className="bg-[#0f0f1a]">уп</option>
                            <option value="пач" className="bg-[#0f0f1a]">пач</option>
                            <option value="бан" className="bg-[#0f0f1a]">бан</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-white/40 mb-1">Дата покупки</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            value={newItemDate}
                            onChange={(e) => setNewItemDate(e.target.value)}
                            placeholder="15 июл"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-emerald-500/40 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {Object.keys(itemsByCategory).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/40">Список покупок пуст</p>
                        <p className="text-white/30 text-sm mt-1">Добавьте первый товар</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
                          const categoryInfo = getCategoryInfo(category)
                          return (
                            <div key={category} className="space-y-2">
                              <h3 className={cn('text-xs font-medium px-2 py-1 rounded-lg', categoryInfo.color)}>
                                {categoryInfo.label}
                              </h3>
                              <div className="space-y-2">
                                {categoryItems.map((item) => (
                                  <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={cn(
                                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                                      item.purchased
                                        ? 'bg-emerald-500/10 border-emerald-500/20'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    )}
                                  >
                                    <button
                                      onClick={() => togglePurchased(item.id)}
                                      className={cn(
                                        'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                                        item.purchased
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-white/10 text-white/30 hover:bg-white/20'
                                      )}
                                    >
                                      {item.purchased && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                      <span className={cn(
                                        'text-sm',
                                        item.purchased ? 'text-white/40 line-through' : 'text-white'
                                      )}>
                                        {item.title}
                                      </span>
                                      {item.quantity && (
                                        <span className={cn(
                                          'ml-2 text-xs px-2 py-0.5 rounded-full',
                                          item.purchased ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                                        )}>
                                          {item.quantity} {item.unit}
                                        </span>
                                      )}
                                    </div>

                                    <div className="hidden sm:flex items-center gap-1 text-xs text-white/40">
                                      <Calendar className="w-3 h-3" />
                                      <span>{item.dueDate}</span>
                                    </div>

                                    <button
                                      onClick={() => deleteItem(item.id)}
                                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/30 hover:text-rose-400 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Прогресс покупок</span>
                      <span className="text-sm font-medium text-white">{Math.round((stats.purchased / stats.total) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.purchased / stats.total) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
