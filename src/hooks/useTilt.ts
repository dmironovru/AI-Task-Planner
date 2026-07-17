'use client'

import { useRef, useEffect, useState } from 'react'

interface TiltOptions {
  maxTilt?: number
  perspective?: number
  scale?: number
}

interface TiltResult {
  ref: React.RefObject<HTMLDivElement>
  style: React.CSSProperties
}

export function useTilt(options: TiltOptions = {}): TiltResult {
  const { maxTilt = 10, perspective = 1000, scale = 1.02 } = options
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = ((y - centerY) / centerY) * -maxTilt
      const rotateY = ((x - centerX) / centerX) * maxTilt

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transition: 'transform 0.1s ease-out',
      })
    }

    const handleMouseLeave = () => {
      setStyle({
        transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
        transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [maxTilt, perspective, scale])

  return { ref, style }
}