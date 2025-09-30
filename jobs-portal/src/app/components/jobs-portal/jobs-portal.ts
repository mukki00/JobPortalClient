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
    // Re-categorize jobs after status update
    this.categorizeJobs();
    this.updateDisplayedJobs();
    
    // Recalculate total counts after job status update
    this.countsCalculated = false;
    this.calculateTotalCounts();
    
    console.log('Job status updated');
  }

  private calculateTotalCounts() {
    // Use statistical estimation based on current page jobs
    const currentPageSize = this.jobs.length;
    const totalJobs = this.totalJobs;
    
    if (currentPageSize > 0 && totalJobs > 0) {
      // Calculate percentages from current page
      const availableCount = this.availableJobs.length;
      const appliedCount = this.appliedJobs.length;
      const expiredRejectedCount = this.expiredRejectedJobs.length;
      
      const availablePercentage = availableCount / currentPageSize;
      const appliedPercentage = appliedCount / currentPageSize;
      const expiredRejectedPercentage = expiredRejectedCount / currentPageSize;
      
      // Apply percentages to total job count
      this.totalAvailableJobs = Math.round(totalJobs * availablePercentage);
      this.totalAppliedJobs = Math.round(totalJobs * appliedPercentage);
      this.totalExpiredRejectedJobs = Math.round(totalJobs * expiredRejectedPercentage);
      
      this.countsCalculated = true;
      
      console.log('Total counts calculated:', {
        available: this.totalAvailableJobs,
        applied: this.totalAppliedJobs,
        expiredRejected: this.totalExpiredRejectedJobs,
        totalJobs: totalJobs,
        basedOnPage: this.currentPage
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
    this.currentTab = tab;
    this.updateDisplayedJobs();
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
