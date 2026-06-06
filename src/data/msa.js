/**
 * Master Subscription Agreement (MSA) data — extracted from
 * "Mike CredSure MSA (April 2026).docx" Rev004 dated 01.04.2026.
 * Source: Certif-ID International GmbH
 *
 * Rendered by /app/frontend/src/pages/PoliciesTerms.jsx
 */
export const MSA_META = {
  documentName: 'CredSure Master Subscription Agreement',
  version: 'Rev004',
  effectiveDate: '01.04.2026',
  supplier: {
    legalName: 'Certif-ID International GmbH',
    addressLines: ['Scheffelstraße 58a', '50935 Köln', 'Germany'],
    contactEmail: 'datenschutz@certif-id.com',
    website: 'https://www.certif-id.com',
  },
};

export const MSA_SECTIONS = [
  {
    id: 'parties',
    number: '1',
    title: 'Parties',
    body: [
      { sub: '1.1 Supplier', text: 'Certif-ID International GmbH\nScheffelstraße 58a\n50935 Köln\nGermany ("Certif-ID", "Supplier", "we", "us")' },
      { sub: '1.2 Customer', text: 'The legal entity identified in an applicable Order Form. ("Customer", "you")' },
      { sub: '1.3 Effective Date', text: 'This Agreement becomes effective on the effective date of the first applicable Order Form ("Effective Date").' },
    ],
  },
  {
    id: 'scope',
    number: '2',
    title: 'Scope',
    body: [
      { text: 'This Agreement governs Customer\'s access to and use of the CredSure platform and related Services. Customer Affiliates may subscribe under separate Order Forms referencing this Agreement.' },
    ],
  },
  {
    id: 'definitions',
    number: '3',
    title: 'Definitions',
    body: [
      { sub: '3.1 Affiliate', text: 'Any entity controlling, controlled by, or under common control with a party.' },
      { sub: '3.2 Confidential Information', text: 'Any non-public business, financial, commercial, technical, security, operational, legal, or compliance-related information disclosed by one party to the other that should reasonably be understood as confidential.' },
      { sub: '3.3 Customer Data', text: 'Any data submitted to, stored in, transmitted through, or otherwise processed within the Services on behalf of Customer.' },
      { sub: '3.4 Order Form', text: 'A written or electronic ordering document referencing this Agreement.' },
      { sub: '3.5 Services', text: 'The CredSure platform and associated contracted modules, support, integrations, APIs, implementation services, and related offerings are purchased under an Order Form.' },
      { sub: '3.6 Trust Center', text: 'Certif-ID\'s online trust and assurance portal contains available privacy, security, diligence, and compliance materials.' },
      { sub: '3.7 DPA', text: 'The existing CredSure Data Processing Addendum / Data Processing Agreement in force between the parties, as updated from time to time in accordance with its terms.' },
    ],
  },
  {
    id: 'contract-structure',
    number: '4',
    title: 'Contract Structure and Order of Precedence',
    body: [
      { sub: '4.1 Contract Stack', text: 'The contract stack consists of:', list: [
        'applicable Order Form(s)',
        'the existing DPA for privacy and Personal Data Processing matters',
        'this Agreement',
        'any expressly incorporated schedules',
      ]},
      { sub: '4.2 Order of Precedence', text: 'If there is a conflict between documents:', list: [
        'Order Form for local commercial scope, subscribing entity details, rollout specifics, selected Services, pricing, and operational onboarding matters only',
        'the DPA for privacy, security, Personal Data Processing, retention, deletion, Subprocessors, and transfer matters',
        'this Agreement for all other commercial and legal matters',
        'any expressly incorporated Service Schedule solely for the service topic it governs',
      ]},
      { sub: '4.3 No Implied Amendment', text: 'No silence in an Order Form, support communication, Trust Center material, or sales representation shall amend this Agreement or the DPA unless expressly agreed in signed writing.' },
    ],
  },
  {
    id: 'services',
    number: '5',
    title: 'Services',
    body: [
      { text: 'Services may include:', list: [
        'digital credential issuance',
        'credential verification',
        'recipient access portals',
        'analytics and reporting',
        'APIs and integrations',
        'onboarding services',
        'customer support',
        'implementation services',
      ]},
      { text: 'Specific Services purchased shall be identified in the applicable Order Form.' },
    ],
  },
  {
    id: 'order-forms',
    number: '6',
    title: 'Order Forms',
    body: [
      { text: 'Each Order Form forms part of this Agreement. An Order Form may specify:', list: [
        'subscribing legal entity',
        'country or Affiliate',
        'rollout scope',
        'package purchased',
        'fees',
        'term',
        'implementation timetable',
        'local requirements',
      ]},
      { text: 'No Order Form silently amends liability, privacy, confidentiality, or IP terms unless expressly stated.' },
    ],
  },
  {
    id: 'fees-payment',
    number: '7',
    title: 'Fees and Payment',
    body: [
      { sub: '7.1 Fees', text: 'Fees are stated in the applicable Order Form.' },
      { sub: '7.2 Payment Terms', text: 'Unless otherwise agreed:', list: [
        'invoices are payable within thirty (30) days',
        'overdue undisputed amounts may accrue lawful interest',
        'Customer is responsible for applicable taxes, excluding taxes on Certif-ID income',
      ]},
      { sub: '7.3 Suspension for Non-Payment', text: 'Certif-ID may suspend Services for material non-payment after written notice and reasonable cure opportunity.' },
    ],
  },
  {
    id: 'subscription-term',
    number: '8',
    title: 'Subscription Term',
    body: [
      { sub: '8.1 Agreement Term', text: 'This Agreement begins on the Effective Date and continues until terminated.' },
      { sub: '8.2 Order Form Term', text: 'Each Order Form continues for its stated term and renews as specified therein.' },
    ],
  },
  {
    id: 'customer-responsibilities',
    number: '9',
    title: 'Customer Responsibilities',
    body: [
      { text: 'Customer shall:', list: [
        'use the Services lawfully',
        'maintain credential security for Customer-managed accounts',
        'ensure authorised users comply with this Agreement',
        'provide accurate onboarding information',
        'use reasonable efforts to prevent unauthorised access',
        'remain responsible for the legality of Customer Data',
        'manage permissions and configurations under Customer control, including identity integrations where applicable',
      ]},
      { text: 'Customer is responsible for settings under its control, including user permissions, administrator roles, and federated identity configurations.' },
    ],
  },
  {
    id: 'data-protection',
    number: '10',
    title: 'Data Protection',
    body: [
      { sub: '10.1 Existing DPA Applies', text: 'Where Certif-ID processes Personal Data on behalf of Customer, the existing DPA applies automatically.' },
      { sub: '10.2 DPA Governs Privacy Matters', text: 'The DPA governs, without limitation:', list: [
        'controller / processor obligations',
        'security obligations',
        'Subprocessors',
        'international transfers',
        'retention, return, and deletion',
        'audit rights relating to Personal Data Processing',
        'liability and indemnification relating to privacy and data protection matters',
      ]},
      { sub: '10.3 Prevailing Privacy Terms', text: 'In the event of any inconsistency between this Agreement and the DPA regarding Personal Data Processing, the DPA shall prevail.' },
    ],
  },
  {
    id: 'security',
    number: '11',
    title: 'Security',
    body: [
      { text: 'Certif-ID shall maintain technical and organisational measures appropriate to the risks associated with the Services. Routine diligence may ordinarily be satisfied through the Trust Center. Detailed commitments relating to Personal Data Processing are set out in the DPA.' },
    ],
  },
  {
    id: 'trust-center',
    number: '12',
    title: 'Trust Center',
    body: [
      { text: 'Certif-ID maintains a Trust Center containing available assurance materials, which may include:', list: [
        'privacy materials',
        'security summaries',
        'certifications',
        'questionnaires',
        'Subprocessor information',
        'policy overviews',
      ]},
      { text: 'Unless expressly incorporated in writing, Trust Center materials are informational and do not independently amend contractual obligations.' },
    ],
  },
  {
    id: 'confidentiality',
    number: '13',
    title: 'Confidentiality',
    body: [
      { sub: '13.1 Obligations', text: 'Each party shall:', list: [
        'protect Confidential Information using reasonable care',
        'use Confidential Information only for purposes of this Agreement',
        'restrict disclosure to personnel, advisers, contractors, auditors, or Affiliates with a need to know and confidentiality obligations',
      ]},
      { sub: '13.2 Exclusions', text: 'Confidential Information excludes information that:', list: [
        'becomes public without breach',
        'was lawfully known before disclosure',
        'is independently developed',
        'is lawfully received from a third party without duty of confidence',
      ]},
      { sub: '13.3 Compelled Disclosure', text: 'A party may disclose Confidential Information where required by law or regulator, using reasonable efforts to provide prior notice where lawful.' },
      { sub: '13.4 Survival', text: 'Confidentiality obligations survive termination for five (5) years, and trade secrets for so long as protected by law.' },
    ],
  },
  {
    id: 'intellectual-property',
    number: '14',
    title: 'Intellectual Property',
    body: [
      { sub: '14.1 Certif-ID Ownership', text: 'Certif-ID owns all right, title, and interest in:', list: [
        'Services',
        'software',
        'documentation',
        'branding',
        'methodologies',
        'improvements',
      ], textAfter: 'excluding Customer Confidential Information' },
      { sub: '14.2 Customer Ownership', text: 'Customer retains ownership of Customer Data.' },
      { sub: '14.3 Feedback', text: 'Customer feedback may be used by Certif-ID without restriction provided no Customer Confidential Information is disclosed.' },
    ],
  },
  {
    id: 'acceptable-use',
    number: '15',
    title: 'Acceptable Use',
    body: [
      { text: 'Customer shall not:', list: [
        'reverse engineer except where non-waivable law permits',
        'resell access unless authorised',
        'interfere with security or service integrity',
        'upload malware',
        'attempt unauthorised access',
        'use the Services unlawfully',
      ]},
    ],
  },
  {
    id: 'warranties',
    number: '16',
    title: 'Warranties',
    body: [
      { sub: '16.1 Service Warranty', text: 'Certif-ID warrants that Services will materially perform in accordance with documentation.' },
      { sub: '16.2 Standard of Care', text: 'Certif-ID warrants that Services will be provided with reasonable skill and care.' },
      { sub: '16.3 Disclaimer', text: 'Except as expressly stated, Services are provided on an as-available basis. Certif-ID does not warrant uninterrupted or error-free operation.' },
    ],
  },
  {
    id: 'indemnities',
    number: '17',
    title: 'Indemnities',
    body: [
      { sub: '17.1 By Certif-ID', text: 'Certif-ID shall defend and indemnify Customer against third-party claims alleging that the Services, when used in accordance with this Agreement, infringe intellectual property rights. Exclusions include claims arising from:', list: [
        'Customer modifications',
        'combinations not supplied by Certif-ID',
        'misuse',
        'use contrary to documentation',
      ], textAfter: 'Certif-ID may:\n• procure continued rights of use\n• modify Services\n• replace affected functionality\n• terminate affected Services and refund prepaid unused fees for impacted portions' },
      { sub: '17.2 By Customer', text: 'Customer shall defend and indemnify Certif-ID against third-party claims arising from:', list: [
        'unlawful Customer Data',
        'Customer misuse',
        'Customer breach of law',
        'unlawful instructions given to Certif-ID',
      ]},
      { sub: '17.3 Privacy Carve-Out', text: 'Liability and indemnification relating specifically to Personal Data Processing, data protection breaches, regulatory exposure, Data Subject claims, Subprocessor responsibility, and related privacy matters shall be governed by the DPA.' },
      { sub: '17.4 Procedure', text: 'The indemnified party shall promptly notify the indemnifying party and provide reasonable cooperation.' },
    ],
  },
  {
    id: 'limitation-of-liability',
    number: '18',
    title: 'Limitation of Liability',
    body: [
      { sub: '18.1 General Cap', text: 'Except as stated below, each party\'s aggregate liability arising from this Agreement and all Order Forms shall not exceed the fees paid or payable in the twelve (12) months preceding the event giving rise to liability.' },
      { sub: '18.2 Higher-Risk Cap', text: 'For liability arising from:', list: [
        'confidentiality breach',
        'indemnified claims',
        'privacy and data protection claims to the extent the DPA links such claims to the higher-risk cap in this Agreement',
      ], textAfter: 'aggregate liability shall not exceed two (2) times the cap in Section 18.1.' },
      { sub: '18.3 Unlimited / Non-Excluded Liability', text: 'Nothing limits liability for:', list: [
        'fraud',
        'wilful misconduct',
        'death or personal injury where non-excludable',
        'deliberate unlawful misuse of Personal Data',
        'liabilities that cannot legally be limited',
      ]},
      { sub: '18.4 Excluded Losses', text: 'Except where prohibited by law, neither party shall be liable for:', list: [
        'indirect loss',
        'consequential loss',
        'loss of profits',
        'loss of goodwill',
      ]},
      { sub: '18.5 DPA Interaction', text: 'Where the DPA contains specific privacy liability allocation, contribution, indemnification, or reimbursement language required by Applicable Data Protection Laws, that DPA language shall operate alongside this Agreement and prevail to the extent necessary for privacy matters.' },
    ],
  },
  {
    id: 'suspension',
    number: '19',
    title: 'Suspension',
    body: [
      { text: 'Certif-ID may suspend Services where reasonably necessary for:', list: [
        'security threats',
        'unlawful use',
        'material payment default after notice',
      ], textAfter: 'Reasonable efforts shall be used to limit scope and duration.' },
    ],
  },
  {
    id: 'termination',
    number: '20',
    title: 'Termination',
    body: [
      { text: 'Either party may terminate for material breach not cured within thirty (30) days after written notice. Either party may terminate where the other becomes insolvent or ceases business operations.' },
    ],
  },
  {
    id: 'effects-of-termination',
    number: '21',
    title: 'Effects of Termination',
    body: [
      { text: 'Upon termination or expiry:', list: [
        'Customer access rights cease subject to agreed transition support',
        'Customer Data handling follows the DPA',
        'accrued payment obligations survive',
        'surviving clauses remain effective',
      ], textAfter: 'Termination of one Order Form does not automatically terminate all Order Forms unless expressly stated.' },
    ],
  },
  {
    id: 'publicity',
    number: '22',
    title: 'Publicity',
    body: [
      { text: 'Certif-ID may identify Customer as a customer only with prior written consent or separate written agreement.' },
    ],
  },
  {
    id: 'governing-law',
    number: '23',
    title: 'Governing Law and Jurisdiction',
    body: [
      { text: 'This Agreement is governed by the laws of Germany. Exclusive jurisdiction shall be the courts of Cologne (Köln), Germany, unless mandatory law requires otherwise. The parties shall first use reasonable good-faith efforts to resolve disputes through designated representatives.' },
    ],
  },
  {
    id: 'entire-agreement',
    number: '24',
    title: 'Entire Agreement',
    body: [
      { text: 'This Agreement together with applicable Order Forms, the DPA, and incorporated schedules forms the entire agreement regarding the Services.' },
    ],
  },
  {
    id: 'amendments',
    number: '25',
    title: 'Amendments',
    body: [
      { text: 'Amendments must be in writing signed by authorised representatives, except non-material administrative updates not reducing protections.' },
    ],
  },
  {
    id: 'counterparts',
    number: '26',
    title: 'Counterparts and Electronic Signature',
    body: [
      { text: 'This Agreement may be executed in counterparts and electronically.' },
    ],
  },
];
