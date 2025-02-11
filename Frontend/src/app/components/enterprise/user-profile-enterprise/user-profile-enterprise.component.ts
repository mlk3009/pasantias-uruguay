import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePublicationComponent } from './create-publication/create-publication.component';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-user-profile-enterprise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-enterprise.component.html',
  styleUrls: ['./user-profile-enterprise.component.css']
})
export class UserProfileEnterpriseComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  publicaciones: any[] = [];
  loading: boolean = false;

  desc1Title: string = '';
  desc1Paragraph1: string = '';
  desc1Paragraph2: string = '';
  desc2Title: string = '';
  desc2Paragraph1: string = '';
  desc2Paragraph2: string = '';
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
          this.processDesc1(this.empresa.desc1);
          this.processDesc2(this.empresa.desc2);
          this.processDesc3(this.empresa.desc3);
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
        this.publicaciones = response.data;
      },
      error: (error) => {
        console.error('Error al obtener las publicaciones:', error);
      }
    });
  }

  processDesc1(desc1: string): void {
    if (desc1) {
      const parts = desc1.split('\n').filter(part => part.trim() !== '');
      this.desc1Title = parts[0] || '';
      this.desc1Paragraph1 = parts[1] || '';
      this.desc1Paragraph2 = parts[2] || '';
    }
  }

  processDesc2(desc2: string): void {
    if (desc2) {
      const parts = desc2.split('\n').filter(part => part.trim() !== '');
      this.desc2Title = parts[0] || '';
      this.desc2Paragraph1 = parts[1] || '';
      this.desc2Paragraph2 = parts[2] || '';
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