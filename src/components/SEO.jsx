"use client";
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { useTranslations as useTranslation, useLocale } from 'next-intl';
import { useLocation } from '@/lib/router-shim';
import { enToRoute, deToRoute } from '@/config/routeConfig';

/**
 * SEO Component for CredSure
 * Handles meta tags, Open Graph, Twitter Cards, hreflang tags, and structured data
 * 
 * @param {string} titleKey - Translation key for page title
 * @param {string} descriptionKey - Translation key for meta description
 * @param {string} keywordsKey - Translation key for keywords (optional)
 * @param {string} canonical - Canonical URL path (e.g., "/use-cases/course-completion")
 * @param {string} ogImage - Open Graph image URL (optional)
 * @param {string} type - Open Graph type (default: "website")
 * @param {object} structuredData - JSON-LD structured data (optional)
 */
export const SEO = ({ 
  title: titleProp,
  description: descriptionProp,
  titleKey, 
  descriptionKey, 
  keywordsKey,
  canonical, 
  canonicalLang,
  ogImage,
  type = 'website',
  noIndex = false,
  structuredData 
}) => {
  const t = useTranslation();
  const locale = useLocale();
  const location = useLocation();
  const currentLang = locale || 'en';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  // Get translated content. When a key is set but i18n returns the key
  // itself (i.e. the translation is missing), fall back to the global
  // defaults so we never render literal i18n paths into <title> or
  // <meta description> for crawlers.
  const safeT = (key, fallback) => {
    if (!key) return fallback;
    const v = t(key);
    return !v || v === key ? fallback : v;
  };
  const DEFAULT_TITLE = 'CredSure | Digital Credential Platform — Blockchain Verified';
  const DEFAULT_DESC = 'Issue, manage, and verify blockchain-secured digital credentials, certificates, and badges.';
  const DEFAULT_KEYWORDS = 'digital credentials, blockchain certificates, credential verification, digital badges';
  // Direct `title`/`description` props win over the i18n-key path so
  // pages with awkward locale paths can pass strings directly.
  const rawTitle = titleProp || safeT(titleKey, DEFAULT_TITLE);
  const title = rawTitle === DEFAULT_TITLE || rawTitle.toLowerCase().includes('credsure')
    ? rawTitle
    : `${rawTitle} | CredSure`;
  const description = descriptionProp || safeT(descriptionKey, DEFAULT_DESC);
  const keywords = safeT(keywordsKey, DEFAULT_KEYWORDS);

  // Construct full URLs.
  // canonicalLang lets a page (e.g. a DE blog post that is rendering an EN
  // fallback because no translation exists) point its canonical at a
  // DIFFERENT language. Without this, Google sees `/en/blog/x` and
  // `/de/blog/x` serving identical HTML with self-canonicals and flags it
  // as "Duplicate without user-selected canonical" in Search Console.
  const canonicalLangPrefix = canonicalLang || currentLang;
  // Pages pass `canonical` as the ENGLISH slug (e.g. "/pricing").
  // When the current page is the German variant, the canonical must
  // point at the LOCALIZED slug ("/de/preise" — NOT "/de/pricing",
  // which would 404 because no such route exists). Translate via the
  // same enToRoute map we already use for hreflang to stay consistent.
  const translateCanonicalSlug = (slug) => {
    if (!slug) return '';
    const clean = slug.replace(/^\/+/, '').replace(/\/$/, '');
    if (canonicalLangPrefix === 'de') {
      const e = enToRoute[clean];
      if (e && e.de) return e.de;
    } else {
      const d = deToRoute[clean];
      if (d && d.en) return d.en;
    }
    return clean;
  };
  const canonicalUrl = canonical
    ? `${baseUrl}/${canonicalLangPrefix}/${translateCanonicalSlug(canonical)}`
    : `${baseUrl}${location.pathname}`;
  const ogImageUrl = ogImage || `${baseUrl}/og-image.jpg`;

  // Alternate language URLs for hreflang.
  // Translated slug map: /en/features/digital-certificates ↔
  // /de/funktionen/digitale-zertifikate. Without this, Google flags
  // "Duplicate without user-selected canonical" in Search Console because
  // the DE alternate would point at /de/features/digital-certificates,
  // which redirects/404s rather than serving the German page.
  const currentPath = location.pathname;
  const pathWithoutLang = currentPath.replace(/^\/(en|de)\/?/, '');
  const trimmedSlug = pathWithoutLang.replace(/\/$/, ''); // strip trailing slash for lookup
  const routeEntry = enToRoute[trimmedSlug] || deToRoute[trimmedSlug];
  const enSlug = routeEntry ? routeEntry.en : trimmedSlug;
  const deSlug = routeEntry ? routeEntry.de : trimmedSlug;
  const enUrl = trimmedSlug ? `${baseUrl}/en/${enSlug}` : `${baseUrl}/en`;
  const deUrl = trimmedSlug ? `${baseUrl}/de/${deSlug}` : `${baseUrl}/de`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Language */}
      <html lang={currentLang} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* hreflang Tags for Bilingual Support */}
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="de" href={deUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:locale" content={currentLang === 'de' ? 'de_DE' : 'en_US'} />
      <meta property="og:locale:alternate" content={currentLang === 'de' ? 'en_US' : 'de_DE'} />
      <meta property="og:site_name" content="CredSure" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* Additional SEO.
          The robots directive is dynamic so callers can `noIndex` 404s,
          admin pages, and any URL that should stay out of the index.
          Without this, our soft 404 page returns 200 + index/follow,
          which Search Console flags as "Excluded by noindex" in confusing
          ways and clutters the indexing report. */}
      <meta name="robots" content={noIndex ? 'noindex, follow' : 'index, follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex, follow' : 'index, follow'} />
      <meta name="revisit-after" content="7 days" />
      
      {/* Structured Data (JSON-LD).
          Filters null entries so callers can pass `combineSchemas(maybeNull, ...)`
          without emitting an empty/invalid block. Falsy values + empty arrays
          are skipped entirely so we never inject `<script>null</script>` or
          `<script>[]</script>`. */}
      {(() => {
        if (!structuredData) return null;
        if (Array.isArray(structuredData)) {
          const cleaned = structuredData.filter(Boolean);
          if (cleaned.length === 0) return null;
          return (
            <script type="application/ld+json">
              {JSON.stringify(cleaned.length === 1 ? cleaned[0] : cleaned)}
            </script>
          );
        }
        return (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        );
      })()}
    </Helmet>
  );
};

