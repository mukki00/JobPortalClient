import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Job, JobsResponse } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000'; // Direct API calls - ensure CORS is enabled on backend
  
  // State management
  private currentPageSubject = new BehaviorSubject<number>(1);
  private currentCategorySubject = new BehaviorSubject<string>('Recommended');
  
  public currentPage$ = this.currentPageSubject.asObservable();
  public currentCategory$ = this.currentCategorySubject.asObservable();

  /**
   * Fetch jobs from the API with pagination and category filtering
   */
  getJobs(page: number = 1, perPage: number = 50, category: string = 'Recommended'): Observable<JobsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (category && category !== 'all') {
      params = params.set('job_category', category);
    }

    const url = `${this.baseUrl}/jobs`;
    
    return new Observable<JobsResponse>(observer => {
      this.http.get<any>(url, { params }).subscribe({
        next: (apiResponse) => {
          this.currentPageSubject.next(page);
          this.currentCategorySubject.next(category);
          
          // Transform API response to match JobsResponse interface
          const totalJobs = apiResponse.total || 0;
          const currentPage = apiResponse.page || page;
          const totalPages = Math.ceil(totalJobs / perPage);
          
          // Ensure all jobs have REJECTED and EXPIRED fields defaulting to "N"
          const jobsWithStatus = (apiResponse.jobs || []).map((job: any) => ({
            ...job,
            REJECTED: job.REJECTED || "N",
            EXPIRED: job.EXPIRED || "N"
          }));
          
          const transformedResponse: JobsResponse = {
            jobs: jobsWithStatus,
            totalJobs: totalJobs,
            currentPage: currentPage,
            totalPages: totalPages,
            perPage: apiResponse.per_page || perPage,
            hasNext: currentPage < totalPages,
            hasPrevious: currentPage > 1
          };
          
          observer.next(transformedResponse);
          observer.complete();
        },
        error: (error) => {
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
   * Update job application status
   */
  updateJobApplicationStatus(jobId: number, applied: boolean = true): Observable<boolean> {
    const url = `${this.baseUrl}/jobs/${jobId}/apply`;
    const body = { applied: applied ? 'Y' : 'N' };
    
    return new Observable<boolean>(observer => {
      this.http.put<any>(url, body).subscribe({
        next: (response) => {
          observer.next(true);
          observer.complete();
        },
        error: (error) => {
          // For demo purposes, simulate successful update even if API fails
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  /**
   * Update job rejected status
   */
  updateJobRejectedStatus(jobId: number, rejected: boolean = true): Observable<boolean> {
    const url = `${this.baseUrl}/jobs/${jobId}/reject`;
    const body = { rejected: rejected ? 'Y' : 'N' };
    
    return new Observable<boolean>(observer => {
      this.http.put<any>(url, body).subscribe({
        next: (response) => {
          observer.next(true);
          observer.complete();
        },
        error: (error) => {
          // For demo purposes, simulate successful update even if API fails
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  /**
   * Update job expired status
   */
  updateJobExpiredStatus(jobId: number, expired: boolean = true): Observable<boolean> {
    const url = `${this.baseUrl}/jobs/${jobId}/expire`;
    const body = { expired: expired ? 'Y' : 'N' };
    
    return new Observable<boolean>(observer => {
      this.http.put<any>(url, body).subscribe({
        next: (response) => {
          observer.next(true);
          observer.complete();
        },
        error: (error) => {
          // For demo purposes, simulate successful update even if API fails
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  /**
   * Get applied jobs from the database
   */
  getAppliedJobs(page: number = 1, perPage: number = 50, category: string = 'Recommended'): Observable<JobsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (category && category !== 'all') {
      params = params.set('job_category', category);
    }

    const url = `${this.baseUrl}/jobs/apply`;
    
    return new Observable<JobsResponse>(observer => {
      this.http.get<any>(url, { params }).subscribe({
        next: (apiResponse) => {
          // Transform API response to match JobsResponse interface
          const totalJobs = apiResponse.total || 0;
          const currentPage = apiResponse.page || page;
          const totalPages = Math.ceil(totalJobs / perPage);
          
          // Ensure all jobs have status fields
          const jobsWithStatus = (apiResponse.jobs || []).map((job: any) => ({
            ...job,
            APPLIED: job.APPLIED || "Y", // These should already be Y since they're from applied endpoint
            REJECTED: job.REJECTED || "N",
            EXPIRED: job.EXPIRED || "N"
          }));
          
          const transformedResponse: JobsResponse = {
            jobs: jobsWithStatus,
            totalJobs: totalJobs,
            currentPage: currentPage,
            totalPages: totalPages,
            perPage: apiResponse.per_page || perPage,
            hasNext: currentPage < totalPages,
            hasPrevious: currentPage > 1
          };
          
          observer.next(transformedResponse);
          observer.complete();
        },
        error: (error) => {
          // Return empty response on error
          const emptyResponse: JobsResponse = {
            jobs: [],
            totalJobs: 0,
            currentPage: page,
            totalPages: 0,
            perPage: perPage,
            hasNext: false,
            hasPrevious: false
          };
          observer.next(emptyResponse);
          observer.complete();
        }
      });
    });
  }

  /**
   * Get rejected and expired jobs from the database
   */
  getRejectedExpiredJobs(page: number = 1, perPage: number = 50, category: string = 'Recommended'): Observable<JobsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (category && category !== 'all') {
      params = params.set('job_category', category);
    }

    const url = `${this.baseUrl}/jobs/rejected-expired`;
    
    return new Observable<JobsResponse>(observer => {
      this.http.get<any>(url, { params }).subscribe({
        next: (apiResponse) => {
          // Transform API response to match JobsResponse interface
          const totalJobs = apiResponse.total || 0;
          const currentPage = apiResponse.page || page;
          const totalPages = Math.ceil(totalJobs / perPage);
          
          // Ensure all jobs have status fields
          const jobsWithStatus = (apiResponse.jobs || []).map((job: any) => ({
            ...job,
            APPLIED: job.APPLIED || "N",
            REJECTED: job.REJECTED || "Y", // These should be Y or N based on what's in DB
            EXPIRED: job.EXPIRED || "Y" // These should be Y or N based on what's in DB
          }));
          
          const transformedResponse: JobsResponse = {
            jobs: jobsWithStatus,
            totalJobs: totalJobs,
            currentPage: currentPage,
            totalPages: totalPages,
            perPage: apiResponse.per_page || perPage,
            hasNext: currentPage < totalPages,
            hasPrevious: currentPage > 1
          };
          
          observer.next(transformedResponse);
          observer.complete();
        },
        error: (error) => {
          // Return empty response on error
          const emptyResponse: JobsResponse = {
            jobs: [],
            totalJobs: 0,
            currentPage: page,
            totalPages: 0,
            perPage: perPage,
            hasNext: false,
            hasPrevious: false
          };
          observer.next(emptyResponse);
          observer.complete();
        }
      });
    });
  }

  /**
   * Mock data for development/demo purposes
   */
  private getMockJobsResponse(page: number, perPage: number, category: string): JobsResponse {
    const mockJobs: Job[] = [
      {
        APPLIED: "N",
        COMPANY: "Jonas Software",
        COMPANY_LOCATION: "Colombo, Western Province, Sri Lanka",
        JOB_CATEGORY: category,
        JOB_ID: 4010384565,
        JOB_LINK: "https://www.linkedin.com/jobs/view/4010384565/",
        JOB_SOURCE: "LinkedIn",
        JOB_TITLE: "Senior QA Automation Engineer",
        JOB_TYPE: "On-site",
        LINKEDIN_VERIFIED: "Y",
        REJECTED: "N",
        EXPIRED: "N"
      },
      {
        APPLIED: "N",
        COMPANY: "Appetiser Apps",
        COMPANY_LOCATION: "Sri Lanka",
        JOB_CATEGORY: category,
        JOB_ID: 4061065976,
        JOB_LINK: "https://www.linkedin.com/jobs/view/4061065976/",
        JOB_SOURCE: "LinkedIn",
        JOB_TITLE: "Full-Stack Developer (Laravel & VueJS)",
        JOB_TYPE: "Remote",
        LINKEDIN_VERIFIED: "Y",
        REJECTED: "N",
        EXPIRED: "N"
      },
      {
        APPLIED: "N",
        COMPANY: "Riskonnect, Inc.",
        COMPANY_LOCATION: "Colombo, Western Province, Sri Lanka",
        JOB_CATEGORY: category,
        JOB_ID: 4085645634,
        JOB_LINK: "https://www.linkedin.com/jobs/view/4085645634/",
        JOB_SOURCE: "LinkedIn",
        JOB_TITLE: "Senior Software Engineer - .Net + Angular",
        JOB_TYPE: "Remote",
        LINKEDIN_VERIFIED: "Y",
        REJECTED: "N",
        EXPIRED: "N"
      },
      {
        APPLIED: "N",
        COMPANY: "TechCorp Solutions",
        COMPANY_LOCATION: "Kandy, Central Province, Sri Lanka",
        JOB_CATEGORY: category,
        JOB_ID: 4000000001,
        JOB_LINK: "https://www.linkedin.com/jobs/view/4000000001/",
        JOB_SOURCE: "LinkedIn",
        JOB_TITLE: "React Frontend Developer",
        JOB_TYPE: "Hybrid",
        LINKEDIN_VERIFIED: "Y",
        REJECTED: "N",
        EXPIRED: "N"
      },
      {
        APPLIED: "Y",
        COMPANY: "CloudTech Industries",
        COMPANY_LOCATION: "Galle, Southern Province, Sri Lanka",
        JOB_CATEGORY: category,
        JOB_ID: 4000000002,
        JOB_LINK: "https://www.linkedin.com/jobs/view/4000000002/",
        JOB_SOURCE: "LinkedIn",
        JOB_TITLE: "DevOps Engineer",
        JOB_TYPE: "Remote",
        LINKEDIN_VERIFIED: "N",
        REJECTED: "N",
        EXPIRED: "N"
      }
    ];

    // Simulate different jobs for different categories
    const categorySpecificJobs = mockJobs.map((job, index) => ({
      ...job,
      JOB_ID: job.JOB_ID + (page - 1) * perPage + index,
      JOB_CATEGORY: category,
      JOB_TITLE: `${job.JOB_TITLE} - ${category}`
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