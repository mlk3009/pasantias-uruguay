import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';
import { CompanyService } from '../../../services/company.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-publications',
  standalone: true,
  imports: [NavComponent, CommonModule],
  templateUrl: './my-publications.component.html',
  styleUrls: ['./my-publications.component.css']
})
export class MyPublicationsComponent implements OnInit, OnChanges {

  publicaciones: any[] = [];
  empresa: any;
  loading: boolean = false;
  displayedPublications: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 18;
  isPhoneAccess: boolean = false; // Variable para determinar si se accedió mediante phone

  constructor(private companyService: CompanyService, private route: ActivatedRoute) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publications']) {
      this.currentPage = 1; // Resetear a la primera página cuando cambien las publicaciones
      this.updateDisplayedPublications();
    }
  }

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();
    const phone = this.route.snapshot.paramMap.get('phone');

    if (phone && /^\d{8,9}$/.test(phone)) {
      // Si hay un número en la URL, usarlo como parámetro
      this.isPhoneAccess = true;
      this.companyService.obtenerEmpresaByPhone(phone).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.obtenerPublicaciones(this.empresa.phone);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener la empresa por teléfono:', error);
          this.loading = false;
        }
      });
    } else if (token) {
      // Si no hay un número en la URL, usar el token para obtener la empresa
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
    this.companyService.obtenerPublicaciones(empresaId, undefined, undefined).subscribe({
      next: (response) => {
        this.publicaciones = response.data;
        this.updateDisplayedPublications(); // Actualizar las publicaciones mostradas
      },
      error: (error) => {
        console.error('Error al obtener las publicaciones:', error);
      }
    });
  }

  modalDelete() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalModificar() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalModificarClose() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'none';
  }

  imgModificar() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalImgClose() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalAnadir() {
    const modal = document.getElementById('añadirModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalAnadirClose() {
    const modal = document.getElementById('añadirModal') as HTMLElement;
    modal.style.display = 'none';
  }

  updateDisplayedPublications(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPublications = this.publicaciones.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if ((this.currentPage * this.itemsPerPage) < this.publicaciones.length) {
      this.currentPage++;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); // Desplazarse al elemento con id "top"
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); // Desplazarse al elemento con id "top"
    }
  }
}