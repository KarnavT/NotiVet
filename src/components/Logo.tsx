import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Stethoscope } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'icon' | 'full' | 'text'
  className?: string
  clickable?: boolean
}

const sizeMap = {
  sm: { icon: 'w-7 h-7', container: 'w-9 h-9', text: 'text-xl' },
  md: { icon: 'w-9 h-9', container: 'w-12 h-12', text: 'text-3xl' },
  lg: { icon: 'w-11 h-11', container: 'w-14 h-14', text: 'text-4xl' },
  xl: { icon: 'w-14 h-14', container: 'w-18 h-18', text: 'text-5xl' },
  '2xl': { icon: 'w-20 h-20', container: 'w-24 h-24', text: 'text-6xl' }
}

export default function Logo({ 
  size = 'md', 
  variant = 'full', 
  className = '',
  clickable = true 
}: LogoProps) {
  const sizes = sizeMap[size]
  
  // You can replace this with your custom logo image
  const hasCustomLogo = true // Set to true when you add your logo image
  
  if (variant === 'icon') {
    const iconContent = hasCustomLogo ? (
      <div className={`${sizes.container} rounded-lg overflow-hidden ${className}`}>
        <Image
          src="/images/NotiVet-logo.png"
          alt="NotiVet Logo"
          width={80}
          height={80}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    ) : (
      <div className={`${sizes.container} bg-blue-600 rounded-xl flex items-center justify-center ${className}`}>
        <Stethoscope className={`${sizes.icon} text-white`} />
      </div>
    )
    
    return clickable ? (
      <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
        {iconContent}
      </Link>
    ) : iconContent
  }
  
  if (variant === 'text') {
    const textContent = (
      <h1 className={`${sizes.text} font-bold text-blue-600 ${className}`}>
        NotiVet
      </h1>
    )
    
    return clickable ? (
      <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
        {textContent}
      </Link>
    ) : textContent
  }
  
  // Full variant (icon + text)
  const fullContent = (
    <div className={`flex items-center ${className}`}>
      {hasCustomLogo ? (
        <div className={`${sizes.container} rounded-lg overflow-hidden mr-3`}>
          <Image
            src="/images/NotiVet-logo.png"
            alt="NotiVet Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      ) : (
        <div className={`${sizes.container} bg-blue-600 rounded-xl flex items-center justify-center mr-3`}>
          <Stethoscope className={`${sizes.icon} text-white`} />
        </div>
      )}
      <h1 className={`${sizes.text} font-bold text-blue-600`}>
        NotiVet
      </h1>
    </div>
  )
  
  return clickable ? (
    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
      {fullContent}
    </Link>
  ) : fullContent
}