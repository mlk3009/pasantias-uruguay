import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { NavComponent } from '../../home/nav/nav.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-postulantes',
  templateUrl: './postulantes.component.html',
  styleUrls: ['./postulantes.component.css'],
  imports: [NavComponent, CommonModule, FormsModule],
  standalone: true
})
export class PostulantesComponent implements OnInit {

  empresa: any;
  postulantes: any[] = [];
  loading: boolean = false;
  estado: string = '';

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();
    if (token) {
      this.companyService.obtenerEmpresa(token).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.obtenerPostulantes(this.empresa.id);
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

  obtenerPostulantes(empresaId: string): void {
    this.companyService.obtenerPostulantes(empresaId).subscribe({
      next: (response) => {
        this.postulantes = response.data;
        console.log(this.postulantes);
      },
      error: (error) => {
        console.error('Error al obtener los postulantes:', error);
      }
    });
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
}