'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings2 } from 'lucide-react'
import { TemplateManager } from './TemplateManager'
import { QuickTemplate } from '@/hooks/useTemplates'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  templates: QuickTemplate[]
  onAdd: (template: Omit<QuickTemplate, 'id'>) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<QuickTemplate>) => void
}

export function TemplateModal({ isOpen, onClose, templates, onAdd, onDelete, onUpdate }: TemplateModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pointer-events-auto w-full max-w-md mx-4">
              <div className="relative rounded-3xl bg-[#0f0f1a] border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Settings2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Управление шаблонами</h2>
                      <p className="text-sm text-white/40">Добавляйте и редактируйте быстрые задачи</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <TemplateManager
                    templates={templates}
                    onAdd={onAdd}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
