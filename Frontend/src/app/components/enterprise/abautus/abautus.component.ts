import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../home/nav/nav.component';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-abautus',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './abautus.component.html',
  styleUrls: ['./abautus.component.css']
})
export class AbautusComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  loading: boolean = false;
  aboutUsTitle: string = '';
  aboutUsParagraph1: string = '';
  aboutUsParagraph2: string = '';
  desc3Title: string = '';
  desc3Paragraph: string = '';

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();
    if (token) {
      this.companyService.obtenerEmpresa(token).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.processAboutUs(this.empresa.aboutUs);
          this.processDesc3(this.empresa.desc3);
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

  processAboutUs(aboutUs: string): void {
    if (aboutUs) {
      const parts = aboutUs.split('\n').filter(part => part.trim() !== '');
      this.aboutUsTitle = parts[0] || '';
      this.aboutUsParagraph1 = parts[1] || '';
      this.aboutUsParagraph2 = parts[2] || '';
    }
  }

  processDesc3(desc3: string): void {
    if (desc3) {
      const parts = desc3.split('\n').filter(part => part.trim() !== '');
      this.desc3Title = parts[0] || '';
      this.desc3Paragraph = parts[1] || '';
    }
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

  modal(){
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }
}