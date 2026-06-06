/**
 * Rich content data for feature sub-pages.
 * Each feature gets: detailed description paragraphs, use cases, benefit metrics, and FAQ.
 */
export const featureContent = {
  recipientWall: {
    description: 'The Recipient Wall is the public, recipient-owned home for every credential a person has earned across CredSure issuers. Holders share one verifiable URL — recruiters, employers, and admissions officers see a living portfolio of badges, transcripts, and skills that update in real time as new credentials are added.',
    useCases: [
      { title: 'Job-seeker showcase', desc: 'A learner shares one URL with every recruiter — verified diplomas, course completions, and skills passports all in one place.' },
      { title: 'Alumni network amplifier', desc: 'Universities embed alumni walls on department pages, turning every graduate\'s achievements into living evidence of programme outcomes.' },
      { title: 'Internal mobility', desc: 'HR teams pull recipient wall data into Workday or SAP SuccessFactors to surface internal candidates whose credentials match an open role.' },
    ],
    metrics: [
      { value: '12×', label: 'Recruiter clicks vs LinkedIn' },
      { value: '4.2', label: 'Avg credentials per wall' },
      { value: '94%', label: 'Recipients keep wall public' },
    ],
    faq: [
      { q: 'Who controls what is shown on a wall?', a: 'The recipient. Every credential can be set public, link-only, or private. Recipients can revoke a credential from the wall at any time without affecting the on-chain record.' },
      { q: 'Can the wall pull credentials from other CredSure issuers?', a: 'Yes — that is the whole point. If you earn a badge from one CredSure issuer in 2023 and a CredSure-powered course completion from another in 2026, both appear on the same wall automatically.' },
      { q: 'Does the wall work for unverified credentials?', a: 'No. Every credential on a Recipient Wall is verifiable on-chain. Walls cannot host self-claimed achievements.' },
    ],
  },
  credentialManagement: {
    description: 'CredSure\'s Digital Certificates hub gives administrators a single pane of glass to issue, track, revoke, and renew digital certificates and badges. Built for teams of any size, the centralized dashboard eliminates spreadsheets and manual processes while giving you real-time visibility into your entire certification program.',
    useCases: [
      { title: 'University Registrar', desc: 'Issue 10,000+ digital diplomas in a single batch, automatically sending each graduate a personalized credential email.' },
      { title: 'HR Compliance Manager', desc: 'Track which employees have valid certifications and receive automated alerts 90 days before any credential expires.' },
      { title: 'Certification Board Admin', desc: 'Manage the full credential lifecycle — from application to issuance to renewal — with complete audit trails.' },
    ],
    metrics: [
      { value: '90%', label: 'Less admin time' },
      { value: '10K+', label: 'Credentials per batch' },
      { value: '100%', label: 'Audit trail coverage' },
    ],
    faq: [
      { q: 'How many credentials can I manage?', a: 'There is no limit. Our platform handles everything from 10 credentials to millions, scaling automatically with your needs.' },
      { q: 'Can I revoke a credential after issuance?', a: 'Yes. Administrators can revoke any credential instantly. The revocation is reflected in real-time on the verification page and blockchain record.' },
    ],
  },
  blockchain: {
    description: 'Every credential issued through CredSure is anchored to the blockchain, creating an immutable, tamper-proof record that can never be altered or forged. Our verification system allows anyone — employers, institutions, or regulators — to confirm a credential\'s authenticity in under 3 seconds, without needing an account.',
    useCases: [
      { title: 'Employer Verification', desc: 'A hiring manager scans a candidate\'s QR code and instantly sees the full credential details, issuer info, and blockchain proof.' },
      { title: 'Cross-Border Recognition', desc: 'International institutions verify credentials without language barriers — blockchain proof is universal and language-agnostic.' },
      { title: 'Audit & Compliance', desc: 'Regulators access an immutable audit trail showing exactly when each credential was issued, by whom, and to whom.' },
    ],
    metrics: [
      { value: '<3s', label: 'Verification time' },
      { value: '0%', label: 'Fraud rate' },
      { value: '100%', label: 'Tamper-proof' },
    ],
    faq: [
      { q: 'Which blockchain does CredSure use?', a: 'CredSure uses a hybrid approach, anchoring credential hashes to public blockchains for immutability while keeping personal data encrypted and off-chain for privacy compliance.' },
      { q: 'Do verifiers need a blockchain wallet?', a: 'No. Anyone can verify a credential by scanning the QR code or clicking the verification link — no technical knowledge or wallet required.' },
    ],
  },
  sharing: {
    description: 'CredSure makes credential sharing effortless. Recipients can share their digital certificates and badges to LinkedIn, Twitter, Facebook, and email with a single click. Each shared credential generates a branded social card optimized for engagement, driving organic visibility for your organization.',
    useCases: [
      { title: 'Graduate Celebration', desc: 'New graduates share their verified degree to LinkedIn, creating a viral moment that showcases your institution to their entire network.' },
      { title: 'Employee Skills Showcase', desc: 'Employees add training completions to their LinkedIn profiles, creating a living portfolio of verified competencies.' },
      { title: 'Marketing Amplification', desc: 'Every shared credential becomes a branded marketing asset, generating thousands of impressions for your organization.' },
    ],
    metrics: [
      { value: '5x', label: 'Brand impressions per share' },
      { value: '72%', label: 'LinkedIn sharing rate' },
      { value: '1M+', label: 'Social reach generated' },
    ],
    faq: [
      { q: 'Can recipients share to platforms other than LinkedIn?', a: 'Yes. CredSure supports sharing to LinkedIn, Twitter, Facebook, email, and direct link. Recipients can also embed credentials on websites.' },
      { q: 'Do shared credentials link back to verification?', a: 'Yes. Every shared credential includes a verification link that anyone can click to confirm authenticity in real-time.' },
    ],
  },
  analytics: {
    description: 'CredSure\'s analytics dashboard provides real-time insights into your credentialing program\'s performance. Track issuance volumes, verification rates, social sharing metrics, and recipient engagement — all from a single, customizable dashboard with exportable reports.',
    useCases: [
      { title: 'Program ROI Reporting', desc: 'Generate executive-ready reports showing credential program ROI, including cost savings, engagement metrics, and marketing reach.' },
      { title: 'Engagement Optimization', desc: 'Identify which credentials drive the most social sharing and adjust your program to maximize organic reach.' },
      { title: 'Compliance Monitoring', desc: 'Track credential expiry rates across your organization and ensure 100% compliance with automated dashboards.' },
    ],
    metrics: [
      { value: 'Real-time', label: 'Data updates' },
      { value: '20+', label: 'Report templates' },
      { value: 'CSV/PDF', label: 'Export formats' },
    ],
    faq: [
      { q: 'Can I create custom reports?', a: 'Yes. The Professional and Enterprise plans include a custom report builder with filters for date range, credential type, issuer, and more.' },
      { q: 'Is there an analytics API?', a: 'Yes. All analytics data is available via our REST API, enabling integration with your existing BI tools like Tableau or Power BI.' },
    ],
  },
  bulkIssuance: {
    description: 'Issue thousands of credentials in minutes, not days. CredSure\'s bulk issuance engine processes CSV uploads with built-in validation, error handling, and progress tracking. Automate high-volume credentialing events like graduations, certification cycles, and training completions.',
    useCases: [
      { title: 'Graduation Season', desc: 'Upload a CSV of 15,000 graduates and issue personalized, blockchain-verified digital diplomas in under 10 minutes.' },
      { title: 'Annual Recertification', desc: 'Process thousands of annual recertifications with a single upload, automatically triggering renewal emails to recipients.' },
      { title: 'Event Attendance', desc: 'Issue attendance credentials to all conference participants within hours of event completion.' },
    ],
    metrics: [
      { value: '10K+', label: 'Per batch capacity' },
      { value: '<10min', label: 'Processing time' },
      { value: '99.9%', label: 'Success rate' },
    ],
    faq: [
      { q: 'What file formats are supported?', a: 'CSV and Excel (.xlsx) files are supported. Our system includes automatic validation to catch formatting errors before processing.' },
      { q: 'What happens if some records fail?', a: 'Failed records are flagged with specific error messages. You can fix and re-upload only the failed records — successfully processed credentials are not affected.' },
    ],
  },
  apiIntegration: {
    description: 'CredSure\'s RESTful API enables seamless integration with your existing technology stack. Connect your LMS, HRIS, CRM, or custom applications to automate credential issuance, verification, and management. Comprehensive documentation, SDKs, and webhook support make integration straightforward.',
    useCases: [
      { title: 'LMS Auto-Issuance', desc: 'Connect Moodle, Canvas, or Blackboard to automatically issue credentials when learners complete courses.' },
      { title: 'HRIS Integration', desc: 'Sync employee certifications with your HR system to maintain real-time compliance records.' },
      { title: 'Custom Application', desc: 'Build credential issuance directly into your SaaS product using our API and webhooks.' },
    ],
    metrics: [
      { value: '50+', label: 'API endpoints' },
      { value: '99.9%', label: 'API uptime' },
      { value: '<200ms', label: 'Average response' },
    ],
    faq: [
      { q: 'Which LMS platforms are supported?', a: 'CredSure integrates with Moodle, Canvas, Blackboard, TalentLMS, and any system supporting LTI or REST API webhooks. Zapier integration covers 3,000+ additional apps.' },
      { q: 'Is there rate limiting?', a: 'Standard plans include generous rate limits (1,000 requests/minute). Enterprise plans offer custom limits based on your volume requirements.' },
    ],
  },
  autoIssue: {
    description: 'Set up trigger-based rules to automatically issue credentials without manual intervention. When learners complete a course, pass an assessment, or meet custom criteria, CredSure automatically generates and delivers their credential — saving hours of administrative work.',
    useCases: [
      { title: 'Course Completion', desc: 'Automatically issue a certificate the moment a learner marks a course as complete in your LMS.' },
      { title: 'Assessment Threshold', desc: 'Issue credentials only when learners achieve a minimum score (e.g., 80%) on their final assessment.' },
      { title: 'Multi-Step Programs', desc: 'Create credential pathways where completing multiple courses automatically triggers a master certification.' },
    ],
    metrics: [
      { value: '0', label: 'Manual steps needed' },
      { value: '24/7', label: 'Issuance availability' },
      { value: '100%', label: 'Consistent accuracy' },
    ],
    faq: [
      { q: 'Can I set up conditional logic?', a: 'Yes. Auto-issue rules support AND/OR conditions, score thresholds, date ranges, and custom metadata checks.' },
      { q: 'Can I preview before auto-issuing?', a: 'Yes. You can enable a review queue where auto-triggered credentials are held for manual approval before delivery.' },
    ],
  },
  templateDesigner: {
    description: 'Design stunning, on-brand credential templates with CredSure\'s intuitive template builder. Choose from professionally designed starting templates or build from scratch. Add your logo, brand colors, dynamic fields, QR codes, and security elements — all without any design skills.',
    useCases: [
      { title: 'University Branding', desc: 'Create diploma templates that match your institution\'s visual identity with official seals, signatures, and crest placement.' },
      { title: 'Multi-Department Variants', desc: 'Design a base template and create department-specific variants that inherit updates from the master template.' },
      { title: 'Badge Design', desc: 'Create visually compelling digital badges with skill tags, issuer information, and achievement metadata.' },
    ],
    metrics: [
      { value: '50+', label: 'Starter templates' },
      { value: 'Unlimited', label: 'Custom designs' },
      { value: 'Intuitive', label: 'No code needed' },
    ],
    faq: [
      { q: 'Can I use my own fonts?', a: 'Yes. Upload custom fonts to ensure credentials match your brand guidelines exactly.' },
      { q: 'Do templates support dynamic fields?', a: 'Yes. Insert dynamic fields for recipient name, date, course name, score, and any custom metadata. Fields are automatically populated during issuance.' },
    ],
  },
  whiteLabel: {
    description: 'Deliver a completely branded credential experience to your recipients. With CredSure\'s white-label solution, every touchpoint — from the issuance email to the verification page — carries your brand identity. Recipients never see the CredSure name; it\'s your platform, your way.',
    useCases: [
      { title: 'Enterprise Training Provider', desc: 'Offer branded digital credentials as a value-add to your training programs, strengthening your market position.' },
      { title: 'University Consortium', desc: 'Multiple institutions share a single white-labeled platform while maintaining individual branding per school.' },
      { title: 'Certification Authority', desc: 'Issue credentials that carry your authority\'s branding exclusively, reinforcing trust and recognition.' },
    ],
    metrics: [
      { value: '100%', label: 'Your branding' },
      { value: '0%', label: 'CredSure visibility' },
      { value: 'Full', label: 'Customization control' },
    ],
    faq: [
      { q: 'Can I customize the verification page?', a: 'Yes. White-label includes full control over verification page layout, colors, logo, and messaging.' },
      { q: 'Are emails sent from my domain?', a: 'Yes. Configure custom SMTP settings so all credential emails come from your organization\'s email domain.' },
    ],
  },
  customDomains: {
    description: 'Host your credential verification pages on your own domain (e.g., credentials.yourdomain.com) for complete brand consistency and SEO benefits. CredSure handles SSL certificate management and DNS configuration — you just point your subdomain.',
    useCases: [
      { title: 'Brand Consistency', desc: 'Recipients see your domain when verifying credentials, reinforcing trust in your organization rather than a third-party platform.' },
      { title: 'SEO Authority', desc: 'Verification pages on your domain build backlinks and authority for your website, improving overall SEO performance.' },
      { title: 'Compliance Requirements', desc: 'Some regulated industries require that all official communications originate from the organization\'s own domain.' },
    ],
    metrics: [
      { value: 'Your Domain', label: 'Brand control' },
      { value: 'Auto', label: 'SSL management' },
      { value: 'SEO', label: 'Backlink benefits' },
    ],
    faq: [
      { q: 'How long does domain setup take?', a: 'Typically 15-30 minutes. You create a CNAME record pointing to CredSure, and our system automatically provisions the SSL certificate.' },
      { q: 'Can I use multiple custom domains?', a: 'Yes. Enterprise plans support multiple custom domains, useful for multi-brand organizations or university systems.' },
    ],
  },
  instantVerification: {
    description: 'CredSure\'s instant verification system allows anyone to confirm a credential\'s authenticity in under 3 seconds. No account, no login, no technical knowledge required. Simply scan the QR code or click the verification link to see the full credential details, issuer information, and blockchain proof.',
    useCases: [
      { title: 'Job Interview', desc: 'A hiring manager scans a candidate\'s credential QR code during an interview and sees verified details instantly on their phone.' },
      { title: 'Regulatory Audit', desc: 'An auditor clicks verification links to confirm all staff credentials in a fraction of the time vs calling each issuing institution.' },
      { title: 'Hospital Credentialing', desc: 'A hospital verifies a new doctor\'s qualifications before their first shift — in seconds, not weeks.' },
    ],
    metrics: [
      { value: '<3s', label: 'Verification time' },
      { value: '0', label: 'Account required' },
      { value: '24/7', label: 'Always available' },
    ],
    faq: [
      { q: 'Does the verifier need a CredSure account?', a: 'No. Verification is completely public and free. Anyone with the QR code or verification link can confirm a credential\'s authenticity.' },
      { q: 'What information does the verifier see?', a: 'The verifier sees the credential title, issuer name, recipient name, issue date, expiry date (if applicable), credential status, and blockchain verification proof.' },
    ],
  },
  security: {
    description: 'CredSure is built with enterprise-grade security at every layer. We are GDPR compliant and ISO 27001 certified. All data is encrypted in transit and at rest with AES-256 encryption, and credentials are anchored to the blockchain for tamper-proof integrity.',
    useCases: [
      { title: 'GDPR Compliance', desc: 'EU organizations trust CredSure for full GDPR compliance including data minimization, right to erasure, and Data Processing Agreements.' },
      { title: 'Enterprise Procurement', desc: 'Pass your organization\'s security review with our comprehensive ISO 27001 report, penetration test results, and security questionnaire assistance.' },
      { title: 'Regulated Industries', desc: 'Healthcare, finance, and government organizations rely on CredSure\'s security posture for sensitive credential data.' },
    ],
    metrics: [
      { value: 'ISO 27001', label: 'Certified' },
      { value: 'AES-256', label: 'Encryption standard' },
      { value: '99.9%', label: 'Uptime SLA' },
    ],
    faq: [
      { q: 'Where is data stored?', a: 'Data is stored in ISO 27001-certified data centers in the EU and US. Enterprise customers can choose their preferred data residency region.' },
      { q: 'Do you support Single Sign-On (SSO)?', a: 'Yes. Enterprise plans include SAML 2.0 SSO integration with providers like Okta, Azure AD, and Google Workspace.' },
    ],
  },
};

/**
 * Platform page stats
 */
export const platformStats = [
  { value: '2M+', label: 'Credentials Issued' },
  { value: '150+', label: 'Organizations Trust CredSure' },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: '<3s', label: 'Average Verification Time' },
];

/**
 * Platform integration logos
 */
export const platformIntegrations = [
  'Moodle', 'Canvas', 'Blackboard', 'TalentLMS', 'Zapier',
  'Slack', 'Microsoft Teams', 'Google Workspace', 'Salesforce', 'HubSpot',
];

/**
 * Platform "How It Works" steps
 */
export const platformHowItWorks = [
  { step: '1', title: 'Design', desc: 'Create branded credential templates using our intuitive template designer or choose from 50+ professional templates.' },
  { step: '2', title: 'Issue', desc: 'Issue credentials individually, in bulk via CSV, or automatically through LMS/API integration.' },
  { step: '3', title: 'Share', desc: 'Recipients share verified credentials on LinkedIn, social media, and digital wallets with one click.' },
  { step: '4', title: 'Verify', desc: 'Anyone can instantly verify credential authenticity via QR code or verification link — no account needed.' },
];
