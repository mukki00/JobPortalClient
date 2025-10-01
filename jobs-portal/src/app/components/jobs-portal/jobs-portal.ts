import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { Job, JobsResponse } from '../../models/job.model';
import { CategoryTabsComponent } from '../category-tabs/category-tabs';
import { JobListComponent } from '../job-list/job-list';
import { PaginationComponent } from '../pagination/pagination';

@Component({
  selector: 'app-jobs-portal',
  imports: [
    CommonModule,
    CategoryTabsComponent,
    JobListComponent,
    PaginationComponent
  ],
  templateUrl: './jobs-portal.html',
  styleUrl: './jobs-portal.css'
})
export class JobsPortalComponent implements OnInit {
  private jobService = inject(JobService);
  private cdr = inject(ChangeDetectorRef);
  
  jobs: Job[] = [];
  displayedJobs: Job[] = [];
  loading: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  totalJobs: number = 0;
  currentCategory: string = 'Recommended';
  itemsPerPage: number = 50;
  
  // Tab management
  currentTab: 'available' | 'applied' | 'expired-rejected' = 'available';
  availableJobs: Job[] = [];
  appliedJobs: Job[] = [];
  expiredRejectedJobs: Job[] = [];
  
  // Cache total counts to avoid recalculating
  totalAvailableJobs: number = 0;
  totalAppliedJobs: number = 0;
  totalExpiredRejectedJobs: number = 0;
  countsCalculated: boolean = false;
  
  // Store actual total counts from API responses for banner display
  apiTotalAvailableJobs: number = 0;
  apiTotalAppliedJobs: number = 0;
  apiTotalExpiredRejectedJobs: number = 0;
  
  ngOnInit() {
    this.jobService.currentPage$.subscribe(page => {
      this.currentPage = page;
    });
    
    this.jobService.currentCategory$.subscribe(category => {
      this.currentCategory = category;
    });
    
    // Load initial jobs
    this.loadJobs();
  }
  
  onCategorySelected(category: string) {
    this.currentCategory = category;
    this.currentPage = 1; // Reset to first page when changing category
    
    // Reset total counts for new category
    this.countsCalculated = false;
    
    // Reset API totals for new category to prevent showing old category counts
    this.apiTotalAvailableJobs = 0;
    this.apiTotalAppliedJobs = 0;
    this.apiTotalExpiredRejectedJobs = 0;
    
    this.jobService.setCurrentCategory(category);
    this.jobService.setCurrentPage(1);
    this.loadJobs();
  }
  
