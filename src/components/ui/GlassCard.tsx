'use client'

import { motion } from 'framer-motion'
import { useTilt } from '@/hooks/useTilt'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  tilt?: boolean
  glow?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className,
  tilt = true,
  glow = true,
  onClick,
}: GlassCardProps) {
  const { ref, style } = useTilt({ maxTilt: 8, scale: 1.01 })

  return (
    <motion.div
      ref={tilt ? ref : undefined}
      style={tilt ? style : undefined}
      className={cn(
        'relative rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.3)]',
        glow && 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_40px_rgba(139,92,246,0.2)]',
        'transition-all duration-500 ease-out',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Subtle inner glow on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500',
          'bg-gradient-to-br from-white/5 via-transparent to-transparent',
          glow && 'group-hover/card:opacity-100'
        )}
      />
      
      {/* Border gradient */}
      <div className="absolute inset-0 rounded-3xl p-[1px] -z-10">
        <div className="w-full h-full rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/5" />
      </div>
      
      <div className="relative group/card">{children}</div>
    </motion.div>
  )
}