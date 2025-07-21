import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { PublicationService } from '../../../services/publication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <-- ¡Agrega esto!


@Component({
  selector: 'app-principal-image-publications',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './principal-image-publications.component.html',
  styleUrl: './principal-image-publications.component.css'
})
export class PrincipalImagePublicationsComponent {
  publicaciones: any[] = [];
  errorMsg: string = '';
  isDropdownOpen = false;
  constructor(private router: Router, private publicationService: PublicationService) {
    initFlowbite();
    
  }


pago: number = 100;

actualizarPago(event: Event) {
  const input = event.target as HTMLInputElement;
  this.pago = Number(input.value);
}

selectedLugar: string = 'Lugar';
departamentos: string[] = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida',
  'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera',
  'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
];

toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
}

selectLugar(dep: string) {
  this.selectedLugar = dep;
  this.isDropdownOpen = false;
}

buscarPublicaciones(params: any) {
  if (!params.location || params.location === 'Lugar') {
    delete params.location;
  }
  this.publicationService.setFiltered(true);
  this.publicationService.searchPublications(params).subscribe({
    next: (data: any[] = []) => {
      this.publicaciones = data;
      this.errorMsg = '';
      if (!data || data.length === 0) {
        this.showAlertCustom('No se encontraron resultados');
        return;
      }
      this.router.navigate(['/publications-in']).then(() => {
        setTimeout(() => {
          const el = document.getElementById('top');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      });
    },
    error: (error: HttpErrorResponse | Error) => {
      this.publicaciones = [];
      this.errorMsg = error.message;
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
