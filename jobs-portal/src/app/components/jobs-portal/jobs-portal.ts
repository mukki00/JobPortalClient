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
          this.loading = false;
          
          // Calculate total counts only once per category
          if (!this.countsCalculated) {
            this.calculateTotalCounts();
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
    // Get accurate applied job count from database
    this.jobService.getAppliedJobs(1, 1000, this.currentCategory)
      .subscribe({
        next: (response: JobsResponse) => {
          const databaseAppliedCount = response.totalJobs || response.jobs.length;
          const localAppliedCount = this.appliedJobs.length;
          const localExpiredRejectedCount = this.expiredRejectedJobs.length;
          
          // Calculate total applied jobs (database + local, avoiding duplicates)
          const localAppliedIds = this.appliedJobs.map(job => job.JOB_ID);
          const databaseAppliedIds = response.jobs.map(job => job.JOB_ID);
          const uniqueLocalApplied = localAppliedIds.filter(id => !databaseAppliedIds.includes(id));
          
          this.totalAppliedJobs = databaseAppliedCount + uniqueLocalApplied.length;
          this.totalExpiredRejectedJobs = localExpiredRejectedCount;
          this.totalAvailableJobs = this.totalJobs - this.totalAppliedJobs - this.totalExpiredRejectedJobs;
          
          this.countsCalculated = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          // Fallback to local counts only
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
      this.jobService.getAppliedJobs(1, 100, this.currentCategory)
        .subscribe({
          next: (response: JobsResponse) => {
            const databaseAppliedJobs = response.jobs;
            
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
      // For now, show local expired/rejected jobs
      this.displayedJobs = this.expiredRejectedJobs;
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getTabCount(tab: 'available' | 'applied' | 'expired-rejected'): number {
    // Use calculated total counts if available, otherwise fall back to current page counts
    if (this.countsCalculated) {
      switch (tab) {
        case 'available':
          return this.totalAvailableJobs;
        case 'applied':
          return this.totalAppliedJobs;
        case 'expired-rejected':
          return this.totalExpiredRejectedJobs;
        default:
          return 0;
      }
    } else {
      // Fallback to current page counts while calculating
      switch (tab) {
        case 'available':
          return this.availableJobs.length;
        case 'applied':
          return this.appliedJobs.length;
        case 'expired-rejected':
          return this.expiredRejectedJobs.length;
        default:
          return 0;
      }
    }
  }
}
