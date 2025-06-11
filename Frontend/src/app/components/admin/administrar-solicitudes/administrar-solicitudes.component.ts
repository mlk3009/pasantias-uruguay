import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../home/nav/nav.component';
import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-administrar-solicitudes',
  standalone: true,
  imports: [NavComponent, CommonModule, FormsModule],
  templateUrl: './administrar-solicitudes.component.html',
  styleUrl: './administrar-solicitudes.component.css'
})
export class AdministrarSolicitudesComponent {
  user: any = {};
  mensajes: any[] = [];
  mensajeIdSeleccionado: number | null = null;
  userIdSeleccionado: number | null = null;
  descripcionRechazo: string = '';
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


  constructor(private _userService: UserService, private _adminService: AdminService) {}

  ngOnInit(): void {
    this.obtenerUsuario();
    this.getAllMensajes(true);
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

  getAllMensajes(solicitud?: boolean, page: number = 1): void {
    this._adminService.getAllMensajes(solicitud, page, this.itemsPerPage).subscribe({
      next: (response) => {
        this.mensajes = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.total_pages;
        this.totalMensajes = response.total_mensajes;
      },
      error: (error) => {
        console.error('Error fetching mensajes:', error);
      }
    });
  }

  searchMensajes(): void {
    this.searchParams.solicitud = false;
    this._adminService.searchMensajes(this.searchParams).subscribe(
      (response) => {
        this.mensajes = response;
      },
      (error) => {
        console.error('Error searching mensajes:', error);
      }
    );
  }

  rejectUser(): void {
    if (this.userIdSeleccionado !== null) {
      this._adminService.rejectUser(this.userIdSeleccionado, this.descripcionRechazo).subscribe({
        next: (response) => {
          console.log('Usuario rechazado:', response);
          this.getAllMensajes(true); 
          this.modalRejectClose(); 
        },
        error: (error) => {
          console.error('Error rejecting usuario:', error);
        }
      });
    }
  }

  approveUser(): void {
    if (this.userIdSeleccionado !== null) {
      this._adminService.approveUser(this.userIdSeleccionado).subscribe({
        next: (response) => {
          console.log('Usuario aprobado:', response);
          this.getAllMensajes(true); 
          this.modalApproveClose(); 
        },
        error: (error) => {
          console.error('Error approving usuario:', error);
        }
      });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getAllMensajes(true, this.currentPage);
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getAllMensajes(true, this.currentPage);
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalMensajes);
  }

  ngAfterViewInit() {}

  modalReject(id: number, userId: number): void {
    this.mensajeIdSeleccionado = id;
    this.userIdSeleccionado = userId;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalRejectClose(): void {
    this.mensajeIdSeleccionado = null;
    this.userIdSeleccionado = null;
    this.descripcionRechazo = '';
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalApprove(id: number, userId: number): void {
    this.mensajeIdSeleccionado = id;
    this.userIdSeleccionado = userId;
    const modal = document.getElementById('solicitudModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalApproveClose(): void {
    this.mensajeIdSeleccionado = null;
    this.userIdSeleccionado = null;
    const modal = document.getElementById('solicitudModal') as HTMLElement;
    modal.style.display = 'none';
  }
}