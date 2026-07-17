'use client'

import { motion } from 'framer-motion'
import { useMagnetic } from '@/hooks/useMagnetic'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: LucideIcon
  onClick?: () => void
  disabled?: boolean
}

export function MagneticButton({
  children,
  className,
  variant = 'primary',
  icon: Icon,
  onClick,
  disabled,
}: MagneticButtonProps) {
  const { ref, style } = useMagnetic({ strength: 0.4 })

  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/30',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-white/80 hover:text-white',
  }

  return (
    <motion.button
      ref={ref}
      style={style}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'rounded-full px-6 py-3 font-medium',
        'transition-all duration-300 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-organic-bg',
        variants[variant],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect for primary */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 blur-xl opacity-50 -z-10"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {Icon && <Icon className="w-5 h-5" />}
      <span className="relative">{children}</span>
    </motion.button>
  )
}