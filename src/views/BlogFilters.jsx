"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { blogCategories, blogTopics } from '../utils/blogUtils';

export const BlogFilters = ({
  selectedCategory,
  selectedTopics,
  activeFilterCount,
  onCategoryChange,
  onToggleTopic,
  onClearAll,
}) => {
  const categories = ['All', ...blogCategories];

  return (
    <div className="space-y-6" data-testid="blog-filter-sidebar">
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 ">
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
          </span>
          <button
            onClick={onClearAll}
            className="text-sm text-[#5B22D6] hover:underline font-medium"
            data-testid="blog-clear-filters"
          >
            Reset all
          </button>
        </div>
      )}

      <div>
        <h4 className="text-sm font-bold text-slate-900  mb-3 uppercase tracking-wider">Industry</h4>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-[#5B22D6] text-white font-semibold'
                  : 'text-slate-600  hover:bg-slate-100 :bg-slate-800'
              }`}
              data-testid={`blog-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900  mb-3 uppercase tracking-wider">Topic</h4>
        <div className="space-y-1">
          {blogTopics.map((topic) => (
            <label
              key={topic}
              onClick={() => onToggleTopic(topic)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 :bg-slate-800 transition-colors"
              data-testid={`blog-topic-${topic.toLowerCase().replace(/[\s&]+/g, '-')}`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                selectedTopics.includes(topic)
                  ? 'bg-[#5B22D6] border-[#5B22D6]'
                  : 'border-slate-300 '
              }`}>
                {selectedTopics.includes(topic) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-600 ">{topic}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

BlogFilters.propTypes = {
  selectedCategory: PropTypes.string.isRequired,
  selectedTopics: PropTypes.array.isRequired,
  activeFilterCount: PropTypes.number.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onToggleTopic: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
};
