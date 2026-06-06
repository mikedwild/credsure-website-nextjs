"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BlogPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12" data-testid="blog-pagination">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200  disabled:opacity-30 hover:bg-slate-50 :bg-slate-800 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let pageNum;
        if (totalPages <= 7) {
          pageNum = i + 1;
        } else if (currentPage <= 4) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 3) {
          pageNum = totalPages - 6 + i;
        } else {
          pageNum = currentPage - 3 + i;
        }
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
              currentPage === pageNum
                ? 'bg-[#5B22D6] text-white'
                : 'border border-gray-200  text-gray-600  hover:bg-slate-50 :bg-slate-800'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200  disabled:opacity-30 hover:bg-slate-50 :bg-slate-800 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

BlogPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};
