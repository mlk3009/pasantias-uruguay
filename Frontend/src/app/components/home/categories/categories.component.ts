import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // No necesitamos cargar categorías ya que están hardcodeadas en el HTML
  }

  navigateToCategory(categoryName: string): void {
    this.router.navigate(['/publications-in', categoryName]);
  }
}
