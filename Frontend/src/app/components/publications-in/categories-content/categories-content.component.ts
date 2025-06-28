import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-content.component.html',
  styleUrls: ['./categories-content.component.css']
})
export class CategoriesContentComponent implements OnChanges {
  @Input() publications: any[] = [];
  @Input() category: string | undefined;
  displayedPublications: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 18;
  totalPages: number = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publications']) {
      this.currentPage = 1; 
      this.updateDisplayedPublications();
    }
  }

  updateDisplayedPublications(): void {
    this.totalPages = Math.ceil(this.publications.length / this.itemsPerPage) || 1;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPublications = this.publications.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getPages(): number[] {
    if (this.totalPages <= 6) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else if (this.currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    } else if (this.currentPage >= this.totalPages - 3) {
      return [this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1];
    } else {
      return [this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2];
    }
  }
}