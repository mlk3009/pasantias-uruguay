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
  this.publicationService.searchPublications(payload).subscribe(publications => {
  });
}
}