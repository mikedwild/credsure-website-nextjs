"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Lazy-loaded optimized image component
 * Supports WebP with fallback to original format
 * Implements native lazy loading and blur-up placeholder
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  priority = false,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Convert to WebP if supported (fallback to original)
  const getWebPSource = (originalSrc) => {
    if (!originalSrc) return originalSrc;
    
    // If already WebP, return as is
    if (originalSrc.endsWith('.webp')) return originalSrc;
    
    // For local images, suggest WebP version
    if (originalSrc.startsWith('/')) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return originalSrc;
  };

  const webpSrc = getWebPSource(src);
  const shouldLazyLoad = !priority;

  return (
    <picture>
      {/* WebP source for modern browsers */}
      {webpSrc !== src && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      
      {/* Fallback to original format */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        width={width}
        height={height}
        loading={shouldLazyLoad ? 'lazy' : 'eager'}
        decoding={shouldLazyLoad ? 'async' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </picture>
  );
};

export default LazyImage;

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
