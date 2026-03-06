// App configuration constants

export const APP_CONFIG = {
  name: 'Muqabla',
  nameAr: 'مقابلة',
  tagline: 'Your video is your resume',
  taglineAr: 'فيديوك هو سيرتك الذاتية',

  // Video settings
  video: {
    maxDuration: 60,           // seconds
    minDuration: 10,           // seconds
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    quality: '1080p',
    aspectRatio: 9 / 16,       // Vertical video (TikTok style)
  },

  // Pagination
  pagination: {
    feedPageSize: 10,
    searchPageSize: 20,
    applicationsPageSize: 15,
  },

  // Cache durations (in milliseconds)
  cache: {
    feedStale: 5 * 60 * 1000,      // 5 minutes
    profileStale: 10 * 60 * 1000,  // 10 minutes
    jobsStale: 2 * 60 * 1000,      // 2 minutes
  },

  // GCC specific
  gcc: {
    countries: [
      { code: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة' },
      { code: 'SA', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
      { code: 'QA', name: 'Qatar', nameAr: 'قطر' },
      { code: 'KW', name: 'Kuwait', nameAr: 'الكويت' },
      { code: 'BH', name: 'Bahrain', nameAr: 'البحرين' },
      { code: 'OM', name: 'Oman', nameAr: 'عُمان' },
    ],
    cities: {
      AE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah'],
      SA: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
      QA: ['Doha', 'Al Wakrah', 'Al Khor'],
      KW: ['Kuwait City', 'Hawalli', 'Salmiya'],
      BH: ['Manama', 'Riffa', 'Muharraq'],
      OM: ['Muscat', 'Salalah', 'Sohar'],
    },
    currencies: {
      AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
      SA: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
      QA: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
      KW: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
      BH: { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar' },
      OM: { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial' },
    },
  },

  // Job categories
  industries: [
    { id: 'tech', name: 'Technology', nameAr: 'التكنولوجيا' },
    { id: 'finance', name: 'Finance & Banking', nameAr: 'المالية والمصرفية' },
    { id: 'healthcare', name: 'Healthcare', nameAr: 'الرعاية الصحية' },
    { id: 'retail', name: 'Retail', nameAr: 'التجزئة' },
    { id: 'hospitality', name: 'Hospitality', nameAr: 'الضيافة' },
    { id: 'construction', name: 'Construction', nameAr: 'البناء' },
    { id: 'education', name: 'Education', nameAr: 'التعليم' },
    { id: 'marketing', name: 'Marketing', nameAr: 'التسويق' },
    { id: 'logistics', name: 'Logistics', nameAr: 'اللوجستيات' },
    { id: 'oil_gas', name: 'Oil & Gas', nameAr: 'النفط والغاز' },
    { id: 'real_estate', name: 'Real Estate', nameAr: 'العقارات' },
    { id: 'other', name: 'Other', nameAr: 'أخرى' },
  ],

  jobTypes: [
    { id: 'full_time', name: 'Full-time', nameAr: 'دوام كامل' },
    { id: 'part_time', name: 'Part-time', nameAr: 'دوام جزئي' },
    { id: 'contract', name: 'Contract', nameAr: 'عقد' },
    { id: 'freelance', name: 'Freelance', nameAr: 'عمل حر' },
    { id: 'internship', name: 'Internship', nameAr: 'تدريب' },
  ],

  workModes: [
    { id: 'on_site', name: 'On-site', nameAr: 'في الموقع' },
    { id: 'remote', name: 'Remote', nameAr: 'عن بُعد' },
    { id: 'hybrid', name: 'Hybrid', nameAr: 'هجين' },
  ],

  experienceLevels: [
    { id: 'entry', name: 'Entry Level', nameAr: 'مستوى مبتدئ', years: '0-2' },
    { id: 'mid', name: 'Mid Level', nameAr: 'مستوى متوسط', years: '3-5' },
    { id: 'senior', name: 'Senior', nameAr: 'خبير', years: '6-10' },
    { id: 'lead', name: 'Lead/Manager', nameAr: 'قائد/مدير', years: '10+' },
    { id: 'executive', name: 'Executive', nameAr: 'تنفيذي', years: '15+' },
  ],

  companySizes: [
    { id: '1-10', name: '1-10 employees', nameAr: '١-١٠ موظفين' },
    { id: '11-50', name: '11-50 employees', nameAr: '١١-٥٠ موظف' },
    { id: '51-200', name: '51-200 employees', nameAr: '٥١-٢٠٠ موظف' },
    { id: '201-500', name: '201-500 employees', nameAr: '٢٠١-٥٠٠ موظف' },
    { id: '501-1000', name: '501-1000 employees', nameAr: '٥٠١-١٠٠٠ موظف' },
    { id: '1000+', name: '1000+ employees', nameAr: 'أكثر من ١٠٠٠ موظف' },
  ],
};

export const APPLICATION_STATUS = {
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: '#F39C12' },
  viewed: { label: 'Viewed', labelAr: 'تمت المشاهدة', color: '#3498DB' },
  shortlisted: { label: 'Shortlisted', labelAr: 'مختار', color: '#0D7377' },
  interviewing: { label: 'Interviewing', labelAr: 'مقابلة', color: '#9B59B6' },
  offered: { label: 'Offered', labelAr: 'عرض وظيفي', color: '#2ECC71' },
  hired: { label: 'Hired', labelAr: 'تم التوظيف', color: '#27AE60' },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: '#E74C3C' },
} as const;

export const JOB_STATUS = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: '#9CA3AF' },
  active: { label: 'Active', labelAr: 'نشط', color: '#2ECC71' },
  paused: { label: 'Paused', labelAr: 'متوقف', color: '#F39C12' },
  closed: { label: 'Closed', labelAr: 'مغلق', color: '#E74C3C' },
} as const;
