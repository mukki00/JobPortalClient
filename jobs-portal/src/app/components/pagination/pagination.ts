import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 50;
  @Input() disabled: boolean = false;
  
  @Output() pageChange = new EventEmitter<number>();
  
  visiblePages: number[] = [];
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPage'] || changes['totalPages']) {
      this.updateVisiblePages();
    }
  }
  
  updateVisiblePages() {
    const maxVisiblePages = 5;
    const pages: number[] = [];
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate which pages to show
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    this.visiblePages = pages;
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage && !this.disabled) {
      this.pageChange.emit(page);
    }
  }
  
  goToPrevious() {
    this.goToPage(this.currentPage - 1);
  }
  
  goToNext() {
    this.goToPage(this.currentPage + 1);
  }
  
  goToFirst() {
    this.goToPage(1);
  }
  
  goToLast() {
    this.goToPage(this.totalPages);
  }
  
  canGoPrevious(): boolean {
    return this.currentPage > 1 && !this.disabled;
  }
  
  canGoNext(): boolean {
    return this.currentPage < this.totalPages && !this.disabled;
  }
  
  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  
  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
