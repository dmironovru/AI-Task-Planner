'use client'

import { useRef, useState, useEffect } from 'react'

interface MagneticOptions {
  strength?: number
}

export function useMagnetic(options: MagneticOptions = {}) {
  const { strength = 0.5 } = options
  const ref = useRef<HTMLButtonElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      const maxDistance = Math.max(rect.width, rect.height) / 2
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

      if (distance < maxDistance * 2) {
        const attraction = (1 - distance / (maxDistance * 2)) * strength
        setStyle({
          transform: `translate(${distanceX * attraction}px, ${distanceY * attraction}px)`,
          transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
        })
      } else {
        setStyle({
          transform: 'translate(0, 0)',
          transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        })
      }
    }

    const handleMouseLeave = () => {
      setStyle({
        transform: 'translate(0, 0)',
        transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength])

  return { ref, style }
}