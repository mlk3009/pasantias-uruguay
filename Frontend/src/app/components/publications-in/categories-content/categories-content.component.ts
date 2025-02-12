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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publications']) {
      this.currentPage = 1; // Resetear a la primera página cuando cambien las publicaciones
      this.updateDisplayedPublications();
    }
  }

  updateDisplayedPublications(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPublications = this.publications.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if ((this.currentPage * this.itemsPerPage) < this.publications.length) {
      this.currentPage++;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); // Desplazarse al elemento con id "top"
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); // Desplazarse al elemento con id "top"
    }
  }
}