  onPageChanged(page: number) {
    this.currentPage = page;
    this.jobService.setCurrentPage(page);
    this.loadJobs();
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  private loadJobs() {
    this.loading = true;
    
    this.jobService.getJobs(this.currentPage, this.itemsPerPage, this.currentCategory)
      .subscribe({
        next: (response: JobsResponse) => {
          this.jobs = response.jobs;
          this.categorizeJobs();
          this.updateDisplayedJobs();
          this.totalJobs = response.totalJobs;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          
          // Store the API total for available jobs banner
          this.apiTotalAvailableJobs = response.totalJobs;
          
          this.loading = false;
          
          // Calculate total counts only once per category
          if (!this.countsCalculated) {
            this.calculateTotalCounts();
          }
          
          // If currently on applied or expired-rejected tab, reload that tab's data
          if (this.currentTab === 'applied' || this.currentTab === 'expired-rejected') {
            this.loadJobsByStatus(this.currentTab);
          }
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
  
  refreshJobs() {
    this.loadJobs();
  }

  onJobUpdated() {
    // Re-categorize jobs after status update
    this.categorizeJobs();
    this.updateDisplayedJobs();
    
    // Recalculate total counts after job status update
    this.countsCalculated = false;
    this.calculateTotalCounts();
  }

  private calculateTotalCounts() {
    // Get accurate counts from both applied and rejected/expired database endpoints
    const appliedRequest = this.jobService.getAppliedJobs(1, 50, this.currentCategory);
    const rejectedExpiredRequest = this.jobService.getRejectedExpiredJobs(1, 50, this.currentCategory);
    
    // Wait for both requests to complete
    appliedRequest.subscribe({
      next: (appliedResponse: JobsResponse) => {
        const databaseAppliedCount = appliedResponse.totalJobs || appliedResponse.jobs.length;
        const localAppliedCount = this.appliedJobs.length;
        
        // Store the API total for applied jobs tab display
        this.apiTotalAppliedJobs = appliedResponse.totalJobs || 0;
        
        // Calculate unique local applied jobs
        const localAppliedIds = this.appliedJobs.map(job => job.JOB_ID);
        const databaseAppliedIds = appliedResponse.jobs.map(job => job.JOB_ID);
        const uniqueLocalApplied = localAppliedIds.filter(id => !databaseAppliedIds.includes(id));
        
        this.totalAppliedJobs = databaseAppliedCount + uniqueLocalApplied.length;
        
        // Now get rejected/expired counts
        rejectedExpiredRequest.subscribe({
          next: (rejectedResponse: JobsResponse) => {
            const databaseRejectedExpiredCount = rejectedResponse.totalJobs || rejectedResponse.jobs.length;
            const localRejectedExpiredCount = this.expiredRejectedJobs.length;
            
            // Store the API total for expired/rejected jobs tab display
            this.apiTotalExpiredRejectedJobs = rejectedResponse.totalJobs || 0;
            
            // Calculate unique local rejected/expired jobs
            const localRejectedExpiredIds = this.expiredRejectedJobs.map(job => job.JOB_ID);
            const databaseRejectedExpiredIds = rejectedResponse.jobs.map(job => job.JOB_ID);
            const uniqueLocalRejectedExpired = localRejectedExpiredIds.filter(id => !databaseRejectedExpiredIds.includes(id));
            
            this.totalExpiredRejectedJobs = databaseRejectedExpiredCount + uniqueLocalRejectedExpired.length;
            this.totalAvailableJobs = this.totalJobs - this.totalAppliedJobs - this.totalExpiredRejectedJobs;
            
            this.countsCalculated = true;
            this.cdr.detectChanges();
          },
          error: (error) => {
            // Use local count for rejected/expired if database call fails
            this.totalExpiredRejectedJobs = this.expiredRejectedJobs.length;
            this.totalAvailableJobs = this.totalJobs - this.totalAppliedJobs - this.totalExpiredRejectedJobs;
            
            this.countsCalculated = true;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        // Fallback to local counts only for both
        const availableCount = this.availableJobs.length;
        const appliedCount = this.appliedJobs.length;
        const expiredRejectedCount = this.expiredRejectedJobs.length;
        
        this.totalAvailableJobs = this.totalJobs - appliedCount - expiredRejectedCount;
        this.totalAppliedJobs = appliedCount;
        this.totalExpiredRejectedJobs = expiredRejectedCount;
        this.countsCalculated = true;
        this.cdr.detectChanges();
      }
    });
  }

  private categorizeJobs() {
    // Categorize jobs into different tabs
    this.availableJobs = this.jobs.filter(job => 
      job.APPLIED !== 'Y' && job.REJECTED !== 'Y' && job.EXPIRED !== 'Y'
    );
    
    this.appliedJobs = this.jobs.filter(job => job.APPLIED === 'Y');
    
    this.expiredRejectedJobs = this.jobs.filter(job => 
      job.REJECTED === 'Y' || job.EXPIRED === 'Y'
    );
  }

  private updateDisplayedJobs() {
    // Update displayed jobs based on current tab
    switch (this.currentTab) {
      case 'available':
        this.displayedJobs = this.availableJobs;
        break;
      case 'applied':
        this.displayedJobs = this.appliedJobs;
        break;
      case 'expired-rejected':
        this.displayedJobs = this.expiredRejectedJobs;
        break;
      default:
        this.displayedJobs = this.availableJobs;
    }
  }

  switchTab(tab: 'available' | 'applied' | 'expired-rejected') {
    this.currentTab = tab;
    
    if (tab === 'applied' || tab === 'expired-rejected') {
      // Load all jobs for applied/expired-rejected tabs
      this.loadJobsByStatus(tab);
    } else {
      // For available tab, use current page jobs
      this.updateDisplayedJobs();
    }
  }

  private loadJobsByStatus(status: 'applied' | 'expired-rejected') {
    this.loading = true;
    
    if (status === 'applied') {
      // Load applied jobs from database AND include locally applied jobs
      this.jobService.getAppliedJobs(1, 50, this.currentCategory)
        .subscribe({
          next: (response: JobsResponse) => {
            const databaseAppliedJobs = response.jobs;
            
            // Store the API total for applied jobs banner
            this.apiTotalAppliedJobs = response.totalJobs || 0;
            
            // Get locally applied jobs from current page
            const locallyAppliedJobs = this.appliedJobs;
            
            // Combine database and local applied jobs, avoiding duplicates
            const allAppliedJobs = [...databaseAppliedJobs];
            
            // Add locally applied jobs that aren't already in database results
            locallyAppliedJobs.forEach(localJob => {
              const existsInDatabase = databaseAppliedJobs.some(dbJob => dbJob.JOB_ID === localJob.JOB_ID);
              if (!existsInDatabase) {
                allAppliedJobs.push(localJob);
              }
            });
            
            this.displayedJobs = allAppliedJobs;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            // Fallback to locally applied jobs only
            this.displayedJobs = this.appliedJobs;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else if (status === 'expired-rejected') {
      // Load rejected/expired jobs from database AND include locally rejected/expired jobs
      this.jobService.getRejectedExpiredJobs(1, 50, this.currentCategory)
        .subscribe({
          next: (response: JobsResponse) => {
            const databaseRejectedExpiredJobs = response.jobs;
            
            // Store the API total for expired/rejected jobs banner
            this.apiTotalExpiredRejectedJobs = response.totalJobs || 0;
            
            // Get locally rejected/expired jobs from current page
            const locallyRejectedExpiredJobs = this.expiredRejectedJobs;
            
            // Combine database and local rejected/expired jobs, avoiding duplicates
            const allRejectedExpiredJobs = [...databaseRejectedExpiredJobs];
            
            // Add locally rejected/expired jobs that aren't already in database results
            locallyRejectedExpiredJobs.forEach(localJob => {
              const existsInDatabase = databaseRejectedExpiredJobs.some(dbJob => dbJob.JOB_ID === localJob.JOB_ID);
              if (!existsInDatabase) {
                allRejectedExpiredJobs.push(localJob);
              }
            });
            
            this.displayedJobs = allRejectedExpiredJobs;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            // Fallback to locally rejected/expired jobs only
            this.displayedJobs = this.expiredRejectedJobs;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  getTabCount(tab: 'available' | 'applied' | 'expired-rejected'): number {
    // Use API response totals for tab counts to match banner display
    switch (tab) {
      case 'available':
        return this.apiTotalAvailableJobs || this.availableJobs.length;
      case 'applied':
        return this.apiTotalAppliedJobs || this.appliedJobs.length;
      case 'expired-rejected':
        return this.apiTotalExpiredRejectedJobs || this.expiredRejectedJobs.length;
      default:
        return 0;
    }
  }

  getBannerCount(): number {
    // Return the actual API total count for the current tab's banner
    switch (this.currentTab) {
      case 'available':
        return this.apiTotalAvailableJobs;
      case 'applied':
        return this.apiTotalAppliedJobs;
      case 'expired-rejected':
        return this.apiTotalExpiredRejectedJobs;
      default:
        return 0;
    }
  }
}
