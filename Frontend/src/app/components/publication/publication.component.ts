import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

import { NavComponent } from '../../components/home/nav/nav.component';
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
  isPublicationSaved: boolean = false;
  isAlreadyApplied: boolean = false;
  
  // Variables para el carrusel de imágenes
  publicationImages: any[] = [];
  currentImageIndex: number = 0;

  constructor(
    private publicationService: PublicationService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
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

  redirectToCompanyProfile(): void {
    if (this.publication && this.publication.company_phone) {
      this.router.navigate(['/enterprise-profile', this.publication.company_phone]);
    }
  }

  getPublication(id: string): void {
    this.publicationService.getPublicationById(id).subscribe(
      (response) => {
        this.publication = response.publication;
        
        // Cargar imágenes del carrusel
        if (this.publication.images && this.publication.images.length > 0) {
          
          this.publicationImages = this.publication.images.sort((a: any, b: any) => {
            // Si es imagen por defecto, no necesita ordenar
            if (a.desc === 'default' || b.desc === 'default') {
              return 0;
            }
            // Extraer número del desc para ordenar correctamente
            const getOrderFromDesc = (desc: string) => {
              const match = desc.match(/publicationImage(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            return getOrderFromDesc(a.desc) - getOrderFromDesc(b.desc);
          });
          
          // El backend ya envía las URLs correctas, no necesitamos modificarlas
        } else {
          // Si no hay imágenes en la respuesta, usar imagen por defecto local
          this.publicationImages = [{
            id: 'default',
            image: 'defaultPubli.jpg',
            desc: 'default',
            url: 'http://localhost:8000/images/defaultPubli.jpg'
          }];
        }
        this.currentImageIndex = 0;
        
        // Verificar estado una vez que tenemos la publicación y los datos del usuario
        this.checkIfPublicationIsSaved();
        this.checkIfAlreadyApplied();
        // Registrar visita si tenemos los datos del usuario
        this.registrarVisitaUsuario();
      },
      (error) => {
        console.error('❌ ERROR al obtener publicación:', error);
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

    // No permitir postularse si no es estudiante
    if (this.data.rol !== 'estudiante') {
      return;
    }

    // No permitir postularse si ya se postuló
    if (this.isAlreadyApplied) {
      return;
    }

    const postulacion = {
      publication_id: this.publication.id,
      estudiante_id: this.data.id,
      estado: 'pendiente'
    };

    this.publicationService.createPostulacion(postulacion).subscribe(
      (response) => {
        this.isAlreadyApplied = true; // Actualizar estado local
        this.showAlert2();
      },
      (error) => {
        console.error('Error al crear la postulación', error);
        if (error.status === 400 && error.error.message === 'El estudiante ya se ha postulado a esta publicación') {
          this.isAlreadyApplied = true; // Actualizar estado local
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

    // No permitir guardar si no es estudiante
    if (this.data.rol !== 'estudiante') {
      return;
    }

    const guarda = {
      publication_id: this.publication.id,
      estudiante_id: this.data.id
    };

    this.publicationService.guardarPublicacion(guarda).subscribe(
      (response) => {
        if (response.status === 200) {
          // La publicación fue eliminada de guardados
          this.isPublicationSaved = false;
          this.showAlert7(); // Mensaje de eliminado
        } else if (response.status === 201) {
          // La publicación fue guardada
          this.isPublicationSaved = true;
          this.showAlert6(); // Mensaje de guardado
        }
      },
      (error) => {
        console.error('Error al gestionar la publicación guardada', error);
      }
    );
  }

  checkIfPublicationIsSaved(): void {
    // Solo verificar si tenemos tanto la publicación como los datos del usuario
    // Y solo si el usuario es estudiante
    if (!this.publication || !this.data || this.data.rol !== 'estudiante') {
      return;
    }

    this.publicationService.verificarPublicacionGuardada(this.publication.id, this.data.id).subscribe(
      (response) => {
        this.isPublicationSaved = response.guardada;
      },
      (error) => {
        console.error('Error al verificar si la publicación está guardada', error);
        this.isPublicationSaved = false;
      }
    );
  }

  checkIfAlreadyApplied(): void {
    // Solo verificar si tenemos tanto la publicación como los datos del usuario
    // Y solo si el usuario es estudiante
    if (!this.publication || !this.data || this.data.rol !== 'estudiante') {
      return;
    }

    this.publicationService.verificarPostulacion(this.publication.id, this.data.id).subscribe(
      (response) => {
        this.isAlreadyApplied = response.postulado;
      },
      (error) => {
        console.error('Error al verificar si ya se postuló', error);
        this.isAlreadyApplied = false;
      }
    );
  }

  obtenerUsuario(token: string): void {
    this.userService.obtenerUsuario(token).subscribe(
      (response) => {
        this.data = response.data;
        // Verificar estado una vez que tenemos los datos del usuario
        this.checkIfPublicationIsSaved();
        this.checkIfAlreadyApplied();
        // Registrar visita si tenemos la publicación
        this.registrarVisitaUsuario();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  registrarVisitaUsuario(): void {
    // Solo registrar la visita si tenemos tanto la publicación como los datos del usuario
    // Y solo si el usuario es estudiante
    if (this.publication && this.data && this.publication.id && this.data.id && this.data.rol === 'estudiante') {
      this.publicationService.registrarVisita(this.publication.id, this.data.id).subscribe(
        (response) => {
          // Visita registrada silenciosamente
        },
        (error) => {
          // Error manejado silenciosamente
        }
      );
    }
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

  // Métodos para el carrusel de imágenes
  nextImage(): void {
    if (this.publicationImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.publicationImages.length;
    }
  }

  prevImage(): void {
    if (this.publicationImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.publicationImages.length) % this.publicationImages.length;
    }
  }

  getCurrentImage(): any {
    if (this.publicationImages.length > 0 && this.currentImageIndex >= 0 && this.currentImageIndex < this.publicationImages.length) {
      return this.publicationImages[this.currentImageIndex];
    }
    return null;
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.publicationImages.length) {
      this.currentImageIndex = index;
    }
  }

  isStudentUser(): boolean {
    return this.data && this.data.rol === 'estudiante';
  }

  isEnterpriseUser(): boolean {
    return this.data && this.data.rol === 'empresa';
  }

  isAdminUser(): boolean {
    return this.data && this.data.rol === 'admin';
  }

  shouldShowStudentActions(): boolean {
    return this.isStudentUser();
  }

  shouldDisablePostulateButton(): boolean {
    return !this.isStudentUser() || this.isAlreadyApplied;
  }

  shouldDisableSaveButton(): boolean {
    return !this.isStudentUser();
  }
}