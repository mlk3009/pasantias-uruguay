import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { NavComponent } from '../../../components/home/nav/nav.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-postulantes',
  templateUrl: './postulantes.component.html',
  styleUrls: ['./postulantes.component.css'],
  imports: [NavComponent, CommonModule, FormsModule, RouterModule],
  standalone: true
})
export class PostulantesComponent implements OnInit {

  empresa: any;
  postulantes: any[] = [];
  filteredPostulantes: any[] = [];
  displayedPostulantes: any[] = [];
  loading: boolean = false;
  estado: string = '';
  searchText: string = '';
  userImageUrl: string = '';
  cvLink: string = 'http://localhost:8000/pdfs/cv_';
  fechaFiltro: string = 'reciente';
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  estadoFiltro: string = '';

  // Modal de contacto
  showModalContacto: boolean = false;
  postulanteSeleccionado: any = null;


  constructor(
    private companyService: CompanyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    
    // Verificar si hay un query parameter de búsqueda
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchText = params['search'];
      }
    });
    
    const token = this.companyService.getToken();
    if (token) {
      this.companyService.obtenerEmpresa(token).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.obtenerPostulantes(this.empresa.id);
          this.cargarImagenesEmpresa(this.empresa.images);
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
    const empresaImage = images.find((img: any) => img.desc === 'empresaimg');
    if (empresaImage) {
      this.userImageUrl = `http://localhost:8000/images/uploads/${empresaImage.image}`;
    } else {
      this.userImageUrl = 'http://localhost:8000/images/empresa.png';
    }
  }

  obtenerPostulantes(empresaId: string): void {
    this.companyService.obtenerPostulantes(empresaId).subscribe({
      next: (response) => {
        this.postulantes = response.data;
        this.filteredPostulantes = this.postulantes;
        this.currentPage = 1;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al obtener los postulantes:', error);
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = this.postulantes;

    // Filtro por buscador: busca cada palabra en nombre, apellido o email (ajusta los campos según tu modelo)
    if (this.searchText.trim() !== '') {
      const palabras = this.searchText.toLowerCase().split(' ').filter(Boolean);
      filtradas = filtradas.filter(p =>
        palabras.every(palabra =>
          (p.name || '').toLowerCase().includes(palabra) ||
          (p.estado || '').toLowerCase().includes(palabra) ||
          (p.phone || '').toLowerCase().includes(palabra) ||
          (p.publication_title || '').toLowerCase().includes(palabra) ||
          (p.email || '').toLowerCase().includes(palabra)
        )
      );
    }

  if (this.estadoFiltro !== '') {
    filtradas = filtradas.filter(p => p.estado === this.estadoFiltro);
  }
    

// ...otros filtros...
if (this.fechaFiltro === 'reciente') {
  filtradas = filtradas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
} else if (this.fechaFiltro === 'antiguo') {
  filtradas = filtradas.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}
    this.filteredPostulantes = filtradas;
    this.totalPages = Math.ceil(this.filteredPostulantes.length / this.itemsPerPage) || 1;
    this.currentPage = 1;
    this.updateDisplayedPostulantes();
  }

  updateDisplayedPostulantes(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedPostulantes = this.filteredPostulantes.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPostulantes();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPostulantes();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedPostulantes();
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

  actualizarEstadoPostulacion(publicationId: string, estudianteId: string, estado: string): void {
    this.companyService.actualizarEstadoPostulacion(publicationId, estudianteId, estado).subscribe({
      next: (response) => {
        console.log('Estado de la postulación actualizado correctamente', response);
        this.obtenerPostulantes(this.empresa.id); 
      },
      error: (error) => {
        console.error('Error al actualizar el estado de la postulación:', error);
      }
    });
  }

  abrirModalContacto(postulante: any): void {
    // No abrir el modal si el estudiante ya está en proceso
    if (postulante.estado === 'En proceso') {
      return;
    }
    
    this.postulanteSeleccionado = postulante;
    this.showModalContacto = true;
  }

  cerrarModal(): void {
    this.showModalContacto = false;
    this.postulanteSeleccionado = null;
  }

  contactarEstudiante(tipoContacto: string): void {
    if (!this.postulanteSeleccionado) return;

    this.companyService.contactarEstudiante(
      this.postulanteSeleccionado.publication_id,
      this.postulanteSeleccionado.id,
      tipoContacto,
      this.empresa.id
    ).subscribe({
      next: (response) => {
        console.log('Contacto realizado exitosamente:', response);
        
        // Mostrar mensaje de éxito
        if (tipoContacto === 'web') {
          alert('Contacto realizado exitosamente. Se ha enviado un email al estudiante.');
        } else {
          alert('Estado actualizado a "En proceso". Puedes contactar al estudiante directamente.');
        }
        
        // Actualizar la lista de postulantes para reflejar el cambio de estado
        this.obtenerPostulantes(this.empresa.id);
        
        // Cerrar modal
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al contactar estudiante:', error);
        alert('Error al contactar estudiante. Por favor, inténtalo de nuevo.');
      }
    });
  }
}