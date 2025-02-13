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
      this.showAlert1();
      return;
    }

    if (!this.data) {
      this.showAlert1();
      return;
    }

    const postulacion = {
      publication_id: this.publication.id,
      estudiante_id: this.data.id,
      estado: 'pendiente'
    };

    this.publicationService.createPostulacion(postulacion).subscribe(
      (response) => {
        this.showAlert2();
      },
      (error) => {
        console.error('Error al crear la postulación', error);
        if (error.status === 400 && error.error.message === 'El estudiante ya se ha postulado a esta publicación') {
          this.showAlert3();
        }
      }
    );
  }

  guardarPublicacion(): void {
    const token = this.userService.getToken();
    if (!token) {
      this.showAlert4();
      return;
    }

    if (!this.data) {
      this.showAlert5();
      return;
    }

    const guarda = {
      publication_id: this.publication.id,
      estudiante_id: this.data.id
    };

    this.publicationService.guardarPublicacion(guarda).subscribe(
      (response) => {
        if (response.status === 200) {
          this.showAlert6();
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
        this.showAlert8();
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

  showAlert1(): void {
    const modal = document.getElementById('alert-container') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container no encontrado');
    }
  }

  alert1Close() {
    const modal = document.getElementById('alert-container') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert2(): void {
    const modal = document.getElementById('alert-container2') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container2 no encontrado');
    }
  }

  alert2Close() {
    const modal = document.getElementById('alert-container2') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert3(): void {
    const modal = document.getElementById('alert-container3') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container3 no encontrado');
    }
  }

  alert3Close() {
    const modal = document.getElementById('alert-container3') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert4(): void {
    const modal = document.getElementById('alert-container4') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container4 no encontrado');
    }
  }

  alert4Close() {
    const modal = document.getElementById('alert-container4') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert5(): void {
    const modal = document.getElementById('alert-container5') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container5 no encontrado');
    }
  }

  alert5Close() {
    const modal = document.getElementById('alert-container5') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert6(): void {
    const modal = document.getElementById('alert-container6') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container6 no encontrado');
    }
  }

  alert6Close() {
    const modal = document.getElementById('alert-container6') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert7(): void {
    const modal = document.getElementById('alert-container7') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container7 no encontrado');
    }
  }

  alert7Close() {
    const modal = document.getElementById('alert-container7') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert8(): void {
    const modal = document.getElementById('alert-container8') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container8 no encontrado');
    }
  }

  alert8Close() {
    const modal = document.getElementById('alert-container8') as HTMLElement;
    modal.style.display = 'none';
  }
}