SEO.propTypes = {
  titleKey: PropTypes.string,
  descriptionKey: PropTypes.string,
  keywordsKey: PropTypes.string,
  canonical: PropTypes.string,
  canonicalLang: PropTypes.oneOf(['en', 'de']),
  schema: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object)
  ]),
  ogImage: PropTypes.string,
  noIndex: PropTypes.bool,
};

SEO.defaultProps = {
  noIndex: false,
};

/**
 * ============================================
 * PHASE 1: CRITICAL SCHEMA DEFINITIONS (P0)
 * ============================================
 */

/**
 * Organization Schema - FIXED: Now uses baseUrl parameter
 * Use site-wide for Knowledge Panel eligibility
 */
export const createOrganizationSchema = (baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CredSure",
  "url": baseUrl,
  "logo": `${baseUrl}/credsure-logo-main.webp`,
  "description": "Blockchain-secured digital credential platform for issuing, managing, and verifying certificates and badges",
  "foundingDate": "2024",
  "sameAs": [
    "https://www.linkedin.com/company/credsure",
    "https://twitter.com/credsure",
    "https://www.youtube.com/@credsure"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@credsure.com",
    "availableLanguage": ["English", "German"]
  },
  "knowsAbout": [
    "Digital Credentials",
    "Blockchain Verification",
    "Digital Badges",
    "Certificate Management",
    "Open Badges",
    "Micro-credentials"
  ]
});

/**
 * SoftwareApplication Schema - FIXED: Now uses baseUrl parameter
 * Use on homepage for rich snippets
 */
