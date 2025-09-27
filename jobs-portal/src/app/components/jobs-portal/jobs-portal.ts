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
          this.updateDisplayedJobs();
          this.totalJobs = response.totalJobs;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.loading = false;
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
    // Update displayed jobs to filter out rejected ones
    this.updateDisplayedJobs();
    console.log('Job status updated');
  }

  private updateDisplayedJobs() {
    // Filter out rejected and expired jobs
    this.displayedJobs = this.jobs.filter(job => job.REJECTED !== 'Y' && job.EXPIRED !== 'Y');
  }
}
