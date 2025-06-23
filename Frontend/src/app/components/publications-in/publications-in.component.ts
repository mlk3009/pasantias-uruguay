import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { initFlowbite } from 'flowbite';

import { NavComponent } from '../home/nav/nav.component';
import { PrincipalImageInComponent } from './principal-image-in/principal-image-in.component';
import { CategoriesContentComponent } from './categories-content/categories-content.component';
import { FooterComponent } from '../home/footer/footer.component';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'app-publications-in',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PrincipalImageInComponent, CategoriesContentComponent, FooterComponent, NavComponent],
  templateUrl: './publications-in.component.html',
  styleUrl: './publications-in.component.css'
})
export class PublicationsInComponent implements OnInit {
  publications: any[] = [];
  category: string | undefined = undefined;

  constructor(
    private publicationService: PublicationService,
    private route: ActivatedRoute
  ) {

    this.publicationService.publications$.subscribe(data => {
    this.publications = data;
  });
  }

ngOnInit(): void {
  this.publicationService.publications$.subscribe(data => {
    this.publications = data;
  });

  if (!this.publicationService.isFiltered()) {
    this.getPublications(this.category);
  } else {
    this.publicationService.setFiltered(false);
  }
}

  buscarPublicaciones(params: any) {
  const payload = { ...params };
  if (!payload.location || payload.location === 'Lugar') {
    delete payload.location;
  }
  if (this.category) {
    payload.category = this.category;
  }
  this.publicationService.searchPublications(payload).subscribe();
  // El subscribe en el padre actualizará las tarjetas automáticamente
}

  getPublications(category?: string, featured: boolean = false): void {
    this.publicationService.getPublications(category, featured).subscribe(
      (response) => {
        if (response && response.length > 0 && response[0].publications) {
          this.publications = response[0].publications;
        } else {
          this.publications = [];
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
}