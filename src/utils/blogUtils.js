/**
 * Blog utility constants and topic matching logic.
 * Blog post DATA is fetched from /api/blogs (not bundled).
 */

export const blogCategories = [
  "Customer Success", "Education", "Events", "Healthcare",
  "Industry", "Insights", "News", "Technology"
];

export const blogTopics = [
  "Blockchain", "Digital Badges", "Digital Certificates",
  "Digital Credentials", "Employee Training", "Engagement",
  "Higher Education", "Integrations", "Micro-Credentials",
  "Program Growth", "Security & Compliance", "Skill Development", "Verification",
];

const topicAssignmentRules = [
  [['blockchain', 'tamper-proof', 'immutable', 'decentrali'], 'Blockchain'],
  [['digital-badge', 'open-badge', 'badge-maker', 'micro-credential', 'badge'], 'Digital Badges'],
  [['digital-certificate', 'certificate-template', 'free-certificate', 'certificate-design', 'appreciation'], 'Digital Certificates'],
  [['digital-credential', 'credentialing', 'credential'], 'Digital Credentials'],
  [['employee', 'corporate-training', 'workforce', 'reskill', 'upskill', 'soft-skill', 'training-program'], 'Employee Training'],
  [['engagement', 'learner-engagement', 'completion-rate', 'gamifi'], 'Engagement'],
  [['university', 'higher-education', 'graduate', 'academic', 'campus'], 'Higher Education'],
  [['integration', 'api', 'lms', 'moodle', 'zapier', 'webhook'], 'Integrations'],
  [['micro-credential', 'stackable', 'pathway', 'learning-pathway'], 'Micro-Credentials'],
  [['program-growth', 'scale', 'growth', 'roi', 'conversion', 'revenue'], 'Program Growth'],
  [['security', 'gdpr', 'compliance', 'soc-2', 'data-protection', 'fraud', 'privacy'], 'Security & Compliance'],
  [['skill', 'competency', 'career', 'professional-development'], 'Skill Development'],
  [['verification', 'verify', 'instant-verification', 'qr-code', 'authenticity'], 'Verification'],
];

export const getPostTopics = (post) => {
  const combined = `${(post.slug || '').toLowerCase()} ${(post.title || '').toLowerCase()}`;
  const topics = [];
  for (const [keywords, topic] of topicAssignmentRules) {
    if (keywords.some(kw => combined.includes(kw))) {
      topics.push(topic);
    }
  }
  return topics.length > 0 ? topics : ['Digital Credentials'];
};
