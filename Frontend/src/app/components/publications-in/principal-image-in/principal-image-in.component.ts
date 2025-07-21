import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../../services/publication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';



@Component({
  selector: 'app-principal-image-in',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './principal-image-in.component.html',
  styleUrls: ['./principal-image-in.component.css']
})
export class PrincipalImageInComponent {
  @Input() category: string | undefined;

    publicaciones: any[] = [];
  errorMsg: string = '';
  isDropdownOpen = false;

  pago: number = 100;
  selectedLugar: string = 'Lugar';
  etiqueta: string = '';
  departamentos: string[] = [
    'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida',
    'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera',
    'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
  ];

  constructor(private router: Router, private publicationService: PublicationService, private location: Location) {
    initFlowbite();
    const path = this.location.path();
    this.etiqueta = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLugar(dep: string) {
    this.selectedLugar = dep;
    this.isDropdownOpen = false;
  }

buscarPublicaciones(params: any) {
  const payload = { ...params };
  if (!payload.location || payload.location === 'Lugar') {
    delete payload.location;
  }
  this.publicationService.setFiltered(true);
  this.publicationService.searchPublications(payload).subscribe({
    next: (result: any[] = []) => {
      if (!result || result.length === 0) {
        this.showAlertCustom('No se encontraron resultados');
        return;
      }
      setTimeout(() => {
        const el = document.getElementById('top');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    },
    error: (error: HttpErrorResponse | Error) => {
      if (error && error.message && error.message.includes('No se encontraron publicaciones')) {
        this.showAlertCustom('No se encontraron resultados');
      }
    }
  });
}

showAlertCustom(message: string): void {
  const modal = document.getElementById('alert-container-custom') as HTMLElement;
  const msgSpan = document.getElementById('alert-custom-message') as HTMLElement;
  if (modal && msgSpan) {
    msgSpan.textContent = message;
    modal.style.display = 'flex';
    modal.classList.add('fade-in');
    setTimeout(() => {
      modal.classList.remove('fade-in');
      modal.classList.add('fade-out');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('fade-out');
      }, 500);
    }, 2000);
  }
}
}