export const createSoftwareApplicationSchema = (baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CredSure",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": baseUrl,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free plan available"
  },
  "featureList": [
    "Blockchain-secured digital credentials",
    "Custom certificate templates",
    "Automated credential verification",
    "Multi-language support (English & German)",
    "API integration",
    "Bulk credential issuance",
    "Real-time analytics",
    "White-label solutions"
  ],
  "provider": {
    "@type": "Organization",
    "name": "CredSure",
    "url": baseUrl
  },
  "screenshot": `${baseUrl}/og-image.jpg`,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
});

/**
 * BreadcrumbList Schema
 * Use on all interior pages for navigation hierarchy
 */
export const createBreadcrumbSchema = (items, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `${baseUrl}${item.path}`
  }))
});

/**
 * ============================================
 * PHASE 2: HIGH-IMPACT SCHEMA (P1)
 * ============================================
 */

/**
 * FAQ Schema
 * Use on FAQ pages and support pages.
 *
 * Hardened against the two Search Console issues that hit us historically:
 *   1. "Missing field 'mainEntity'" — happened when this was called with an
 *      empty array (e.g. before i18n had loaded the FAQ items). We now
 *      return `null` in that case so the SEO consumer can skip rendering
 *      the schema entirely.
 *   2. "Duplicate field 'FAQPage'" — happened when two FAQPage blocks ended
 *      up on the same page (Helmet preserving stale schemas across SPA
 *      navigations or i18n hydration races). We attach an explicit `@id`
 *      based on the current pathname so consumers + crawlers can match
 *      duplicates by id and treat them as the same entity.
 *
 * Also filters out malformed entries (missing question or answer) so a
 * partial i18n bundle never produces "incomplete Question" warnings.
 */
export const createFAQSchema = (faqs, baseUrl, pathname) => {
  if (!Array.isArray(faqs)) return null;
  const cleaned = faqs.filter(f => f && typeof f.question === 'string' && f.question.trim() && typeof f.answer === 'string' && f.answer.trim());
  if (cleaned.length === 0) return null;

  const idBase = (baseUrl || '') + (pathname || '/') + '#faq';

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": idBase,
    "mainEntity": cleaned.map((faq, i) => ({
      "@type": "Question",
      "@id": `${idBase}-q${i + 1}`,
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

/**
 * Review/AggregateRating Schema
 * Use on homepage or testimonials section
 */
export const createProductWithReviewsSchema = (baseUrl, reviews) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "CredSure Digital Credential Platform",
  "description": "Blockchain-secured digital credential platform for issuing, managing, and verifying certificates and badges",
  "brand": {
    "@type": "Organization",
    "name": "CredSure"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": baseUrl
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": reviews.averageRating || "4.8",
    "reviewCount": reviews.reviewCount || "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": reviews.reviews?.map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.authorName
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.text
  }))
});

/**
 * Person Schema for Team/About Pages
 * Enhances E-E-A-T signals
 */
export const createPersonSchema = (person, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": person.name,
  "jobTitle": person.jobTitle,
  "description": person.bio,
  "image": person.image ? `${baseUrl}${person.image}` : undefined,
  "worksFor": {
    "@type": "Organization",
    "name": "CredSure",
    "url": baseUrl
  },
  "sameAs": person.socialLinks || [],
  "hasCredential": person.credentials?.map(cred => ({
    "@type": "EducationalOccupationalCredential",
    "name": cred.name,
    "credentialCategory": cred.category
  }))
});

/**
 * Article Schema for Blog Posts
 * IMPROVED: Better E-E-A-T signals
 */
export const createArticleSchema = (article, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": article.image ? `${baseUrl}${article.image}` : `${baseUrl}/og-image.jpg`,
  "datePublished": article.datePublished,
  "dateModified": article.dateModified || article.datePublished,
  "author": {
    "@type": article.authorType || "Organization",
    "name": article.author || "CredSure"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CredSure",
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/credsure-logo-main.webp`
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${baseUrl}${article.url}`
  }
});

/**
 * ============================================
 * PHASE 3: ADVANCED SCHEMA (P2)
 * ============================================
 */

/**
 * @graph Multi-Entity Structure (Advanced)
 * Use on homepage for comprehensive entity relationships
 */
