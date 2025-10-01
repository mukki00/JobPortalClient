import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../models/job.model';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-list',
  imports: [CommonModule],
  templateUrl: './job-list.html',
  styleUrl: './job-list.css'
})
export class JobListComponent {
  @Input() jobs: Job[] = [];
  @Input() loading: boolean = false;
  @Output() jobUpdated = new EventEmitter<void>();

  private jobService = inject(JobService);
  private updatingJobs = new Set<number>();
  private rejectingJobs = new Set<number>();
  private expiringJobs = new Set<number>();

  getJobTypeClass(type: string): string {
    // Adjust class mapping for new JOB_TYPE values
    const typeClasses: { [key: string]: string } = {
      'Remote': 'job-type-remote',
      'On-site': 'job-type-onsite',
      'Hybrid': 'job-type-hybrid',
      'Recommended': 'job-type-recommended'
    };
    return typeClasses[type] || 'job-type-default';
  }

  openJobApplication(job: Job): void {
    if (job.JOB_LINK) {
      window.open(job.JOB_LINK, '_blank');
    }
  }

  toggleJobApplication(job: Job): void {
    if (this.updatingJobs.has(job.JOB_ID)) {
      return; // Prevent multiple clicks while updating
    }

    const newAppliedStatus = job.APPLIED === 'N';
    this.updatingJobs.add(job.JOB_ID);

    this.jobService.updateJobApplicationStatus(job.JOB_ID, newAppliedStatus).subscribe({
      next: (success) => {
        if (success) {
          // Update the job object locally
          job.APPLIED = newAppliedStatus ? 'Y' : 'N';
          // Emit event to notify parent component
          this.jobUpdated.emit();
        }
        this.updatingJobs.delete(job.JOB_ID);
      },
      error: (error) => {
        this.updatingJobs.delete(job.JOB_ID);
      }
    });
  }

  isUpdatingJob(jobId: number): boolean {
    return this.updatingJobs.has(jobId);
  }

  getAppliedButtonText(job: Job): string {
    if (this.isUpdatingJob(job.JOB_ID)) {
      return 'Updating...';
    }
    return job.APPLIED === 'Y' ? 'Applied' : 'Mark Applied';
  }

  getAppliedButtonClass(job: Job): string {
    const baseClass = 'applied-button';
    if (job.APPLIED === 'Y') {
      return `${baseClass} applied`;
    }
    return `${baseClass} not-applied`;
  }

  rejectJob(job: Job): void {
    if (this.rejectingJobs.has(job.JOB_ID)) {
      return; // Prevent multiple clicks while updating
    }

    this.rejectingJobs.add(job.JOB_ID);

    this.jobService.updateJobRejectedStatus(job.JOB_ID, true).subscribe({
      next: (success) => {
        if (success) {
          // Update the job object locally
          job.REJECTED = 'Y';
          // Emit event to notify parent component
          this.jobUpdated.emit();
        }
        this.rejectingJobs.delete(job.JOB_ID);
      },
      error: (error) => {
        this.rejectingJobs.delete(job.JOB_ID);
      }
    });
  }

  isRejectingJob(jobId: number): boolean {
    return this.rejectingJobs.has(jobId);
  }

  isJobRejected(job: Job): boolean {
    return job.REJECTED === 'Y';
  }

  expireJob(job: Job): void {
    if (this.expiringJobs.has(job.JOB_ID)) {
      return; // Prevent multiple clicks while updating
    }

    this.expiringJobs.add(job.JOB_ID);

    this.jobService.updateJobExpiredStatus(job.JOB_ID, true).subscribe({
      next: (success) => {
        if (success) {
          // Update the job object locally
          job.EXPIRED = 'Y';
          // Emit event to notify parent component
          this.jobUpdated.emit();
        }
        this.expiringJobs.delete(job.JOB_ID);
      },
      error: (error) => {
        this.expiringJobs.delete(job.JOB_ID);
      }
    });
  }

  isExpiringJob(jobId: number): boolean {
    return this.expiringJobs.has(jobId);
  }

  isJobExpired(job: Job): boolean {
    return job.EXPIRED === 'Y';
  }
}
