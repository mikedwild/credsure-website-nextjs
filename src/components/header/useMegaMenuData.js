import { useTranslation } from '@/lib/useTranslation';
import {
  Award, LayoutDashboard, Shield, Share2, BarChart3, Zap, Plug,
  BookOpen, FileText, Users, HelpCircle, Mail, CheckCircle2,
  Building2, GraduationCap, Briefcase, Trophy, Heart, Factory,
  Sparkles, Star
} from 'lucide-react';

export const useMegaMenuData = () => {
  const t = useTranslation();

  const megaMenus = {
    platform: {
      sections: [
        {
          title: t('megaMenu.platform.coreFeatures'),
          items: [
            { icon: LayoutDashboard, label: t('megaMenu.platform.digitalCertificates', 'Digital Certificates'), description: t('megaMenu.platform.digitalCertificatesDesc', 'Issue and manage certificates'), href: "/features/digital-certificates" },
            { icon: Award, label: t('megaMenu.platform.digitalBadges', 'Digital Badges'), description: t('megaMenu.platform.digitalBadgesDesc', 'Issue verifiable digital badges'), href: "/digital-badges" },
            { icon: Shield, label: t('megaMenu.platform.blockchainVerification'), description: t('megaMenu.platform.blockchainVerificationDesc'), href: "/features/blockchain" },
            { icon: Share2, label: t('megaMenu.platform.socialSharing'), description: t('megaMenu.platform.socialSharingDesc'), href: "/features/sharing" },
            { icon: BarChart3, label: t('megaMenu.platform.analyticsDashboard'), description: t('megaMenu.platform.analyticsDashboardDesc'), href: "/features/analytics" }
          ]
        },
        {
          title: t('megaMenu.platform.automation'),
          items: [
            { icon: Zap, label: t('megaMenu.platform.bulkIssuance'), description: t('megaMenu.platform.bulkIssuanceDesc'), href: "/features/bulk-issuance" },
            { icon: Plug, label: t('megaMenu.platform.integrations', 'Integrations'), description: t('megaMenu.platform.integrationsDesc', 'Connect with your LMS & tools'), href: "/integrations" },
            { icon: CheckCircle2, label: t('megaMenu.platform.autoIssue'), description: t('megaMenu.platform.autoIssueDesc'), href: "/features/auto-issue" }
          ]
        },
        {
          title: t('megaMenu.platform.customization'),
          items: [
            { icon: Award, label: t('megaMenu.platform.templateDesigner'), description: t('megaMenu.platform.templateDesignerDesc'), href: "/features/template-designer" },
            { icon: LayoutDashboard, label: t('megaMenu.platform.whiteLabel'), description: t('megaMenu.platform.whiteLabelDesc'), href: "/features/white-label" },
            { icon: Share2, label: t('megaMenu.platform.customDomains'), description: t('megaMenu.platform.customDomainsDesc'), href: "/features/custom-domains" }
          ]
        }
      ],
      featured: {
        // Badge icon — was an emoji baked into the title locale string,
        // which rendered as black on the purple gradient (poor contrast).
        // Now: lucide Sparkles in a translucent white pill badge.
        icon: Sparkles,
        title: t('megaMenu.platform.featuredTitle'),
        subtitle: t('megaMenu.platform.featuredSubtitle'),
        description: t('megaMenu.platform.featuredDesc'),
        cta: t('megaMenu.platform.featuredCta'),
        href: "/platform"
      }
    },
    solutions: {
      sections: [
        {
          title: t('megaMenu.solutions.byIndustry'),
          items: [
            { icon: GraduationCap, label: t('megaMenu.solutions.higherEducation'), description: t('megaMenu.solutions.higherEducationDesc'), href: "/solutions/higher-education" },
            { icon: Building2, label: t('megaMenu.solutions.associations'), description: t('megaMenu.solutions.associationsDesc'), href: "/solutions/associations" },
            { icon: Briefcase, label: t('megaMenu.solutions.corporateTraining'), description: t('megaMenu.solutions.corporateTrainingDesc'), href: "/solutions/corporate-training" },
            { icon: Trophy, label: t('megaMenu.solutions.certificationBodies'), description: t('megaMenu.solutions.certificationBodiesDesc'), href: "/solutions/certification-bodies" },
            { icon: Heart, label: t('megaMenu.solutions.healthcare'), description: t('megaMenu.solutions.healthcareDesc'), href: "/solutions/healthcare" },
            { icon: Factory, label: t('megaMenu.solutions.manufacturing'), description: t('megaMenu.solutions.manufacturingDesc'), href: "/solutions/manufacturing" }
          ]
        },
        {
          title: t('megaMenu.solutions.byUseCase'),
          items: [
            { icon: Award, label: t('megaMenu.solutions.courseCompletion'), description: t('megaMenu.solutions.courseCompletionDesc'), href: "/use-cases/course-completion" },
            { icon: Shield, label: t('megaMenu.solutions.professionalLicenses'), description: t('megaMenu.solutions.professionalLicensesDesc'), href: "/use-cases/professional-licenses" },
            { icon: Users, label: t('megaMenu.solutions.memberCredentials'), description: t('megaMenu.solutions.memberCredentialsDesc'), href: "/use-cases/member-credentials" }
          ]
        },
        {
          title: t('megaMenu.solutions.byGoal'),
          items: [
            { icon: BarChart3, label: t('megaMenu.solutions.scaleProgram'), description: t('megaMenu.solutions.scaleProgramDesc'), href: "/use-cases/scale-program" },
            { icon: Share2, label: t('megaMenu.solutions.increaseEngagement'), description: t('megaMenu.solutions.increaseEngagementDesc'), href: "/use-cases/increase-engagement" },
            { icon: Zap, label: t('megaMenu.solutions.saveTime'), description: t('megaMenu.solutions.saveTimeDesc'), href: "/use-cases/save-time" }
          ]
        }
      ],
      featured: {
        icon: Star,
        title: t('megaMenu.solutions.featuredTitle'),
        subtitle: t('megaMenu.solutions.featuredSubtitle'),
        description: t('megaMenu.solutions.featuredDesc'),
        cta: t('megaMenu.solutions.featuredCta'),
        href: "/customer-success"
      }
    },
    resources: {
      sections: [
        {
          title: t('megaMenu.resources.learn'),
          items: [
            { icon: BookOpen, label: t('megaMenu.resources.blogLabel'), description: t('megaMenu.resources.blogDesc'), href: "/blog" },
            { icon: FileText, label: t('megaMenu.resources.customerStories'), description: t('megaMenu.resources.customerStoriesDesc'), href: "/customer-success" },
            { icon: Users, label: t('megaMenu.resources.aboutUs'), description: t('megaMenu.resources.aboutUsDesc'), href: "/about" },
            { icon: HelpCircle, label: t('megaMenu.resources.helpCenter'), description: t('megaMenu.resources.helpCenterDesc'), href: "/resources" }
          ]
        },
        {
          title: t('megaMenu.resources.support'),
          items: [
            { icon: Mail, label: t('megaMenu.resources.contactSupport'), description: t('megaMenu.resources.contactSupportDesc'), href: "/contact" },
            { icon: BookOpen, label: t('megaMenu.resources.videoTutorials'), description: t('megaMenu.resources.videoTutorialsDesc'), href: "/tutorials" }
          ]
        }
      ],
      featured: {
        icon: BookOpen,
        title: t('megaMenu.resources.featuredTitle'),
        subtitle: t('megaMenu.resources.featuredSubtitle'),
        description: t('megaMenu.resources.featuredDesc'),
        cta: t('megaMenu.resources.featuredCta'),
        href: "/resources"
      }
    }
  };

  const navItems = [
    { key: 'platform', labelKey: 'nav.platform', menuData: megaMenus.platform, width: '800px', cols: 4 },
    { key: 'solutions', labelKey: 'nav.solutions', menuData: megaMenus.solutions, width: '800px', cols: 4 },
  ];

  return { megaMenus, navItems };
};
