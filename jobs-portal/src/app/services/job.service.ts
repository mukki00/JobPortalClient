import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Job, JobsResponse } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000';
  
  // State management
  private currentPageSubject = new BehaviorSubject<number>(1);
  private currentCategorySubject = new BehaviorSubject<string>('recommended');
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  public currentPage$ = this.currentPageSubject.asObservable();
  public currentCategory$ = this.currentCategorySubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Fetch jobs from the API with pagination and category filtering
   */
  getJobs(page: number = 1, perPage: number = 50, category: string = 'recommended'): Observable<JobsResponse> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (category && category !== 'all') {
      params = params.set('job_category', category);
    }

    const url = `${this.baseUrl}/jobs`;
    
    return new Observable<JobsResponse>(observer => {
      this.http.get<JobsResponse>(url, { params }).subscribe({
        next: (response) => {
          this.currentPageSubject.next(page);
          this.currentCategorySubject.next(category);
          this.loadingSubject.next(false);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          this.loadingSubject.next(false);
          console.error('Error fetching jobs:', error);
          
          // Return mock data for development/demo purposes
          const mockResponse: JobsResponse = this.getMockJobsResponse(page, perPage, category);
          observer.next(mockResponse);
          observer.complete();
        }
      });
    });
  }

  /**
   * Update current page
   */
  setCurrentPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  /**
   * Update current category
   */
  setCurrentCategory(category: string): void {
    this.currentCategorySubject.next(category);
  }

  /**
   * Get current page value
   */
  getCurrentPage(): number {
    return this.currentPageSubject.value;
  }

  /**
   * Get current category value
   */
  getCurrentCategory(): string {
    return this.currentCategorySubject.value;
  }

  /**
   * Mock data for development/demo purposes
   */
  private getMockJobsResponse(page: number, perPage: number, category: string): JobsResponse {
    const mockJobs: Job[] = [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
        requirements: ['React', 'TypeScript', 'CSS3', 'Angular'],
        salary: '$120,000 - $150,000',
        type: 'full-time',
        category: category,
        postedDate: '2025-09-20',
        applicationUrl: 'https://example.com/apply/1',
        tags: ['React', 'Frontend', 'JavaScript'],
        experience: '5+ years',
        benefits: ['Health Insurance', 'Remote Work', '401k']
      },
      {
        id: 2,
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Remote',
        description: 'Join our DevOps team to build and maintain scalable cloud infrastructure...',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        salary: '$110,000 - $140,000',
        type: 'remote',
        category: category,
        postedDate: '2025-09-19',
        applicationUrl: 'https://example.com/apply/2',
        tags: ['DevOps', 'AWS', 'Docker'],
        experience: '3+ years',
        benefits: ['Flexible Hours', 'Learning Budget', 'Stock Options']
      },
      {
        id: 3,
        title: 'Product Manager',
        company: 'InnovateLabs',
        location: 'New York, NY',
        description: 'Lead product strategy and development for our cutting-edge platform...',
        requirements: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
        salary: '$130,000 - $160,000',
        type: 'hybrid',
        category: category,
        postedDate: '2025-09-18',
        applicationUrl: 'https://example.com/apply/3',
        tags: ['Product Management', 'Strategy', 'Agile'],
        experience: '4+ years',
        benefits: ['Health Insurance', 'Hybrid Work', 'Equity']
      }
    ];

    // Simulate different jobs for different categories
    const categorySpecificJobs = mockJobs.map(job => ({
      ...job,
      id: job.id + (page - 1) * perPage,
      title: `${job.title} - ${category}`,
      category: category
    }));

    return {
      jobs: categorySpecificJobs,
      totalJobs: 150, // Mock total
      currentPage: page,
      totalPages: Math.ceil(150 / perPage),
      perPage: perPage,
      hasNext: page < Math.ceil(150 / perPage),
      hasPrevious: page > 1
    };
  }
}