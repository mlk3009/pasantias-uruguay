import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { UserService } from '../../../services/user.service';
import { PublicationService } from '../../../services/publication.service';
import { NavComponent } from '../../../components/home/nav/nav.component';


@Component({
  selector: 'app-guardados',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, RouterModule], 
  templateUrl: './saves.component.html',
  styleUrl: './saves.component.css'
})
export class SavesComponent implements OnInit {
  
  guardados: any[] = [];
  displayedGuardados: any[] = [];
  filteredGuardados: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6; 
  totalPages: number = 1;
  data: any = {};
  dataLoaded: boolean = false; // Nueva propiedad para controlar si los datos están cargados
  searchText: string = '';
  filteredPostulaciones: any[] = [];
  deletePublicationId: number | null = null;

  constructor(
    private _userService: UserService,
    private _router: Router,
    private route: ActivatedRoute,
    private _publicationService: PublicationService
  ) {}
  
ngOnInit(): void {
  const token = this._userService.getToken(); 
  if (token) {
    this._userService.obtenerUsuario(token).subscribe({
      next: (response) => {
        this.data = response.data;
        this.dataLoaded = true; // Marcar que los datos han sido cargados
        console.log(this.data); 
      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
      }
    });
  } else {
    this._router.navigate(['/login']);
  }
  this.getSavedPublications();
}

getSavedPublications(): void {
  const token = this._userService.getToken();
  if (token) {
    this._userService.obtenerUsuario(token).subscribe({
      next: (response) => {
        const estudiante_id = response.data.id;
        this._userService.getStudentData(token, estudiante_id).subscribe({
          next: (response) => {
            this.guardados = response.publicaciones_guardadas;
            this.filteredGuardados = this.guardados; // Inicializa los filtrados
            this.currentPage = 1; 
            this.aplicarFiltros(); // Aplica filtros al cargar
          },
          error: (error) => {
            console.error('Error al obtener las publicaciones guardadas del estudiante:', error);
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
  let filtradas = this.guardados;

  // Filtro por buscador: busca cada palabra en title o empresa_name
  if (this.searchText.trim() !== '') {
    const palabras = this.searchText.toLowerCase().split(' ').filter(Boolean);
    filtradas = filtradas.filter(p =>
      palabras.every(palabra =>
        (p.title || '').toLowerCase().includes(palabra) ||
        (p.empresa_name || '').toLowerCase().includes(palabra)
      )
    );
  }

  this.filteredGuardados = filtradas;
  this.totalPages = Math.ceil(this.filteredGuardados.length / this.itemsPerPage) || 1;
  this.currentPage = 1; // Reinicia a la primera página al filtrar
  this.updateDisplayedGuardados();
}

updateDisplayedGuardados(): void {
  const source = this.filteredGuardados.length || this.searchText
    ? this.filteredGuardados
    : this.guardados;
  this.totalPages = Math.ceil(source.length / this.itemsPerPage) || 1;
  if (this.currentPage > this.totalPages) {
    this.currentPage = 1;
  }
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  this.displayedGuardados = source.slice(start, end);
}

  prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updateDisplayedGuardados();
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updateDisplayedGuardados();
  }
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.updateDisplayedGuardados();
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


  modal(){
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalDelete(publicationId: number) {
  this.deletePublicationId = publicationId;
  const modal = document.getElementById('deleteModal') as HTMLElement;
  if (modal) modal.style.display = 'flex';
}

modalDeleteClose() {
  this.deletePublicationId = null;
  const modal = document.getElementById('deleteModal') as HTMLElement;
  if (modal) modal.style.display = 'none';
}

deleteSavedPublication(publicationId: number | null) {
  if (!publicationId || !this.data?.id) return;
  this._publicationService.guardarPublicacion({
    publication_id: publicationId,
    estudiante_id: this.data.id,
    borrar: true
  }).subscribe({
    next: () => {
      this.getSavedPublications();
      this.modalDeleteClose();
    },
    error: (error) => {
      console.error('Error al borrar la publicación guardada:', error);
      this.modalDeleteClose();
    }
  });
}
}
