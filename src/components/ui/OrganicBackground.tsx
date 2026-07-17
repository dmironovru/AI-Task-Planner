'use client'

import { motion } from 'framer-motion'

function WireframeSphere({ 
  size, 
  color, 
  x, 
  y, 
  delay,
  duration 
}: { 
  size: number
  color: string
  x: number
  y: number
  delay: number
  duration: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle at 30% 30%, ${color}40, transparent 70%)`,
        boxShadow: `0 0 ${size / 4}px ${color}60, inset 0 0 ${size / 6}px ${color}30`,
      }}
      animate={{
        y: [0, -40, 0],
        scale: [1, 1.1, 1],
        opacity: [0.4, 0.6, 0.4],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Wireframe grid overlay */}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent ${size / 12}px,
              ${color}40 ${size / 12}px,
              ${color}40 ${size / 10}px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent ${size / 12}px,
              ${color}40 ${size / 12}px,
              ${color}40 ${size / 10}px
            )
          `,
          backgroundSize: `${size / 6}px ${size / 6}px`,
        }}
      />
      {/* Inner glow */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${color}20, transparent 60%)`,
          filter: 'blur(20px)',
        }}
      />
    </motion.div>
  )
}

export function OrganicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-organic-bg">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e]" />
      
      {/* Large wireframe spheres */}
      <WireframeSphere
        size={500}
        color="#8b5cf6"
        x={-150}
        y={100}
        delay={0}
        duration={8}
      />
      <WireframeSphere
        size={400}
        color="#6366f1"
        x={800}
        y={-100}
        delay={2}
        duration={10}
      />
      <WireframeSphere
        size={350}
        color="#ec4899"
        x={600}
        y={500}
        delay={4}
        duration={9}
      />
      <WireframeSphere
        size={300}
        color="#8b5cf6"
        x={-100}
        y={600}
        delay={3}
        duration={11}
      />
      
      {/* Smaller floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: 80 + i * 30,
            height: 80 + i * 30,
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)' 
              : 'radial-gradient(circle, rgba(236, 72, 153, 0.25), transparent)',
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.6)_100%)]" />
    </div>
  )
}