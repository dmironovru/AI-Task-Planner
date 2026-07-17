'use client'

import { useState, useEffect, useCallback } from 'react'
import { checkOllamaAvailable } from '@/lib/ai-service'

export function useAIStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  const checkStatus = useCallback(async () => {
    setIsChecking(true)
    const available = await checkOllamaAvailable()
    setIsAvailable(available)
    setIsChecking(false)
    return available
  }, [])

  useEffect(() => {
    checkStatus()
    
    // Периодическая проверка каждые 30 секунд
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [checkStatus])

  return {
    isAvailable,
    isChecking,
    checkStatus,
  }
}
