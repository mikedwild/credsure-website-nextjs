"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, BookOpen, Play, FileText, Newspaper, Users, HelpCircle, Mail, Code } from 'lucide-react';

const contentCards = [
  {
    key: 'blog',
    icon: Newspaper,
    title: 'Blog',
    description: 'Latest insights on digital credentialing, industry trends, and best practices.',
    href: '/blog',
    image: 'https://images.unsplash.com/photo-1641580550451-3a452effc5b7?w=400&h=200&fit=crop',
    badge: '123 Articles',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    key: 'guides',
    icon: BookOpen,
    title: 'Guides & Insights',
    description: 'In-depth whitepapers, playbooks, and technical deep dives for your credentialing program.',
    href: '/guides',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    badge: 'Expert Resources',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    key: 'webinars',
    icon: Play,
    title: 'Webinars & Workshops',
    description: 'Watch expert-led sessions on blockchain verification, program management, and more.',
    href: '/webinars',
    image: 'https://images.unsplash.com/photo-1635840418908-772c54d7931f?w=400&h=200&fit=crop',
    badge: 'On-Demand',
    color: 'from-emerald-500 to-teal-600',
  },
];

const quickLinks = [
  { icon: FileText, label: 'Customer Stories', href: '/customer-success' },
  { icon: Users, label: 'About Us', href: '/about' },
  { icon: HelpCircle, label: 'Help Center', href: '/resources' },
  { icon: Mail, label: 'Contact Support', href: '/contact' },
];

export const ResourcesMegaPanel = ({ onLinkClick, megaMenuRef }) => {
  return (
    <div
      ref={megaMenuRef}
      className="fixed left-1/2 -translate-x-1/2 bg-white  rounded-2xl shadow-2xl border border-slate-200  p-8 animate-in fade-in slide-in-from-top-4 duration-200 z-50"
      style={{ top: '82px', width: '920px' }}
      role="menu"
      aria-label="Resources menu"
      data-testid="resources-mega-panel"
    >
      {/* Content Hub Cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {contentCards.map((card) => (
          <a
            key={card.key}
            href={card.href}
            onClick={(e) => { e.preventDefault(); onLinkClick(card.href); }}
            className="group relative rounded-xl overflow-hidden border border-slate-200  hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer"
            data-testid={`resources-card-${card.key}`}
          >
            {/* Thumbnail */}
            <div className="relative h-28 overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-2.5 left-2.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r ${card.color} text-white rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                  <card.icon className="w-3 h-3" />
                  {card.badge}
                </span>
              </div>
            </div>
            {/* Text */}
            <div className="p-4">
              <h4 className="font-bold text-slate-900  mb-1 group-hover:text-[#5B22D6] :text-purple-400 transition-colors text-sm">
                {card.title}
              </h4>
              <p className="text-xs text-slate-500  line-clamp-2 leading-relaxed">
                {card.description}
              </p>
              <span className="inline-flex items-center gap-1 text-[#5B22D6]  font-semibold text-xs mt-2 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200  pt-5">
        <div className="flex items-center justify-between">
          {/* Quick Links */}
          <div className="flex items-center gap-1 flex-wrap">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); onLinkClick(link.href); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600  hover:text-[#5B22D6] :text-purple-400 hover:bg-slate-50 :bg-slate-800 rounded-lg transition-colors cursor-pointer"
                data-testid={`resources-quick-${link.href.slice(1)}`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/demo"
            onClick={(e) => { e.preventDefault(); onLinkClick('/demo'); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5B22D6] to-[#3F2BD9] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
            data-testid="resources-demo-cta"
          >
            Book a Demo <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

ResourcesMegaPanel.propTypes = {
  onLinkClick: PropTypes.func,
  megaMenuRef: PropTypes.object,
};
