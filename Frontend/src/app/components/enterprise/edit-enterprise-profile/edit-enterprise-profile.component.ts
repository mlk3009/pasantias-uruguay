import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavComponent } from '../../home/nav/nav.component';

import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../../services/company.service';


@Component({
  selector: 'app-edit-enterprise-profile',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './edit-enterprise-profile.component.html',
  styleUrls: ['./edit-enterprise-profile.component.css']
})
export class EditEnterpriseProfileComponent implements OnInit {

  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  publications: any[] = [];
  loading: boolean = false;

  constructor(
    private companyService: CompanyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();

    if (token) {
      this.companyService.obtenerEmpresa(token).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.obtenerPublicaciones(this.empresa.id);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener la empresa:', error);
          this.loading = false;
        }
      });
    } else {
      console.error('Token no encontrado');
      this.loading = false;
    }
  }

  obtenerPublicaciones(empresaId: string): void {
    this.companyService.obtenerPublicaciones(empresaId, undefined, 9).subscribe({
      next: (response) => {
        this.publications = response.data;
      },
      error: (error) => {
        console.error('Error al obtener las publicaciones:', error);
      }
    });
  }

  ngAfterViewInit() {}

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