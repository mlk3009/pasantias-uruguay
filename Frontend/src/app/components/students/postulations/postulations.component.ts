import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { UserService } from '../../../services/user.service';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-postulations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent], 
  templateUrl: './postulations.component.html',
  styleUrl: './postulations.component.css'
})
export class PostulationsComponent implements OnInit {
  loading: boolean = false;
  data: any = {};
  userEtiquetas: any[] = [];
  postulaciones: any[] = [];
  displayedPostulaciones: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6; 
  totalPages: number = 1;
  searchText: string = '';
  estadoFiltro: string = '';
  filteredPostulaciones: any[] = [];

  constructor(
    private _userService: UserService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const token = this._userService.getToken(); 
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.data = response.data;
          console.log(this.data); 
        },
        error: (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      });
    } else {
      this._router.navigate(['/login']);
    }
    this.getStudentData();
  }

  prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updateDisplayedPostulaciones();
  }
}

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedPostulaciones();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPostulaciones();
    }
  }

  getPages(): number[] {
    if (this.totalPages <= 6) {
      return Array.from({ length: this.totalPages - 1 }, (_, i) => i + 1);
    } else if (this.currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    } else if (this.currentPage >= this.totalPages - 3) {
      return [this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1];
    } else {
      return [this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2];
    }
  }

getStudentData(): void {
  const token = this._userService.getToken();
  if (token) {
    this._userService.obtenerUsuario(token).subscribe({
      next: (response) => {
        const estudiante_id = response.data.id;
        this._userService.getStudentData(token, estudiante_id).subscribe({
          next: (response) => {
            this.postulaciones = response.postulaciones;
            this.filteredPostulaciones = this.postulaciones;
            this.currentPage = 1; 
            this.updateDisplayedPostulaciones(); 
            console.log('Postulaciones del estudiante:', this.postulaciones);
          },
          error: (error) => {
            console.error('Error al obtener las postulaciones del estudiante:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      }
    });
  } else {
    console.error('Token no encontrado');
  }
}

aplicarFiltros(): void {
  let filtradas = this.postulaciones;

  if (this.searchText.trim() !== '') {
    const palabras = this.searchText.toLowerCase().split(' ').filter(Boolean);
    filtradas = filtradas.filter(p =>
      palabras.every(palabra =>
        (p.title || '').toLowerCase().includes(palabra) ||
        (p.empresa_name || '').toLowerCase().includes(palabra)
      )
    );
  }

  if (this.estadoFiltro !== '') {
    filtradas = filtradas.filter(p => p.estado === this.estadoFiltro);
  }

  this.filteredPostulaciones = filtradas;
  this.totalPages = Math.ceil(this.filteredPostulaciones.length / this.itemsPerPage) || 1;
  this.currentPage = 1; // Reinicia a la primera página al filtrar
  this.updateDisplayedPostulaciones();
}

updateDisplayedPostulaciones(): void {
  // Siempre usa filteredPostulaciones como fuente
  const source = this.filteredPostulaciones;
  this.totalPages = Math.ceil(source.length / this.itemsPerPage) || 1;
  // Si la página actual queda fuera de rango por el filtro, vuelve a la primera
  if (this.currentPage > this.totalPages) {
    this.currentPage = 1;
  }
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  this.displayedPostulaciones = source.slice(start, end);
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