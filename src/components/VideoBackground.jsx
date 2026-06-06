"use client";
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export const VideoBackground = ({ 
  videoUrl, 
  posterUrl, 
  opacity = 0.3,
  children,
  className = ''
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn('Video autoplay prevented:', err.message);
      });
    }
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={posterUrl}
          className="w-full h-full object-cover"
          style={{ opacity }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support video backgrounds.
        </video>
        
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Subtle warm Beamery/TalentSure-inspired ambient backdrop. Soft peach
// + lavender + pink orb washes on a near-white canvas. Used on the
// homepage hero. No purple/blue/cyan/green.
//
// PERF: Previously used `framer-motion` to drive 3 background orbs.
// Because Hero2026 is eager (above-the-fold), framer-motion + motion-dom
// + motion-utils were forced into the initial JS payload (~80KB gz of
// parse/exec cost for a purely decorative effect). Rewritten in pure
// CSS keyframes — identical visual, zero JS, zero TBT contribution.
// Keyframes live in `App.css` (`hero-orb-1/2/3` rules).
export const GradientMeshBackground = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* White canvas */}
      <div className="absolute inset-0 z-0" style={{ background: '#FFFFFF' }}>
        {/* Soft peach wash — bottom-right, behind the hero image area */}
        <div
          className="absolute bottom-0 right-0 w-[720px] h-[720px] rounded-full blur-3xl hero-orb hero-orb-1"
          style={{
            background: 'radial-gradient(circle, rgba(255,184,158,0.55) 0%, transparent 70%)',
            opacity: 0.9,
          }}
          aria-hidden="true"
        />

        {/* Lavender wash — top-left */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl hero-orb hero-orb-2"
          style={{
            background: 'radial-gradient(circle, rgba(187,158,255,0.40) 0%, transparent 70%)',
            opacity: 0.85,
          }}
          aria-hidden="true"
        />

        {/* Pink wash — center-right */}
        <div
          className="absolute top-1/3 right-0 w-[520px] h-[520px] rounded-full blur-3xl hero-orb hero-orb-3"
          style={{
            background: 'radial-gradient(circle, rgba(255,158,215,0.45) 0%, transparent 70%)',
            opacity: 0.75,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

VideoBackground.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  posterUrl: PropTypes.string,
  opacity: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string,
};

GradientMeshBackground.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
