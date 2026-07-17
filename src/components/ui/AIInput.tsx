'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIInputProps {
  onSubmit?: (value: string) => void
  className?: string
}

const suggestions = [
  'Запланировать встречу',
  'Написать письмо',
  'Расставить приоритеты',
]

export function AIInput({
  onSubmit,
  className,
}: AIInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && onSubmit) {
      setIsProcessing(true)
      onSubmit(value)
      setTimeout(() => {
        setValue('')
        setIsProcessing(false)
      }, 1000)
    }
  }

  return (
    <div className={cn('relative w-full max-w-3xl mx-auto', className)}>
      {/* Main input container */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 opacity-0 blur-xl"
          animate={{
            opacity: isFocused ? [0.3, 0.5, 0.3] : 0,
            scale: isFocused ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Input field */}
        <div
          className={cn(
            'relative flex items-center gap-4 rounded-3xl',
            'bg-white/5 backdrop-blur-4xl border border-white/10',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_30px_rgba(0,0,0,0.3)]',
            'transition-all duration-500',
            isFocused && 'border-violet-500/40 shadow-[0_0_60px_rgba(139,92,246,0.3)]'
          )}
        >
          {/* AI Icon with stars */}
          <motion.div
            className="pl-6"
            animate={{
              scale: isFocused ? [1, 1.1, 1] : 1,
              rotate: isFocused ? [0, 5, -5, 0] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: isFocused ? Infinity : 0,
            }}
          >
            <div className="relative">
              <Sparkles
                className={cn(
                  'w-6 h-6 transition-all duration-300',
                  isFocused ? 'text-violet-400' : 'text-white/30'
                )}
              />
              {isFocused && (
                <motion.div
                  className="absolute inset-0 text-violet-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Попросите ИИ создать задачу..."
            className={cn(
              'flex-1 bg-transparent py-5 text-white placeholder-white/30',
              'outline-none text-xl font-light tracking-wide',
              'transition-all duration-300'
            )}
            disabled={isProcessing}
          />
          
          {/* Action buttons */}
          <div className="flex items-center gap-3 pr-4">
            <AnimatePresence>
              {value && (
                <motion.button
                  type="submit"
                  disabled={isProcessing}
                  className="p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-violet-500/30"
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={isProcessing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
            
            <motion.button
              type="button"
              className="p-3 rounded-2xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.form>
      
      {/* Suggestion chips */}
      <AnimatePresence>
        {!value && (
          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4 }}
          >
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={suggestion}
                type="button"
                onClick={() => {
                  setValue(suggestion)
                  inputRef.current?.focus()
                }}
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 hover:text-white/80 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}