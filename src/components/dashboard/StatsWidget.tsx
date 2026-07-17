'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Stats } from '@/types'
import { cn } from '@/lib/utils'

interface StatsWidgetProps {
  stats: Stats
}

export function StatsWidget({ stats }: StatsWidgetProps) {
  const activeCount = stats.total - stats.completed

  return (
    <GlassCard className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-white/60 text-sm mb-4 font-medium">
          Статистика задач
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Active */}
          <div className={cn(
            'p-3 rounded-2xl border transition-all',
            'bg-white/5 border-white/10 hover:bg-white/10'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/50">Активные</span>
            </div>
            <motion.span
              className="text-2xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {activeCount}
            </motion.span>
          </div>
          
          {/* Completed */}
          <div className={cn(
            'p-3 rounded-2xl border transition-all',
            'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400/70">Завершено</span>
            </div>
            <motion.span
              className="text-2xl font-bold text-emerald-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            >
              {stats.completed}
            </motion.span>
          </div>
        </div>
        
        {/* Mini progress bar */}
        {stats.total > 0 && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-white/40 mt-2 text-center">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% выполнено
            </p>
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  )
}
