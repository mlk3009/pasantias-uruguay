import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { PublicationService } from '../../../services/publication.service';
import { UserService } from '../../../services/user.service';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
})
export class PublicationsListComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;

  publications: any[] = [];
  categoryPublications: { [key: string]: any[] } = {};
  data: any; // Asume que tienes una propiedad para almacenar los datos del usuario
  displayedPublications: any[] = [];

  constructor(
    private publicationService: PublicationService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('category') || undefined;
      this.getPublications(category);
    });

    const token = this.userService.getToken();
    if (token) {
      this.userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.data = response.data;
          // console.log(this.data);
          this.loadAdditionalPublications(this.data.id);
        },
        error: (error) => {
          console.error(error);
          this.loadAdditionalPublications(null);
        }
      });
    } else {
      this.loadAdditionalPublications(null);
    }
  }

  getPublications(category?: string, featured: boolean = true): void {
    this.publicationService.getPublications(category, featured).subscribe(
      (response) => {
        if (response && response.length > 0 && response[0].publications) {
          this.displayedPublications = response[0].publications;
          this.displayedPublications.forEach(publication => {
            publication.imageUrl = publication.image 
              ? `http://localhost:8000/images/uploads/${publication.image}` 
              : 'http://localhost:8000/images/defaultpub.jpg';
          });
        } else {
          this.displayedPublications = [];
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  loadAdditionalPublications(userId: number | null): void {
    if (userId) {
      this.userService.getUserEtiquetas(userId).pipe(
        switchMap(etiquetas => {
          const categories = etiquetas.map(etiqueta => etiqueta.name);
          if (categories.length < 3) {
            return this.getTopCategories(3 - categories.length).pipe(
              map(topCategories => categories.concat(topCategories))
            );
          }
          return [categories];
        }),
        switchMap(categories => {
          const requests = categories.map(category => this.publicationService.getPublications(category, true));
          return forkJoin(requests);
        })
      ).subscribe(
        responses => {
          responses.forEach((response, index) => {
            if (response && response.length > 0 && response[0].publications) {
              this.categoryPublications[`category${index + 1}`] = response[0].publications;
            }
          });
          // console.log(this.categoryPublications);
        },
        error => {
          console.error(error);
        }
      );
    } else {
      this.getTopCategories(3).pipe(
        switchMap(categories => {
          const requests = categories.map(category => this.publicationService.getPublications(category, true));
          return forkJoin(requests);
        })
      ).subscribe(
        responses => {
          responses.forEach((response, index) => {
            if (response && response.length > 0 && response[0].publications) {
              this.categoryPublications[`category${index + 1}`] = response[0].publications;
            }
          });
          // console.log(this.categoryPublications);
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  getTopCategories(limit: number): Observable<string[]> {
    return this.publicationService.getTopCategories(limit).pipe(
      map(response => response.map(category => category.name))
    );
  }

  onArrowLeftClick(event: MouseEvent) {
    // Encuentra el contenedor del carousel específico
    const carouselContainer = (event.target as HTMLElement).closest('.section1');
    if (!carouselContainer) return;

    // Selecciona solo el carousel dentro del contenedor específico
    const carousel = carouselContainer.querySelector('.carousel');
    const cardWidth = carouselContainer.querySelector('.card')?.clientWidth || 0;
    if (carousel) {
      carousel.scrollLeft -= cardWidth;
    }
  }

  onArrowRightClick(event: MouseEvent) {
    // Encuentra el contenedor del carousel específico
    const carouselContainer = (event.target as HTMLElement).closest('.section1');
    if (!carouselContainer) return;

    // Selecciona solo el carousel dentro del contenedor específico
    const carousel = carouselContainer.querySelector('.carousel');
    const cardWidth = carouselContainer.querySelector('.card')?.clientWidth || 0;
    if (carousel) {
      carousel.scrollLeft += cardWidth;
    }
  }
}