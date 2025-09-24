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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }

  getJobTypeClass(type: string): string {
    const typeClasses: { [key: string]: string } = {
      'full-time': 'job-type-fulltime',
      'part-time': 'job-type-parttime',
      'contract': 'job-type-contract',
      'remote': 'job-type-remote',
      'hybrid': 'job-type-hybrid'
    };
    return typeClasses[type] || 'job-type-default';
  }

  openJobApplication(job: Job): void {
    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank');
    }
  }
}
