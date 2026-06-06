"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const BentoHeroCard = ({ icon: Icon, title, description, items, className }) => (
  <motion.div
    variants={item}
    whileHover={{ y: -8, scale: 1.02 }}
    className={`bg-gradient-to-br from-purple-600 to-blue-600   rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-3xl font-bold mb-4">{title}</h3>
      <p className="text-white/90 text-lg mb-6">{description}</p>
      <ul className="space-y-2">
        {items.map((text) => (
          <li key={text} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

BentoHeroCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export const BentoGlassCard = ({ icon: Icon, iconGradient, title, description, className, layout }) => (
  <motion.div
    variants={item}
    whileHover={{ y: -8 }}
    className={`bg-white/70  backdrop-blur-xl border border-slate-200/50  rounded-3xl p-6 hover:bg-white/90 :bg-slate-800/90 transition-all group cursor-pointer ${className}`}
  >
    {layout === 'horizontal' ? (
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${iconGradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900  mb-2">{title}</h3>
          <p className="text-slate-600 ">{description}</p>
        </div>
      </div>
    ) : (
      <>
        <div className={`w-14 h-14 ${iconGradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900  mb-2">{title}</h3>
        <p className="text-slate-600 ">{description}</p>
      </>
    )}
  </motion.div>
);

BentoGlassCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconGradient: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  className: PropTypes.string,
  layout: PropTypes.oneOf(['vertical', 'horizontal']),
};

export const BentoStatCard = ({ icon: Icon, value, label, gradient, className, rotate }) => (
  <motion.div
    variants={item}
    whileHover={{ y: -8, rotate: rotate || 0 }}
    className={`${gradient} rounded-3xl p-6 group cursor-pointer ${className}`}
  >
    <Icon className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
    <div className="text-4xl font-black mb-1">{value}</div>
    <p className="font-medium">{label}</p>
  </motion.div>
);

BentoStatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  gradient: PropTypes.string.isRequired,
  className: PropTypes.string,
  rotate: PropTypes.number,
};

export const BentoCompactCard = ({ icon: Icon, value, label, gradient, className, rotate }) => (
  <motion.div
    variants={item}
    whileHover={{ y: -8, rotate: rotate || 0 }}
    className={`${gradient} rounded-3xl p-6 text-white flex flex-col justify-between group cursor-pointer relative overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 bg-grid-white opacity-10" />
    <Icon className="w-12 h-12 relative z-10 group-hover:rotate-12 transition-transform" />
    <div className="relative z-10">
      <div className="text-3xl font-black mb-1">{value}</div>
      <p className="text-white/90 text-sm">{label}</p>
    </div>
  </motion.div>
);

BentoCompactCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  gradient: PropTypes.string.isRequired,
  className: PropTypes.string,
  rotate: PropTypes.number,
};

export const BentoListCard = ({ icon: Icon, iconGradient, title, items, dotColor, className }) => (
  <motion.div
    variants={item}
    whileHover={{ y: -8 }}
    className={`bg-white/70  backdrop-blur-xl border border-slate-200/50  rounded-3xl p-8 hover:bg-white/90 :bg-slate-800/90 transition-all group cursor-pointer ${className}`}
  >
    <div className={`w-14 h-14 ${iconGradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900  mb-4">{title}</h3>
    <ul className="space-y-3 text-slate-600 ">
      {items.map((text) => (
        <li key={text} className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 ${dotColor} rounded-full`} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

BentoListCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconGradient: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  dotColor: PropTypes.string.isRequired,
  className: PropTypes.string,
};
