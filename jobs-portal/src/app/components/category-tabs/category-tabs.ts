import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCategory, JOB_CATEGORIES } from '../../models/job.model';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-category-tabs',
  imports: [CommonModule],
  templateUrl: './category-tabs.html',
  styleUrl: './category-tabs.css'
})
export class CategoryTabsComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<string>();
  
  private jobService = inject(JobService);
  
  categories: JobCategory[] = JOB_CATEGORIES;
  activeCategory: string = 'Recommended';
  
  ngOnInit() {
    // Subscribe to current category from service
    this.jobService.currentCategory$.subscribe(category => {
      this.activeCategory = category;
    });
  }
  
  selectCategory(categoryKey: string) {
    this.activeCategory = categoryKey;
    this.jobService.setCurrentCategory(categoryKey);
    this.categorySelected.emit(categoryKey);
  }
  
  isActive(categoryKey: string): boolean {
    return this.activeCategory === categoryKey;
  }
}
