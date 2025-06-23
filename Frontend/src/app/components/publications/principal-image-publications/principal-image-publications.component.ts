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
  // Elimina el campo location si es "Lugar" o vacío
  if (!params.location || params.location === 'Lugar') {
    delete params.location;
  }
  // Marca que es una búsqueda filtrada
  this.publicationService.setFiltered(true);
  this.publicationService.searchPublications(params).subscribe({
    next: (data) => {
      this.publicaciones = data;
      this.errorMsg = '';
      // Navega a /publications-in después de obtener los datos
      this.router.navigate(['/publications-in']);
    },
    error: (error: HttpErrorResponse | Error) => {
      this.publicaciones = [];
      this.errorMsg = error.message;
    }
  });
}
}