export const createHomePageGraphSchema = (baseUrl) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${baseUrl}/#organization`,
      "@type": "Organization",
      "name": "CredSure",
      "url": baseUrl,
      "logo": `${baseUrl}/credsure-logo-main.webp`,
      "description": "Blockchain-secured digital credential platform for issuing, managing, and verifying certificates and badges",
      "foundingDate": "2024",
      "sameAs": [
        "https://www.linkedin.com/company/credsure",
        "https://twitter.com/credsure"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "email": "support@credsure.com",
        "availableLanguage": ["English", "German"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Scheffelstraße 58a",
        "addressLocality": "Köln",
        "postalCode": "50935",
        "addressCountry": "DE"
      }
    },
    {
      "@id": `${baseUrl}/#localbusiness`,
      "@type": "LocalBusiness",
      "name": "Certif-ID International GmbH",
      "alternateName": "CredSure",
      "url": baseUrl,
      "image": `${baseUrl}/credsure-logo-main.webp`,
      "logo": `${baseUrl}/credsure-logo-main.webp`,
      "telephone": "+49 221 998 78760",
      "email": "info@certif-id.com",
      "priceRange": "€€",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Scheffelstraße 58a",
        "addressLocality": "Köln",
        "postalCode": "50935",
        "addressRegion": "NRW",
        "addressCountry": "DE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 50.945,
        "longitude": 6.901
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      "sameAs": [
        "https://www.linkedin.com/company/credsure",
        "https://twitter.com/credsure",
        "https://facebook.com/credsureverified",
        "https://youtube.com/channel/UCRM0p7-tHa2I9MSjeUuJdfQ"
      ]
    },
    {
      "@id": `${baseUrl}/#softwareapp`,
      "@type": "SoftwareApplication",
      "name": "CredSure Platform",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": baseUrl,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Blockchain-secured digital credentials",
        "Custom certificate templates",
        "Automated credential verification",
        "Multi-language support",
        "API integration",
        "Bulk credential issuance",
        "Real-time analytics"
      ],
      "provider": {
        "@id": `${baseUrl}/#organization`
      },
      "screenshot": `${baseUrl}/og-image.jpg`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
      }
    },
    {
      "@id": `${baseUrl}/#website`,
      "@type": "WebSite",
      "url": baseUrl,
      "name": "CredSure",
      "description": "Blockchain-secured digital credential platform",
      "publisher": {
        "@id": `${baseUrl}/#organization`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
});

/**
 * EducationalOccupationalCredential Schema
 * Use on credential showcase/template pages
 */
export const createCredentialSchema = (credential, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalCredential",
  "name": credential.name,
  "description": credential.description,
  "credentialCategory": credential.category || "Certificate",
  "recognizedBy": {
    "@type": "Organization",
    "name": "CredSure",
    "url": baseUrl
  },
  "competencyRequired": credential.competencies || [],
  "issuedBy": {
    "@type": "Organization",
    "name": credential.issuer || "CredSure",
    "url": baseUrl
  }
});

/**
 * Speakable Schema for AI Voice Assistants
 * Use on key content pages
 */
export const createSpeakableSchema = (content, cssSelectors) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": content.title,
  "description": content.description,
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": cssSelectors || [".hero-title", ".intro-text", "h1", "h2"]
  }
});

/**
 * Product Schema for Pricing Page
 * Use on /pricing page
 */
export const createPricingProductSchema = (plan, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `CredSure ${plan.name} Plan`,
  "description": plan.description,
  "brand": {
    "@type": "Organization",
    "name": "CredSure"
  },
  "offers": {
    "@type": "Offer",
    "price": plan.price || "0",
    "priceCurrency": "USD",
    "priceValidUntil": plan.priceValidUntil,
    "availability": "https://schema.org/InStock",
    "url": `${baseUrl}/pricing`,
    "priceSpecification": {
      "@type": "PriceSpecification",
      "price": plan.price || "0",
      "priceCurrency": "USD",
      "billingIncrement": plan.billingPeriod || "Monthly"
    }
  },
  "category": "Digital Credential Management Software"
});

/**
 * HowTo Schema for Tutorial/Guide Pages
 * Use on tutorial and help center pages
 */
