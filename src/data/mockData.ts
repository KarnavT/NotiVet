export interface Drug {
  id: string;
  brandName: string;
  genericName: string;
  activeIngredient: string;
  species: string[];
  indications: string[];
  routes: string[];
  dosing: string;
  contraindications: string[];
  warnings: string[];
  withdrawalTimes?: string;
  faradLink?: string;
  labelLink?: string;
  isFavorite?: boolean;
  dateAdded: string;
  adverseEvents?: {
    species: string;
    count: number;
  }[];
}

export interface Message {
  id: string;
  drugId: string;
  drugName: string;
  species: string[];
  indication: string;
  summary: string;
  guidelinesLink: string;
  pdfReportLink: string;
  isRead: boolean;
  dateCreated: string;
  pharmaCompany: string;
}

export const mockDrugs: Drug[] = [
  {
    id: '1',
    brandName: 'Librela',
    genericName: 'bedinvetmab',
    activeIngredient: 'bedinvetmab',
    species: ['Dogs'],
    indications: ['Osteoarthritis pain', 'Joint pain'],
    routes: ['SC (subcutaneous)'],
    dosing: '0.5-1.0 mg/kg once monthly',
    contraindications: ['Hypersensitivity to bedinvetmab', 'Active infections'],
    warnings: ['Monitor for allergic reactions', 'Not for use in pregnant animals'],
    withdrawalTimes: 'N/A (companion animals)',
    labelLink: 'https://example.com/librela-label',
    faradLink: 'https://example.com/librela-farad',
    dateAdded: '2024-01-15',
    adverseEvents: [
      { species: 'Dogs', count: 12 },
    ]
  },
  {
    id: '2',
    brandName: 'Solensia',
    genericName: 'frunevetmab',
    activeIngredient: 'frunevetmab',
    species: ['Cats'],
    indications: ['Osteoarthritis pain'],
    routes: ['SC (subcutaneous)'],
    dosing: '1-3 mg/kg once monthly',
    contraindications: ['Hypersensitivity to frunevetmab'],
    warnings: ['Monitor for injection site reactions'],
    withdrawalTimes: 'N/A (companion animals)',
    labelLink: 'https://example.com/solensia-label',
    dateAdded: '2024-01-20',
    adverseEvents: [
      { species: 'Cats', count: 8 },
    ]
  },
  {
    id: '3',
    brandName: 'Sileo',
    genericName: 'dexmedetomidine',
    activeIngredient: 'dexmedetomidine hydrochloride',
    species: ['Dogs'],
    indications: ['Noise aversion', 'Anxiety'],
    routes: ['Oral gel'],
    dosing: '125 mcg/m² body surface area',
    contraindications: ['Cardiovascular disease', 'Respiratory disorders'],
    warnings: ['Avoid contact with mucous membranes', 'Use protective gloves'],
    withdrawalTimes: 'N/A (companion animals)',
    labelLink: 'https://example.com/sileo-label',
    dateAdded: '2024-02-01',
    adverseEvents: [
      { species: 'Dogs', count: 15 },
    ]
  },
  {
    id: '4',
    brandName: 'Convenia',
    genericName: 'cefovecin',
    activeIngredient: 'cefovecin sodium',
    species: ['Dogs', 'Cats'],
    indications: ['Skin infections', 'Urinary tract infections'],
    routes: ['SC (subcutaneous)', 'IM (intramuscular)'],
    dosing: '8 mg/kg single injection',
    contraindications: ['Hypersensitivity to beta-lactam antibiotics'],
    warnings: ['Use only for labeled indications', 'Monitor for allergic reactions'],
    withdrawalTimes: 'N/A (companion animals)',
    labelLink: 'https://example.com/convenia-label',
    dateAdded: '2024-02-10',
    adverseEvents: [
      { species: 'Dogs', count: 5 },
      { species: 'Cats', count: 3 },
    ]
  },
  {
    id: '5',
    brandName: 'Banamine',
    genericName: 'flunixin meglumine',
    activeIngredient: 'flunixin meglumine',
    species: ['Horses', 'Cattle'],
    indications: ['Pain relief', 'Anti-inflammatory'],
    routes: ['IV (intravenous)', 'IM (intramuscular)', 'PO (oral)'],
    dosing: '1.1 mg/kg once or twice daily',
    contraindications: ['Renal impairment', 'GI ulceration'],
    warnings: ['Monitor kidney function', 'Avoid concurrent NSAID use'],
    withdrawalTimes: 'Cattle: 4 days milk, 6 days slaughter',
    labelLink: 'https://example.com/banamine-label',
    faradLink: 'https://example.com/banamine-farad',
    dateAdded: '2024-02-15',
    adverseEvents: [
      { species: 'Horses', count: 22 },
      { species: 'Cattle', count: 18 },
    ]
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    drugId: '1',
    drugName: 'Librela (bedinvetmab)',
    species: ['Dogs'],
    indication: 'Osteoarthritis pain',
    summary: 'New long-acting monoclonal antibody for canine osteoarthritis pain management. Single monthly injection provides sustained pain relief.',
    guidelinesLink: 'https://example.com/librela-guidelines',
    pdfReportLink: 'https://example.com/librela-efficacy.pdf',
    isRead: false,
    dateCreated: '2024-03-01',
    pharmaCompany: 'Zoetis'
  },
  {
    id: '2',
    drugId: '2',
    drugName: 'Solensia (frunevetmab)',
    species: ['Cats'],
    indication: 'Osteoarthritis pain',
    summary: 'FDA-approved monoclonal antibody therapy for feline osteoarthritis. Monthly subcutaneous injection with excellent safety profile.',
    guidelinesLink: 'https://example.com/solensia-guidelines',
    pdfReportLink: 'https://example.com/solensia-study.pdf',
    isRead: true,
    dateCreated: '2024-02-25',
    pharmaCompany: 'Zoetis'
  },
  {
    id: '3',
    drugId: '3',
    drugName: 'Sileo (dexmedetomidine)',
    species: ['Dogs'],
    indication: 'Noise aversion',
    summary: 'Oromucosal gel for treatment of canine noise aversion. Fast-acting alpha-2 agonist for anxiety management during fireworks, thunderstorms.',
    guidelinesLink: 'https://example.com/sileo-guidelines',
    pdfReportLink: 'https://example.com/sileo-behavioral.pdf',
    isRead: false,
    dateCreated: '2024-02-20',
    pharmaCompany: 'Zoetis'
  }
];

export const speciesFilters = [
  'Dogs',
  'Cats', 
  'Horses',
  'Cattle',
  'Poultry',
  'Exotic Animals',
  'Large Animals'
];

export const indicationFilters = [
  'Pain relief',
  'Anti-inflammatory', 
  'Antibiotic',
  'Anesthesia',
  'Dermatology',
  'GI disorders',
  'Respiratory',
  'Cardiovascular',
  'Behavioral',
  'Parasiticide'
];

export const routeFilters = [
  'PO (oral)',
  'IV (intravenous)',
  'IM (intramuscular)', 
  'SC (subcutaneous)',
  'Topical',
  'Inhalation',
  'Ophthalmic',
  'Otic'
];