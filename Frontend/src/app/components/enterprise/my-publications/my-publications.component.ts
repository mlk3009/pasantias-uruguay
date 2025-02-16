import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';
import { CompanyService } from '../../../services/company.service';
import { PublicationService } from '../../../services/publication.service'; // Importar el servicio
import { UserService } from '../../../services/user.service'; // Importar el servicio de usuario
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-publications',
  standalone: true,
  imports: [NavComponent, CommonModule, HttpClientModule, FormsModule],
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
  isPhoneAccess: boolean = false;
  userImageUrl: string = '';
  saldos: any[] = []; // Nueva variable para almacenar los saldos

  newPublication: any = {
    title: '',
    description: '',
    description2: '',
    description3: '',
    salary: null,
    location: '',
    type: '',
    time: '',
    vacancies: null,
    empresa_id: null,
    saldo_id: null,
    id_image: []
  };

  startDate: string = '';
  endDate: string = '';

  constructor(
    private companyService: CompanyService,
    private publicationService: PublicationService, // Inyectar el servicio
    private userService: UserService, // Inyectar el servicio de usuario
    private route: ActivatedRoute
  ) {}

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
          this.newPublication.empresa_id = this.empresa.id; // Asignar empresa_id a la nueva publicación
          this.obtenerPublicaciones(this.empresa.phone);
          this.cargarImagenesEmpresa(this.empresa.images);
          this.obtenerSaldo(this.empresa.id); // Obtener los saldos
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
          this.newPublication.empresa_id = this.empresa.id; // Asignar empresa_id a la nueva publicación
          this.obtenerPublicaciones(this.empresa.id);
          this.cargarImagenesEmpresa(this.empresa.images);
          this.obtenerSaldo(this.empresa.id); // Obtener los saldos
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

  cargarImagenesEmpresa(images: any[]): void {
    const profileImage = images.find((img: any) => img.desc === 'profile');
    if (profileImage) {
      this.userImageUrl = `http://localhost:8000/images/uploads/${profileImage.image}`;
    } else {
      this.userImageUrl = 'http://localhost:8000/images/user.png';
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

  obtenerSaldo(empresaId: string): void {
    this.companyService.obtenerSaldo(empresaId).subscribe({
      next: (response) => {
        this.saldos = response.data;
      },
      error: (error) => {
        console.error('Error al obtener los saldos:', error);
      }
    });
  }

  loadPublicationData(publication: any): void {
    this.newPublication = { ...publication };
    const [startDate, endDate] = publication.time.split(' - ');
    this.startDate = startDate;
    this.endDate = endDate;
  }

  modalDelete() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalModificar(publication: any) {
    this.loadPublicationData(publication);
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

  // Nueva función para crear una publicación
  createPublication(): void {
    this.newPublication.time = `${this.startDate} - ${this.endDate}`;
    this.publicationService.createPublication(this.newPublication).subscribe(
      response => {
        console.log('Publication created successfully:', response);
        // Actualizar la lista de publicaciones después de crear una nueva
        this.obtenerPublicaciones(this.empresa.id);
        this.modalAnadirClose(); // Cerrar el modal después de crear la publicación
      },
      error => {
        console.error('Error creating publication:', error);
      }
    );
  }

  updatePartial(id: string, updatedPublication: any): void {
    this.publicationService.updatePartial(id, updatedPublication).subscribe(
      response => {
        console.log('Publication updated successfully:', response);
        this.obtenerPublicaciones(this.empresa.id);
        this.modalModificarClose();
      },
      error => {
        console.error('Error updating publication:', error);
      }
    );
  }

  storeImage(file: File, userId?: number): void {
    this.userService.storeImage(file, userId).subscribe(
      response => {
        console.log('Imagen cargada exitosamente', response);
      },
      error => {
        console.error('Error al cargar la imagen:', error);
      }
    );
  }

  deleteImage(imageId: string): void {
    this.userService.deleteImage(imageId).subscribe(
      response => {
        console.log('Imagen eliminada exitosamente', response);
      },
      error => {
        console.error('Error al eliminar la imagen:', error);
      }
    );
  }
}