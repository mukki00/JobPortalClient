import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-job-list',
  imports: [CommonModule],
  templateUrl: './job-list.html',
  styleUrl: './job-list.css'
})
export class JobListComponent {
  @Input() jobs: Job[] = [];
  @Input() loading: boolean = false;


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
}
