export interface Job {
  APPLIED: string;
  COMPANY: string;
  COMPANY_LOCATION: string;
  JOB_CATEGORY: string;
  JOB_ID: number;
  JOB_LINK: string;
  JOB_SOURCE: string;
  JOB_TITLE: string;
  JOB_TYPE: string;
  LINKEDIN_VERIFIED: string;
}

export interface JobsResponse {
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface JobCategory {
  key: string;
  label: string;
  count?: number;
}

export const JOB_CATEGORIES: JobCategory[] = [
  { key: 'Recommended', label: 'Recommended' },
  { key: 'Easy Apply', label: 'Easy Apply' },
  { key: 'Remote', label: 'Remote Jobs' },
  { key: 'IT', label: 'IT Services & Consulting' },
  { key: 'HR', label: 'Human Resources' },
  { key: 'Finance', label: 'Financial Services' },
  { key: 'Sustainability', label: 'Sustainability' },
  { key: 'Hybrid', label: 'Hybrid' },
  { key: 'Pharma', label: 'Pharmaceuticals' },
  { key: 'Part-time', label: 'Part Time Jobs' },
  { key: 'Social impact', label: 'Social Impact' },
  { key: 'Manufacturing', label: 'Manufacturing' },
  { key: 'Real estate', label: 'Real Estate' },
  { key: 'Healthcare', label: 'Healthcare & Hospitals' },
  { key: 'Government', label: 'Government' }
];