/**
 * Central route configuration mapping EN and DE slugs to components.
 * Each route defines both language variants for i18n URL support.
 */
import { lazy } from 'react';

// Lazy-loaded pages
const Platform = lazy(() => import('../views/Platform').then(m => ({ default: m.Platform })));
const Pricing = lazy(() => import('../views/Pricing').then(m => ({ default: m.Pricing })));
const ROICalculatorPage = lazy(() => import('../views/ROICalculatorPage').then(m => ({ default: m.ROICalculatorPage })));
const Demo = lazy(() => import('../views/Demo').then(m => ({ default: m.Demo })));
const SignIn = lazy(() => import('../views/SignIn').then(m => ({ default: m.SignIn })));
const About = lazy(() => import('../views/AboutUs').then(m => ({ default: m.AboutUs })));
const AboutUs = lazy(() => import('../views/AboutUs').then(m => ({ default: m.AboutUs })));
const Features = lazy(() => import('../views/Features').then(m => ({ default: m.Features })));
const Solutions = lazy(() => import('../views/Solutions').then(m => ({ default: m.Solutions })));
const CustomerSuccess = lazy(() => import('../views/CustomerSuccess').then(m => ({ default: m.CustomerSuccess })));
const Resources = lazy(() => import('../views/Resources').then(m => ({ default: m.Resources })));
const Blog = lazy(() => import('../views/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('../views/BlogPost').then(m => ({ default: m.BlogPost })));
const Guides = lazy(() => import('../views/Guides').then(m => ({ default: m.Guides })));
const Webinars = lazy(() => import('../views/Webinars').then(m => ({ default: m.Webinars })));
const Integrations = lazy(() => import('../views/Integrations').then(m => ({ default: m.Integrations })));
const HelpCenter = lazy(() => import('../views/HelpCenter').then(m => ({ default: m.HelpCenter })));
const ApiDocs = lazy(() => import('../views/ApiDocs').then(m => ({ default: m.ApiDocs })));
const Templates = lazy(() => import('../views/Templates').then(m => ({ default: m.Templates })));
const Tutorials = lazy(() => import('../views/Tutorials').then(m => ({ default: m.Tutorials })));
const CompareAccredible = lazy(() => import('../views/compare/CompareAccredible').then(m => ({ default: m.CompareAccredible })));
const CompareCredly = lazy(() => import('../views/compare/CompareCredly').then(m => ({ default: m.CompareCredly })));
const DigitalBadges = lazy(() => import('../views/DigitalBadges').then(m => ({ default: m.DigitalBadges })));
const Security = lazy(() => import('../views/Security').then(m => ({ default: m.Security })));
const Privacy = lazy(() => import('../views/Privacy').then(m => ({ default: m.Privacy })));
const PrivacyPolicy = lazy(() => import('../views/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const PoliciesTerms = lazy(() => import('../views/PoliciesTerms').then(m => ({ default: m.PoliciesTerms })));
const GDPR = lazy(() => import('../views/GDPR').then(m => ({ default: m.GDPR })));
const Impressum = lazy(() => import('../views/Impressum').then(m => ({ default: m.Impressum })));
const Analytics = lazy(() => import('../views/Analytics').then(m => ({ default: m.Analytics })));
const NotFound = lazy(() => import('../views/NotFound'));

// Solution pages
const Healthcare = lazy(() => import('../views/solutions/Healthcare').then(m => ({ default: m.Healthcare })));
const Manufacturing = lazy(() => import('../views/solutions/Manufacturing').then(m => ({ default: m.Manufacturing })));
const HigherEducation = lazy(() => import('../views/solutions/HigherEducation').then(m => ({ default: m.HigherEducation })));
const CorporateTraining = lazy(() => import('../views/solutions/CorporateTraining').then(m => ({ default: m.CorporateTraining })));
const Associations = lazy(() => import('../views/solutions/Associations').then(m => ({ default: m.Associations })));
const CertificationBodies = lazy(() => import('../views/solutions/CertificationBodies').then(m => ({ default: m.CertificationBodies })));

// Feature pages
const PlatformFeatures = lazy(() => import('../views/features/PlatformFeatures').then(m => ({ default: m.PlatformFeatures })));
const BlockchainVerification = lazy(() => import('../views/features/BlockchainVerification').then(m => ({ default: m.BlockchainVerification })));
const CredentialSharing = lazy(() => import('../views/features/CredentialSharing').then(m => ({ default: m.CredentialSharing })));
const AnalyticsInsights = lazy(() => import('../views/features/AnalyticsInsights').then(m => ({ default: m.AnalyticsInsights })));
const SecurityCompliance = lazy(() => import('../views/features/SecurityCompliance').then(m => ({ default: m.SecurityCompliance })));
const InstantVerification = lazy(() => import('../views/features/InstantVerification').then(m => ({ default: m.InstantVerification })));
const CredentialManagement = lazy(() => import('../views/features/CredentialManagement').then(m => ({ default: m.CredentialManagement })));
const DigitalCertificates = lazy(() => import('../views/features/DigitalCertificates').then(m => ({ default: m.DigitalCertificates })));
const BulkIssuance = lazy(() => import('../views/features/BulkIssuance').then(m => ({ default: m.BulkIssuance })));
const ApiIntegration = lazy(() => import('../views/features/ApiIntegration').then(m => ({ default: m.ApiIntegration })));
const AutoIssue = lazy(() => import('../views/features/AutoIssue').then(m => ({ default: m.AutoIssue })));
const TemplateDesigner = lazy(() => import('../views/features/TemplateDesigner').then(m => ({ default: m.TemplateDesigner })));
const WhiteLabel = lazy(() => import('../views/features/WhiteLabel').then(m => ({ default: m.WhiteLabel })));
const CustomDomains = lazy(() => import('../views/features/CustomDomains').then(m => ({ default: m.CustomDomains })));
const RecipientWall = lazy(() => import('../views/features/RecipientWall').then(m => ({ default: m.RecipientWall })));

// Use case pages
const CourseCompletion = lazy(() => import('../views/use-cases/CourseCompletion').then(m => ({ default: m.CourseCompletion })));
const ProfessionalLicenses = lazy(() => import('../views/use-cases/ProfessionalLicenses').then(m => ({ default: m.ProfessionalLicenses })));
const MemberCredentials = lazy(() => import('../views/use-cases/MemberCredentials').then(m => ({ default: m.MemberCredentials })));
const ScaleProgram = lazy(() => import('../views/use-cases/ScaleProgram').then(m => ({ default: m.ScaleProgram })));
const IncreaseEngagement = lazy(() => import('../views/use-cases/IncreaseEngagement').then(m => ({ default: m.IncreaseEngagement })));
const SaveTime = lazy(() => import('../views/use-cases/SaveTime').then(m => ({ default: m.SaveTime })));

// Customer success pages
const ByteEdge = lazy(() => import('../views/customer-success/ByteEdge').then(m => ({ default: m.ByteEdge })));
const Tsaaro = lazy(() => import('../views/customer-success/Tsaaro').then(m => ({ default: m.Tsaaro })));
const CliniIndia = lazy(() => import('../views/customer-success/CliniIndia').then(m => ({ default: m.CliniIndia })));

/**
 * Route configuration: { en: enSlug, de: deSlug, component: LazyComponent }
 * Both slug variants point to the same component.
 */
export const routeConfig = [
  // Core
  { en: 'demo', de: 'demo', component: Demo },
  { en: 'contact', de: 'kontakt', component: Demo },
  { en: 'platform', de: 'plattform', component: Platform },
  { en: 'pricing', de: 'preise', component: Pricing },
  { en: 'roi-calculator', de: 'roi-rechner', component: ROICalculatorPage },
  { en: 'signin', de: 'anmelden', component: SignIn },
  { en: 'about', de: 'ueber-uns', component: About },
  { en: 'about-us', de: 'unser-team', component: AboutUs },
  { en: 'features', de: 'funktionen', component: Features },

  // Solutions
  { en: 'solutions', de: 'loesungen', component: Solutions },
  { en: 'solutions/higher-education', de: 'loesungen/hochschulbildung', component: HigherEducation },
  { en: 'solutions/corporate-training', de: 'loesungen/unternehmensschulungen', component: CorporateTraining },
  { en: 'solutions/associations', de: 'loesungen/verbaende', component: Associations },
  { en: 'solutions/certification-bodies', de: 'loesungen/zertifizierungsstellen', component: CertificationBodies },
  { en: 'solutions/healthcare', de: 'loesungen/gesundheitswesen', component: Healthcare },
  { en: 'solutions/manufacturing', de: 'loesungen/fertigung', component: Manufacturing },

  // Features
  { en: 'features/platform', de: 'funktionen/plattform', component: PlatformFeatures },
  { en: 'features/blockchain', de: 'funktionen/blockchain', component: BlockchainVerification },
  { en: 'features/sharing', de: 'funktionen/teilen', component: CredentialSharing },
  { en: 'features/analytics', de: 'funktionen/analysen', component: AnalyticsInsights },
  { en: 'features/security', de: 'funktionen/sicherheit', component: SecurityCompliance },
  { en: 'features/verification', de: 'funktionen/verifizierung', component: InstantVerification },
  { en: 'features/credential-management', de: 'funktionen/zertifikatsverwaltung', component: CredentialManagement },
  { en: 'features/digital-certificates', de: 'funktionen/digitale-zertifikate', component: DigitalCertificates },
  { en: 'features/bulk-issuance', de: 'funktionen/massenausstellung', component: BulkIssuance },
  { en: 'features/api-integration', de: 'funktionen/api-integration', component: ApiIntegration },
  { en: 'features/auto-issue', de: 'funktionen/automatische-ausstellung', component: AutoIssue },
  { en: 'features/template-designer', de: 'funktionen/vorlagen-designer', component: TemplateDesigner },
  { en: 'features/white-label', de: 'funktionen/white-label', component: WhiteLabel },
  { en: 'features/custom-domains', de: 'funktionen/eigene-domains', component: CustomDomains },
  { en: 'features/recipient-wall', de: 'funktionen/empfaenger-wand', component: RecipientWall },

  // Use Cases
  { en: 'use-cases/course-completion', de: 'anwendungsfaelle/kursabschluss', component: CourseCompletion },
  { en: 'use-cases/professional-licenses', de: 'anwendungsfaelle/berufslizenzen', component: ProfessionalLicenses },
  { en: 'use-cases/member-credentials', de: 'anwendungsfaelle/mitglieder-zertifikate', component: MemberCredentials },
  { en: 'use-cases/scale-program', de: 'anwendungsfaelle/programm-skalierung', component: ScaleProgram },
  { en: 'use-cases/increase-engagement', de: 'anwendungsfaelle/engagement-steigern', component: IncreaseEngagement },
  { en: 'use-cases/save-time', de: 'anwendungsfaelle/zeit-sparen', component: SaveTime },

  // Customer Success
  { en: 'customer-success', de: 'erfolgsgeschichten', component: CustomerSuccess },
  { en: 'customer-success/byteedge', de: 'erfolgsgeschichten/byteedge', component: ByteEdge },
  { en: 'customer-success/tsaaro', de: 'erfolgsgeschichten/tsaaro', component: Tsaaro },
  { en: 'customer-success/clini-india', de: 'erfolgsgeschichten/clini-india', component: CliniIndia },

  // Resources
  { en: 'resources', de: 'ressourcen', component: Resources },
  { en: 'blog', de: 'blog', component: Blog },
  { en: 'blog/:slug', de: 'blog/:slug', component: BlogPost },
  { en: 'guides', de: 'leitfaeden', component: Guides },
  { en: 'webinars', de: 'webinare', component: Webinars },
  { en: 'integrations', de: 'integrationen', component: Integrations },
  { en: 'help-center', de: 'hilfecenter', component: HelpCenter },
  { en: 'templates', de: 'vorlagen', component: Templates },
  { en: 'tutorials', de: 'anleitungen', component: Tutorials },
  { en: 'compare/accredible', de: 'vergleich/accredible', component: CompareAccredible },
  { en: 'compare/credly', de: 'vergleich/credly', component: CompareCredly },
  { en: 'digital-badges', de: 'digitale-badges', component: DigitalBadges },

  // Legal
  { en: 'privacy', de: 'datenschutz', component: Privacy },
  { en: 'privacy-policy', de: 'datenschutzrichtlinie', component: PrivacyPolicy },
  // New canonical Terms URL (Master Subscription Agreement, Apr 2026 Rev004)
  { en: 'policies/terms', de: 'policies/terms', component: PoliciesTerms },
  // Legacy URLs — soft-redirect to canonical so existing inbound links still resolve.
  // SEO note: these are client-side <Navigate> redirects. For a true HTTP 301,
  // add a Cloudflare Page Rule: /en/terms → /en/policies/terms (and /de/agb → /de/policies/terms).
  { en: 'terms', de: 'agb', redirectTo: 'policies/terms' },
  { en: 'security', de: 'sicherheit', component: Security },
  { en: 'gdpr', de: 'dsgvo', component: GDPR },
  { en: 'impressum', de: 'impressum', component: Impressum },

  // Admin
  { en: 'analytics', de: 'analysen', component: Analytics },
];

// NotFound component for 404
export { NotFound };

/**
 * Build a lookup map: slug → { en, de, component }
 * Used to translate paths between languages.
 */
const buildSlugLookup = () => {
  const enToRoute = {};
  const deToRoute = {};
  routeConfig.forEach(route => {
    enToRoute[route.en] = route;
    deToRoute[route.de] = route;
  });
  return { enToRoute, deToRoute };
};

export const { enToRoute, deToRoute } = buildSlugLookup();
