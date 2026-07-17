'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Edit2, Save } from 'lucide-react'
import { QuickTemplate } from '@/hooks/useTemplates'
import { cn } from '@/lib/utils'

interface TemplateManagerProps {
  templates: QuickTemplate[]
  onAdd: (template: Omit<QuickTemplate, 'id'>) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<QuickTemplate>) => void
}

export function TemplateManager({ templates, onAdd, onDelete, onUpdate }: TemplateManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newIcon, setNewIcon] = useState('📌')
  const [newText, setNewText] = useState('')

  const popularIcons = ['📌', '📅', '✉️', '🎯', '⭐', '🔥', '💡', '📝', '📞', '🏠', '💰', '🔄']

  const handleAdd = () => {
    if (!newLabel.trim() || !newText.trim()) return
    onAdd({ label: newLabel.trim(), icon: newIcon, prefilledText: newText.trim() })
    setNewLabel('')
    setNewIcon('📌')
    setNewText('')
    setIsAdding(false)
  }

  const handleUpdate = (id: string) => {
    const template = templates.find(t => t.id === id)
    if (!template) return
    onUpdate(id, { 
      label: newLabel || template.label, 
      icon: newIcon || template.icon, 
      prefilledText: newText || template.prefilledText 
    })
    setEditingId(null)
    setNewLabel('')
    setNewIcon('📌')
    setNewText('')
  }

  const startEdit = (template: QuickTemplate) => {
    setEditingId(template.id)
    setNewLabel(template.label)
    setNewIcon(template.icon)
    setNewText(template.prefilledText)
  }

  // ✅ Функция для генерации безопасного ключа
  const getSafeKey = (template: QuickTemplate, index: number): string => {
    if (template.id && template.id.trim() !== '') {
      return template.id
    }
    // Если id пустой, используем комбинацию индекса и label
    return `template-${index}-${template.label.replace(/\s+/g, '-')}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/60">Быстрые шаблоны</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          title="Добавить шаблон"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
          >
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Название (например: Позвонить клиенту)"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-violet-500/40"
            />
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Текст задачи"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-violet-500/40"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Иконка:</span>
              <div className="flex flex-wrap gap-1">
                {popularIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIcon(icon)}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all',
                      newIcon === icon
                        ? 'bg-violet-500/20 border border-violet-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim() || !newText.trim()}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
              >
                Добавить
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all text-sm"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates List */}
      <div className="flex flex-wrap gap-2">
        {templates.map((template, index) => {
          const safeKey = getSafeKey(template, index)
          
          return (
            <motion.div
              key={safeKey}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative"
            >
              {editingId === template.id ? (
                <div className="flex items-center gap-2 p-2 rounded-full bg-white/5 border border-white/10">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                  />
                  <button
                    onClick={() => handleUpdate(template.id)}
                    className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                  <span className="text-sm">{template.icon}</span>
                  <span className="text-sm text-white/70">{template.label}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(template)}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(template.id)}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