export const createHowToSchema = (howto, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": howto.name,
  "description": howto.description,
  "image": howto.image ? `${baseUrl}${howto.image}` : undefined,
  "totalTime": howto.totalTime,
  "step": howto.steps?.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    "image": step.image ? `${baseUrl}${step.image}` : undefined
  }))
});

/**
 * LocalBusiness Schema (Optional)
 * Use if CredSure has physical locations
 */
export const createLocalBusinessSchema = (location, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "CredSure",
  "image": `${baseUrl}/credsure-logo-main.webp`,
  "url": baseUrl,
  "telephone": location.telephone,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": location.streetAddress,
    "addressLocality": location.city,
    "addressRegion": location.region,
    "postalCode": location.postalCode,
    "addressCountry": location.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": location.latitude,
    "longitude": location.longitude
  },
  "openingHoursSpecification": location.hours?.map(h => ({
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": h.days,
    "opens": h.opens,
    "closes": h.closes
  }))
});

/**
 * DefinedTerm Schema for Glossary/Terminology Pages
 * Improves citation rates for definition queries when combined with entity schema
 */
export const createDefinedTermSchema = (term, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": term.name,
  "description": term.description,
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": term.termSet || "Digital Credentialing Glossary",
    "url": `${baseUrl}/resources`
  }
});

/**
 * DefinedTermSet Schema for a collection of terms
 */
export const createGlossarySchema = (terms, baseUrl) => ({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "Digital Credentialing Glossary",
  "url": `${baseUrl}/resources`,
  "description": "Comprehensive glossary of digital credentialing, blockchain verification, and certificate management terms",
  "hasDefinedTerm": terms.map(term => ({
    "@type": "DefinedTerm",
    "name": term.name,
    "description": term.description
  }))
});

/**
 * VideoObject Schema
 * Use on pages with embedded video content.
 *
 * Google Search Console flags two non-critical issues we hit historically:
 *   1. "Datetime property 'uploadDate' is missing a time zone" — Google
 *      requires ISO 8601 with offset (e.g. "2025-11-18T10:00:00+00:00"),
 *      not bare YYYY-MM-DD. We normalize here so callers can pass either.
 *   2. "Invalid datetime value" — same root cause, plus future dates on
 *      already-recorded videos. Callers must not pass future dates for
 *      recorded content; we don't silently rewrite those (search console
 *      should keep flagging genuine bad data).
 *
 * Required fields per Google's Video rich-result spec: name, description,
 * thumbnailUrl, uploadDate. Strongly recommended: contentUrl OR embedUrl.
 * Caller is responsible for providing at least one of those.
 */
const toISO8601WithTimezone = (value) => {
  if (!value) return undefined;
  // Already a full ISO timestamp with timezone? Keep as-is.
  if (typeof value === 'string' && /T.*([Zz]|[+-]\d{2}:?\d{2})$/.test(value)) {
    return value;
  }
  // Plain YYYY-MM-DD → assume UTC noon (avoids DST + locale edge cases).
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T12:00:00+00:00`;
  }
  // Anything else: try Date parsing. If it's invalid, return undefined so the
  // schema simply omits the field rather than emitting bad JSON-LD.
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

export const createVideoObjectSchema = (video, baseUrl) => {
  const thumbnail = video.thumbnailUrl || video.image;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.name,
    "description": video.description,
    // Google requires absolute URL. Accept absolute URLs as-is, otherwise
    // prefix with baseUrl.
    "thumbnailUrl": thumbnail
      ? (/^https?:\/\//i.test(thumbnail) ? thumbnail : `${baseUrl}${thumbnail}`)
      : undefined,
    "uploadDate": toISO8601WithTimezone(video.uploadDate),
    "duration": video.duration,
    "contentUrl": video.contentUrl,
    "embedUrl": video.embedUrl,
    "publisher": {
      "@type": "Organization",
      "name": "CredSure",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/credsure-logo-main.webp`
      }
    }
  };
};

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Get base URL from environment.
 * Falls back to canonical production domain if env var unset, so canonicals
 * never accidentally point at the preview/dev URL on prod builds.
 */
export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://credsure.io';
};

/**
 * Combine multiple schemas into an array
 * Use when you need to add multiple schemas to one page
 */
export const combineSchemas = (...schemas) => {
  return schemas.filter(Boolean);
};
