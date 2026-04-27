'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
  webpSrc?: string;
  avifSrc?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  threshold?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallback,
  webpSrc,
  avifSrc,
  placeholder = 'empty',
  blurDataURL,
  threshold = 0.1,
  className = '',
  onLoad,
  onError,
  alt,
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin: '50px 0px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const getImageSrc = () => {
    if (hasError && fallback) return fallback;
    return src;
  };

  const generatePictureSources = () => {
    const sources = [];
    
    if (avifSrc) {
      sources.push(
        <source
          key="avif"
          srcSet={avifSrc}
          type="image/avif"
        />
      );
    }
    
    if (webpSrc) {
      sources.push(
        <source
          key="webp"
          srcSet={webpSrc}
          type="image/webp"
        />
      );
    }
    
    return sources;
  };

  if (!isInView && placeholder === 'blur') {
    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden ${className}`}
        style={{ width, height }}
      >
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
    );
  }

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`relative bg-gray-200 ${className}`}
        style={{ width, height }}
      />
    );
  }

  if (webpSrc || avifSrc) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <picture>
          {generatePictureSources()}
          <Image
            src={getImageSrc()}
            alt={alt || ''}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            {...props}
          />
        </picture>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={getImageSrc()}
        alt={alt || ''}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        {...props}
      />
      {!isLoaded && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default LazyImage;
