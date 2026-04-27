import React, { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  threshold?: number;
  rootMargin?: string;
  webpSrc?: string;
  avifSrc?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  threshold = 0.1,
  rootMargin = '50px',
  webpSrc,
  avifSrc,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Generate responsive image sources
  const generateSrcSet = () => {
    if (!src || typeof src !== 'string') return undefined;
    
    const baseUrl = src.replace(/\.(jpg|jpeg|png)$/i, '');
    const extension = src.match(/\.(jpg|jpeg|png)$/i)?.[1] || 'jpg';
    
    return `
      ${baseUrl}.${extension} 1x,
      ${baseUrl}@2x.${extension} 2x,
      ${baseUrl}@3x.${extension} 3x
    `.trim();
  };

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className || ''}`}
      style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <picture>
          {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <Image
            {...props}
            src={imageSrc}
            alt={alt}
            srcSet={generateSrcSet()}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;
