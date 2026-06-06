"use client";
import { motion } from 'framer-motion';
import React from 'react';
import PropTypes from 'prop-types';

export const FadeInWhenVisible = ({ children, delay = 0, duration = 0.6, direction = 'up' }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

export const ScaleInWhenVisible = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerChildren = ({ children, staggerDelay = 0.1 }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

FadeInWhenVisible.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
};
