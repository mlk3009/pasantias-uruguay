import { Component, OnInit } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PublicationService } from '../../../services/publication.service';
import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-administrar-publicaciones',
  standalone: true,
  imports: [NavComponent, CommonModule, FormsModule],
  templateUrl: './administrar-publicaciones.component.html',
  styleUrl: './administrar-publicaciones.component.css'
})
export class AdministrarPublicacionesComponent implements OnInit {
  publications: any[] = [];
  displayedPublications: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 16;
  data: any = {};
  userimage: string = 'http://localhost:8000/images/user.png';
  selectedPublicationId: number | null = null;
  searchParams: any = {
    search: '',
    location: '',
    etiqueta: '',
    featured: false,
    is_deleted: false
  };

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
noPublicationsMessage: string = '';


  constructor(
    private _publicationService: PublicationService,
    private _userService: UserService,
    private _adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('category') || undefined;
      this.getPublications(category);
    });

    const token = this._userService.getToken();
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.data = response.data;
          this.updateDisplayedPublications();
        },
        error: (error) => {
          console.error(error);
          this.updateDisplayedPublications();
        }
      });
    } else {
      this.updateDisplayedPublications();
    }
  }

  updateDisplayedPublications(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPublications = this.publications.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if ((this.currentPage * this.itemsPerPage) < this.publications.length) {
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

  modalDelete(publicationId: number): void {
    this.selectedPublicationId = publicationId;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose(): void {
    this.selectedPublicationId = null;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalBan(publicationId: number): void {
    this.selectedPublicationId = publicationId;
    const modal = document.getElementById('banModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalBanClose(): void {
    this.selectedPublicationId = null;
    const modal = document.getElementById('banModal') as HTMLElement;
    modal.style.display = 'none';
  }

  getPublications(category?: string, featured: boolean = false): void {
    this._publicationService.getPublications(category, featured).subscribe(
      (response) => {
        if (response && response.length > 0 && response[0].publications) {
          this.publications = response[0].publications;
        } else {
          this.publications = [];
        }
        this.updateDisplayedPublications();
      },
      (error) => {
        console.error(error);
      }
    );
  }

searchPublications(): void {
  this._publicationService.searchPublications(this.searchParams).subscribe(
    (response: any) => {
      // Si es un array plano
      if (Array.isArray(response)) {
        this.publications = response;
      }
      // Si es un objeto con publications
      else if (response && response.publications) {
        this.publications = response.publications;
      } else {
        this.publications = [];
      }
      this.noPublicationsMessage = '';
      this.updateDisplayedPublications();
    },
    (error) => {
      if (error.message === 'No se encontraron publicaciones.') {
        this.publications = [];
        this.noPublicationsMessage = 'No se encontraron publicaciones.';
        this.updateDisplayedPublications();
      } else {
        console.error('Error searching publications:', error);
      }
    }
  );
}

  destroyPublication(id: number | null): void {
    if (id !== null) {
      this._adminService.destroyPublication(id).subscribe(
        (response) => {
          this.showAlertCustom('Publicación eliminada permanentemente');
          this.getPublications(); // Refresh the publications list
          this.modalDeleteClose(); // Close the modal
        },
        (error) => {
          this.showAlertCustom('Error al eliminar publicación');
          console.error('Error destroying publication:', error);
        }
      );
    }
  }

  softDeletePublication(id: number | null): void {
    if (id !== null) {
      this._adminService.softDeletePublication(id).subscribe(
        (response) => {
          this.showAlertCustom('Publicación suspendida correctamente');
          this.getPublications(); 
          this.modalBanClose(); 
        },
        (error) => {
          this.showAlertCustom('Error al suspender publicación');
          console.error('Error soft deleting publication:', error);
        }
      );
    }
  }
}
