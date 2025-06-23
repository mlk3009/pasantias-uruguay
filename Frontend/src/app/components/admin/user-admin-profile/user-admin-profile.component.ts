import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../home/nav/nav.component';
import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-user-admin-profile',
  standalone: true,
  imports: [CommonModule, NavComponent, FormsModule],
  templateUrl: './user-admin-profile.component.html',
  styleUrl: './user-admin-profile.component.css'
})
export class UserAdminProfileComponent implements OnInit {
  user: any = {};
  mensajes: any[] = [];
  mensajeIdSeleccionado: number | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalMensajes: number = 0;
  userimage: string = 'http://localhost:8000/images/user.png';
  searchParams: any = {
    search: '',
    location: '',
    rol: ''
  };
  isFiltering: boolean = false;
  activeFilters: any = {};

  constructor(private _userService: UserService, private _adminService: AdminService) {}

  ngOnInit(): void {
    this.obtenerUsuario();
    this.getAllMensajes(false);
  }

  obtenerUsuario(): void {
    const token = this._userService.getToken();
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.user = response.data;
        },
        error: (error) => {
          console.error('Error fetching user:', error);
        }
      });
    }
  }

  getAllMensajes(solicitud: boolean = false, page: number = 1): void {
    this._adminService.getAllMensajes(solicitud, page, this.itemsPerPage).subscribe(
      (response) => {
        this.mensajes = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.total_pages;
        this.totalMensajes = response.total_mensajes;
      },
      (error) => {
        console.error('Error fetching mensajes:', error);
      }
    );
  }



nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    if (this.isFiltering) {
      const filters = { ...this.activeFilters, page: this.currentPage, itemsPerPage: this.itemsPerPage };
      this.filterMensajes(filters);
    } else {
      this.getAllMensajes(false, this.currentPage);
    }
    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
  }
}

previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    if (this.isFiltering) {
      const filters = { ...this.activeFilters, page: this.currentPage, itemsPerPage: this.itemsPerPage };
      this.filterMensajes(filters);
    } else {
      this.getAllMensajes(false, this.currentPage);
    }
    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
  }
}

filterMensajes(filters: any): void {
  this.isFiltering = true;
  this.activeFilters = { ...filters }; // Guarda los filtros actuales
  filters.page = this.currentPage;
  filters.itemsPerPage = this.itemsPerPage;
  filters.solicitud = false; // Siempre filtra por solicitud en false
  this._adminService.filterMensajes(filters).subscribe(
    (response) => {
      this.mensajes = response.data;
      this.currentPage = response.current_page;
      this.totalPages = response.total_pages;
      this.totalMensajes = response.total_mensajes;
    },
    (error) => {
      console.error('Error filtrando mensajes:', error);
    }
  );
}

// Si quieres limpiar el filtro y volver a mostrar todos:
clearFilter(): void {
  this.isFiltering = false;
  this.currentPage = 1;
  this.getAllMensajes(false, this.currentPage);
}

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalMensajes);
  }

  modalDelete(id: number): void {
    this.mensajeIdSeleccionado = id;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose(): void {
    this.mensajeIdSeleccionado = null;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  deleteMensaje(): void {
    if (this.mensajeIdSeleccionado !== null) {
      this._adminService.deleteMensaje(this.mensajeIdSeleccionado).subscribe({
        next: (response) => {
          console.log('Mensaje deleted:', response);
          this.getAllMensajes(false); 
          this.modalDeleteClose(); 
        },
        error: (error) => {
          console.error('Error deleting mensaje:', error);
        }
      });
    }
  }
}