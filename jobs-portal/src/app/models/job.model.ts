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
  REJECTED?: string; // Optional field for rejected status
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
  { key: 'Government', label: 'Government' },
  { key: 'Biotech', label: 'Biotech' },
  { key: 'Defense and space', label: 'Defense and space' },
  { key: 'Operations', label: 'Operations' },
  { key: 'Construction', label: 'Construction' },
  { key: 'Small biz', label: 'Small biz' },
  { key: 'Human services', label: 'Human services' },
  { key: 'Publishing', label: 'Publishing' },
  { key: 'Retail', label: 'Retail' },
  { key: 'Hospitality', label: 'Hospitality' },
  { key: 'Education', label: 'Education' },
  { key: 'Media', label: 'Media' },
  { key: 'Restaurants', label: 'Restaurants' },
  { key: 'Logistics', label: 'Logistics' },
  { key: 'Digital security', label: 'Digital security' },
  { key: 'Marketing', label: 'Marketing' },
  { key: 'Career growth', label: 'Career growth' },
  { key: 'Higher ed', label: 'Higher ed' },
  { key: 'Food & bev', label: 'Food & bev' },
  { key: 'Non-profit', label: 'Non-profit' },
  { key: 'Gaming', label: 'Gaming' },
  { key: 'Recruiting', label: 'Recruiting' },
  { key: 'Veterinary med', label: 'Veterinary med' },
  { key: 'Civil eng', label: 'Civil eng' },
  { key: 'Work-life balance', label: 'Work-life balance' },
  { key: 'Fashion', label: 'Fashion' }
];