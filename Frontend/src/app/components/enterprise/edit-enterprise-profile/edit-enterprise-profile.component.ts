import { Component, ViewChildren, ViewChild, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-edit-enterprise-profile',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './edit-enterprise-profile.component.html',
  styleUrl: './edit-enterprise-profile.component.css'
})
export class EditEnterpriseProfileComponent {

  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
    @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
    createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  
    ngAfterViewInit() {
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
  
    modal(){
      const modal = document.getElementById('contactModal') as HTMLElement;
      modal.style.display = 'flex';
    }
  
    modalClose() {
      const modal = document.getElementById('contactModal') as HTMLElement;
      modal.style.display = 'none';
    }

}
