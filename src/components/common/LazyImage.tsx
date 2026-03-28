'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image, { ImageProps } from 'next/image'
import { ImageIcon } from 'lucide-react'

interface LazyImageProps extends Omit<ImageProps, 'placeholder'> {
  /** Fallback image src to show if the main src fails to load */
  fallbackSrc?: string
  /** Whether to show a skeleton placeholder while loading (default: true) */
  showSkeleton?: boolean
  /** Whether to enable fade-in animation when image loads (default: true) */
  fadeIn?: boolean
  /** Root margin for intersection observer (default: '200px') */
  rootMargin?: string
  /** Optional base64 blur placeholder for blur-up effect */
  blurDataURL?: string
}

/**
 * LazyImage Component
 * 
 * A performance-optimized wrapper around next/image that provides:
 * - Intersection Observer-based lazy loading with configurable rootMargin
 * - Blur-up placeholder support
 * - Fade-in animation when the image enters the viewport
 * - Error state with a fallback UI
 * - Skeleton placeholder while loading
 * 
 * @example
 * <LazyImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
 * />
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  showSkeleton = true,
  fadeIn = true,
  rootMargin = '200px',
  blurDataURL,
  className = '',
  style,
  onLoad,
  onError,
  ...imageProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>(typeof src === 'string' ? src : '')
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [rootMargin])

  // Handle image load
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true)
    onLoad?.(e)
  }

  // Handle image error
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true)
    setIsLoaded(true)
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    }
    
    onError?.(e)
  }

  // Update src when prop changes
  useEffect(() => {
    if (typeof src === 'string') {
      setCurrentSrc(src)
      setHasError(false)
      setIsLoaded(false)
    }
  }, [src])

  // Build the image className with fade-in animation
  const imageClassName = `
    ${fadeIn ? 'transition-opacity duration-300' : ''}
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
    ${className}
  `.trim()

  return (
    <div
      ref={imgRef}
      className="relative overflow-hidden"
      style={{
        width: imageProps.width ? `${imageProps.width}px` : '100%',
        height: imageProps.height ? `${imageProps.height}px` : '100%',
        ...style,
      }}
    >
      {/* Skeleton placeholder */}
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer rounded-lg" />
      )}

      {/* Error state fallback */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</span>
        </div>
      )}

      {/* Actual image - only render when in view */}
      {isInView && (
        <Image
          {...imageProps}
          src={hasError && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          className={imageClassName}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={blurDataURL ? 'blur' : undefined}
          blurDataURL={blurDataURL}
          style={{
            width: '100%',
            height: '100%',
            objectFit: imageProps.objectFit || 'cover',
          }}
        />
      )}
    </div>
  )
}

export default LazyImage
