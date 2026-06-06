"use client";
import React from 'react';

/**
 * SkipLinks Component
 * 
 * Accessibility feature that allows keyboard users to skip repetitive navigation
 * and jump directly to main content. Hidden visually but available to screen readers
 * and keyboard navigation.
 * 
 * WCAG 2.1 Level A Requirement
 * 
 * @component
 */
export const SkipLinks = () => {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-link"
      >
        Skip to navigation
      </a>
      <a
        href="#footer"
        className="skip-link"
      >
        Skip to footer
      </a>
      
      <style>{`
        .skip-links {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 9999;
        }
        
        .skip-link {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
          background: #5B22D6;
          color: white;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          font-weight: 600;
          border-radius: 0 0 0.5rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .skip-link:focus {
          position: fixed;
          left: 0;
          top: 0;
          width: auto;
          height: auto;
          overflow: visible;
          z-index: 10000;
        }
        
        .skip-link:hover {
          background: #3F2BD9;
        }
      `}</style>
    </div>
  );
};
