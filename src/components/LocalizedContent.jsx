"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslations as useTranslation } from 'next-intl';
import DOMPurify from 'dompurify';

/**
 * LocalizedContent Component
 * Renders content in the current language with fallback support
 */
export const LocalizedContent = ({ 
  contentKey, 
  fallback = '', 
  variables = {},
  className = '',
  as: Component = 'span'
}) => {
  const { t } = useTranslation();
  
  const content = t(contentKey, { ...variables, defaultValue: fallback });
  
  return <Component className={className}>{content}</Component>;
};

LocalizedContent.propTypes = {
  contentKey: PropTypes.string.isRequired,
  fallback: PropTypes.string,
  variables: PropTypes.object,
  className: PropTypes.string,
  as: PropTypes.elementType,
};

/**
 * LocalizedHTML Component
 * Renders HTML content safely in the current language (sanitized via DOMPurify)
 */
export const LocalizedHTML = ({ 
  contentKey, 
  fallback = '', 
  variables = {},
  className = '',
  as: Component = 'div'
}) => {
  const { t } = useTranslation();
  
  const rawContent = t(contentKey, { ...variables, defaultValue: fallback });
  const sanitized = DOMPurify.sanitize(rawContent);
  
  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

LocalizedHTML.propTypes = {
  contentKey: PropTypes.string.isRequired,
  fallback: PropTypes.string,
  variables: PropTypes.object,
  className: PropTypes.string,
  as: PropTypes.elementType,
};

/**
 * LocalizedBlogPost Component
 * Renders blog post content with language support (sanitized via DOMPurify)
 */
export const LocalizedBlogPost = ({ post, field = 'content' }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  
  const localizedField = `${field}_${lang}`;
  const rawContent = post[localizedField] || post[`${field}_en`] || post[field] || '';
  const sanitized = DOMPurify.sanitize(rawContent);
  
  return (
    <div 
      className="prose  max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

LocalizedBlogPost.propTypes = {
  post: PropTypes.object.isRequired,
  field: PropTypes.string,
};

export default {
  LocalizedContent,
  LocalizedHTML,
  LocalizedBlogPost,
};
