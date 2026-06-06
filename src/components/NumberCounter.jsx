"use client";
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'framer-motion';

export const NumberCounter = ({ end, duration = 2, suffix = '', prefix = '', className = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationFrame;
    const endVal = end;
    const dur = duration;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (dur * 1000);

      if (progress < 1) {
        setCount(Math.floor(endVal * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(endVal);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

NumberCounter.propTypes = {
  end: PropTypes.number.isRequired,
  duration: PropTypes.number,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  className: PropTypes.string,
};
