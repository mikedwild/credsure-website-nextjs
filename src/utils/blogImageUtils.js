const topicImages = {
  blockchain: 'https://images.unsplash.com/photo-1635840418908-772c54d7931f?w=800&h=450&fit=crop',
  certificate: 'https://images.pexels.com/photos/8112200/pexels-photo-8112200.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  credential: 'https://images.unsplash.com/photo-1641580550451-3a452effc5b7?w=800&h=450&fit=crop',
  elearning: 'https://images.pexels.com/photos/6326370/pexels-photo-6326370.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  badge: 'https://images.pexels.com/photos/7267601/pexels-photo-7267601.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  training: 'https://images.pexels.com/photos/7647951/pexels-photo-7647951.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  healthcare: 'https://images.unsplash.com/photo-1622876969099-7b2cd8717b66?w=800&h=450&fit=crop',
  graduation: 'https://images.unsplash.com/photo-1763673404757-e6dfe627941b?w=800&h=450&fit=crop',
  linkedin: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
  security: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=450&fit=crop',
  event: 'https://images.unsplash.com/photo-1769798643237-8642a3fbe5bc?w=800&h=450&fit=crop',
  team: 'https://images.pexels.com/photos/8761647/pexels-photo-8761647.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
  verification: 'https://images.unsplash.com/photo-1603899122361-e99b4f6fecf5?w=800&h=450&fit=crop',
  default: 'https://images.unsplash.com/photo-1751448555253-f39c06e29d82?w=800&h=450&fit=crop',
};

const topicRules = [
  [['blockchain', 'tamper-proof', 'immutable', 'decentrali'], 'blockchain'],
  [['linkedin', 'social-sharing', 'social-media', 'sharing-credential'], 'linkedin'],
  [['healthcare', 'medical', 'nursing', 'hospital', 'clinical', 'health-care', 'clini'], 'healthcare'],
  [['graduation', 'diploma', 'university', 'higher-education', 'graduate', 'alumnus'], 'graduation'],
  [['elearning', 'e-learning', 'online-learning', 'lms', 'online-course', 'mooc', 'coursera', 'moodle'], 'elearning'],
  [['digital-badge', 'open-badge', 'badge-maker', 'micro-credential', 'badge'], 'badge'],
  [['employee', 'training-program', 'corporate-training', 'workforce', 'reskill', 'upskill', 'soft-skill'], 'training'],
  [['template', 'certificate-template', 'free-certificate', 'certificate-design', 'appreciation'], 'certificate'],
  [['analytics', 'data-driven', 'roi', 'engagement', 'tracking', 'metric'], 'analytics'],
  [['security', 'gdpr', 'compliance', 'soc-2', 'data-protection', 'fraud', 'counterfeit'], 'security'],
  [['event', 'worldskills', 'conference', 'summit', 'partnership', 'tuv', 'certif-id'], 'event'],
  [['verification', 'verify', 'instant-verification', 'qr-code', 'credential-verification'], 'verification'],
  [['digital-certificate', 'digital-credential', 'credentialing', 'credsure'], 'credential'],
  [['team', 'company', 'career', 'hiring', 'customer-success', 'case-study'], 'team'],
];

export const getPostImage = (post) => {
  const slug = (post.slug || '').toLowerCase();
  const title = (post.title || '').toLowerCase();
  const combined = `${slug} ${title}`;
  for (const [keywords, imageKey] of topicRules) {
    if (keywords.some(kw => combined.includes(kw))) {
      return topicImages[imageKey];
    }
  }
  const catMap = {
    'Education': topicImages.elearning,
    'Insights': topicImages.credential,
    'Industry': topicImages.training,
    'Technology': topicImages.blockchain,
    'Customer Success': topicImages.team,
    'Healthcare': topicImages.healthcare,
    'News': topicImages.event,
    'Events': topicImages.event,
  };
  return catMap[post.category] || topicImages.default;
};

export const formatDate = (dateStr, lang = 'en') => {
  const d = new Date(dateStr);
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};
