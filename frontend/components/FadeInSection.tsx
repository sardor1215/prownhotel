'use client'

import React, { ElementType, useEffect, useRef, useState } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

interface FadeInSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: Direction
  as?: ElementType
  once?: boolean
}

const directionTransforms: Record<Direction, string> = {
  up: 'translate-y-8',
  down: '-translate-y-8',
  left: 'translate-x-8',
  right: '-translate-x-8',
}

export default function FadeInSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  as: Component = 'div',
  once = true,
}: FadeInSectionProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px',
      }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [once])

  const hiddenClass = `opacity-0 ${directionTransforms[direction]}`
  const visibleClass = 'opacity-100 translate-x-0 translate-y-0'

  return (
    <Component
      ref={ref as any}
      className={`transition-all duration-700 ease-out will-change-transform ${
        isVisible ? visibleClass : hiddenClass
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  )
}

