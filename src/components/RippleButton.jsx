"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const RippleButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);

  const addRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(event);
  };

  const baseStyles = 'relative overflow-hidden inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white  text-purple-600  border-2 border-purple-600  hover:bg-purple-50 :bg-slate-700',
    outline: 'border-2 border-slate-300  text-slate-700  hover:border-purple-600 :border-purple-400 hover:text-purple-600 :text-purple-400',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={addRipple}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animation: 'ripple 0.6s ease-out',
          }}
        />
      ))}
      {children}
      
      <style>{`
        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </motion.button>
  );
};

RippleButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
};
