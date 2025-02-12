import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

import { NavComponent } from '../home/nav/nav.component';
import { FooterComponent } from '../home/footer/footer.component';
import { PublicationService } from '../../services/publication.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NavComponent, FooterComponent, FormsModule],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.css'
})
export class PublicationComponent implements OnInit {
  publication: any;
  data: any;
  asunto: string = '';
  descripcion: string = '';

  constructor(
    private publicationService: PublicationService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.getPublication(id);
      }
    });

    const token = this.userService.getToken();
    if (token) {
      this.obtenerUsuario(token);
    }
  }

  getPublication(id: string): void {
    this.publicationService.getPublicationById(id).subscribe(
      (response) => {
        this.publication = response.publication;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  createPostulacion(): void {
    const token = this.userService.getToken();
    if (!token) {
      alert('Necesita iniciar sesión para postularse.');
      return;
    }

    if (!this.data) {
      alert('No se pudo obtener la información del usuario. Intente nuevamente.');
      return;
    }

    const postulacion = {
      publication_id: this.publication.id,
      estudiante_id: this.data.id,
      estado: 'pendiente'
    };

    this.publicationService.createPostulacion(postulacion).subscribe(
      (response) => {
        alert('Postulación creada exitosamente');
      },
      (error) => {
        console.error('Error al crear la postulación', error);
        if (error.status === 400 && error.error.message === 'El estudiante ya se ha postulado a esta publicación') {
          alert('Ya se ha postulado a esta publicación.');
        }
      }
    );
  }

  guardarPublicacion(): void {
    const token = this.userService.getToken();
    if (!token) {
      alert('Necesita iniciar sesión para guardar la publicación.');
      return;
    }

    if (!this.data) {
      alert('No se pudo obtener la información del usuario. Intente nuevamente.');
      return;
    }

    const guarda = {
      publication_id: this.publication.id,
      estudiante_id: this.data.id
    };

    this.publicationService.guardarPublicacion(guarda).subscribe(
      (response) => {
        if (response.status === 200) {
          alert('Publicación eliminada de guardados');
        } else {
          alert('Publicación guardada exitosamente');
        }
      },
      (error) => {
        console.error('Error al guardar la publicación', error);
      }
    );
  }

  obtenerUsuario(token: string): void {
    this.userService.obtenerUsuario(token).subscribe(
      (response) => {
        this.data = response.data;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  contactMe(): void {
    const email = this.data.email;
    const emailDestino = this.publication.company_email;
    const asunto = this.asunto;
    const descripcion = this.descripcion;

    this.userService.contactMe(email, asunto, descripcion, emailDestino).subscribe(
      (response) => {
        alert('Correo enviado correctamente');
        this.modalClose();
      },
      (error) => {
        console.error('Error al enviar el correo', error);
        this.modalClose();
      }
    );
  }

  modal() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }
}