"use client"

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// Define the carrier logo data
const carrierLogos = [
  { name: 'AIG', src: '/images/aig-logo.png', alt: 'AIG Insurance' },
  { name: 'Americo', src: '/images/americo-logo.png', alt: 'Americo Insurance' },
  { name: 'Gerber', src: '/images/gerber-logo.png', alt: 'Gerber Insurance' },
  { name: 'Aetna', src: '/images/aetna-logo.png', alt: 'Aetna Insurance' },
  { name: 'Legacy', src: '/images/legacy-logo.png', alt: 'Legacy Insurance' },
]

export function CarrierLogoSlider() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isAnimationPaused, setIsAnimationPaused] = useState(false)

  // Auto-scroll the logos
  useEffect(() => {
    if (!sliderRef.current) return
    
    const slider = sliderRef.current
    let animationId: number
    let startTime: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      
      // Don't animate if paused
      if (!isAnimationPaused) {
        // Scroll 1px every 30ms (adjust for speed)
        slider.scrollLeft = (elapsed / 30) % (slider.scrollWidth - slider.clientWidth)
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isAnimationPaused])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-8">Our Trusted Carrier Partners</h2>
      
      <div 
        ref={sliderRef}
        className="flex overflow-x-hidden py-4 space-x-12"
        onMouseEnter={() => setIsAnimationPaused(true)}
        onMouseLeave={() => setIsAnimationPaused(false)}
      >
        {/* Double the logos for seamless looping */}
        {[...carrierLogos, ...carrierLogos].map((logo, index) => (
          <div 
            key={`${logo.name}-${index}`} 
            className="flex-none w-40 h-20 relative"
          >
            <div className="h-full flex items-center justify-center">
              {/* Fallback for missing logos */}
              <div className="text-center font-semibold">{logo.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 