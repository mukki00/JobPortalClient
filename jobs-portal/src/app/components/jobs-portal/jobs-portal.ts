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
          console.error('Error loading jobs:', error);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
  
  refreshJobs() {
    this.loadJobs();
  }

  onJobUpdated() {
    console.log('Job update event received');
    console.log('Current jobs before categorization:', this.jobs.map(job => ({
      id: job.JOB_ID,
      applied: job.APPLIED,
      rejected: job.REJECTED,
      expired: job.EXPIRED
    })));
    
    // Re-categorize jobs after status update
    this.categorizeJobs();
    
    console.log('After categorization:', {
      available: this.availableJobs.length,
      applied: this.appliedJobs.length,
      expiredRejected: this.expiredRejectedJobs.length
    });
    
    this.updateDisplayedJobs();
    
    // Recalculate total counts after job status update
    this.countsCalculated = false;
    this.calculateTotalCounts();
    
    console.log('Job status updated');
    console.warn('Note: Job status updates are currently simulated. Backend API endpoints may not be implemented yet.');
  }

  private calculateTotalCounts() {
    // Show counts based on locally updated jobs (including simulated updates)
    const currentPageSize = this.jobs.length;
    const totalJobs = this.totalJobs;
    
    if (currentPageSize > 0 && totalJobs > 0) {
      // Count jobs based on current local state (including simulated updates)
      const availableCount = this.availableJobs.length;
      const appliedCount = this.appliedJobs.length;
      const expiredRejectedCount = this.expiredRejectedJobs.length;
      
      // For now, use actual counts from current page since API updates are local
      // In a real scenario, you'd estimate based on percentages across all pages
      this.totalAvailableJobs = totalJobs - appliedCount - expiredRejectedCount; // Estimate remaining available
      this.totalAppliedJobs = appliedCount; // Use actual applied count from current page
      this.totalExpiredRejectedJobs = expiredRejectedCount; // Use actual expired/rejected count
      
      this.countsCalculated = true;
      
      console.log('Total counts calculated from local state:', {
        available: this.totalAvailableJobs,
        applied: this.totalAppliedJobs,
        expiredRejected: this.totalExpiredRejectedJobs,
        totalJobs: totalJobs,
        localApplied: appliedCount,
        localExpiredRejected: expiredRejectedCount,
        note: 'Counts include locally applied jobs (simulated updates)'
      });
    }
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
    console.log(`Switching to ${tab} tab`);
    this.currentTab = tab;
    
    if (tab === 'applied' || tab === 'expired-rejected') {
      // Load all jobs for applied/expired-rejected tabs
      console.log(`Loading all ${tab} jobs from database`);
      this.loadJobsByStatus(tab);
    } else {
      // For available tab, use current page jobs
      console.log('Using current page jobs for available tab');
      this.updateDisplayedJobs();
    }
  }

  private loadJobsByStatus(status: 'applied' | 'expired-rejected') {
    // Since the backend API updates are not working yet (they're simulated),
    // we'll show jobs from the current page that match the status
    console.log(`Loading jobs by status: ${status} from current page`);
    console.log('Current job statuses:', this.jobs.map(job => ({
      id: job.JOB_ID,
      title: job.JOB_TITLE?.substring(0, 30),
      applied: job.APPLIED,
      rejected: job.REJECTED,
      expired: job.EXPIRED
    })));
    
    let filteredJobs: Job[] = [];
    
    if (status === 'applied') {
      filteredJobs = this.appliedJobs;
      console.log(`Applied jobs array:`, this.appliedJobs.map(job => ({
        id: job.JOB_ID,
        title: job.JOB_TITLE?.substring(0, 30),
        applied: job.APPLIED
      })));
      console.log(`Found ${filteredJobs.length} applied jobs from current page`);
    } else if (status === 'expired-rejected') {
      filteredJobs = this.expiredRejectedJobs;
      console.log(`Found ${filteredJobs.length} expired/rejected jobs from current page`);
    }
    
    this.displayedJobs = filteredJobs;
    
    if (filteredJobs.length === 0) {
      console.log(`No ${status} jobs found on current page.`);
    }
    
    this.cdr.detectChanges();
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
