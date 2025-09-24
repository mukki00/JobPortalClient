export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  category: string;
  postedDate: string;
  applicationUrl?: string;
  tags?: string[];
  experience?: string;
  benefits?: string[];
  companyLogo?: string;
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
  { key: 'recommended', label: 'Recommended' },
  { key: 'easy-apply', label: 'Easy Apply' },
  { key: 'remote-jobs', label: 'Remote Jobs' },
  { key: 'it-services-and-it-consulting', label: 'IT Services & Consulting' },
  { key: 'human-resources', label: 'Human Resources' },
  { key: 'financial-services', label: 'Financial Services' },
  { key: 'sustainability', label: 'Sustainability' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { key: 'part-time-jobs', label: 'Part Time Jobs' },
  { key: 'social-impact', label: 'Social Impact' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'real-estate', label: 'Real Estate' },
  { key: 'hospitals-and-healthcare', label: 'Healthcare & Hospitals' },
  { key: 'government', label: 'Government' }
];