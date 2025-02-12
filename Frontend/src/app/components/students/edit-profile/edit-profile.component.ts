import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { UserService } from '../../../services/user.service';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent], 
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  data: any = {};
  userEtiquetas: any[] = [];
  etiquetas: any[] = [];
  userImageUrl: string = '';
  previousImageId: string | null = null;
  status: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef;

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
          this.getUserEtiquetas(this.data.id); 
          if (this.data.id_image) {
            this.userImageUrl = `http://localhost:8000/images/uploads/${this.data.image}`;
            this.previousImageId = this.data.id_image;
          } else {
            this.userImageUrl = 'http://localhost:8000/images/user.png'; 
          }
        },
        error: (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      });
    } else {
      this._router.navigate(['/login']);
    }

    this.getEtiquetas();
    this.getUserData();
  }

  getUserEtiquetas(userId: number): void {
    this._userService.getUserEtiquetas(userId).subscribe({
      next: (userEtiquetas) => {
        this.userEtiquetas = userEtiquetas;
        console.log(this.userEtiquetas);
      },
      error: (error) => {
        console.error('Error al obtener las etiquetas del usuario:', error);
      }
    });
  }

  addUserTag(estudiante_id: number, etiqueta_id: number): void {
    if (this.userEtiquetas.length >= 3) {
      this.showAlert5();
      return;
    }
    this._userService.addUserTags(estudiante_id, etiqueta_id).subscribe({
      next: (response) => {
        console.log('Etiqueta agregada:', response);
        this.showAlert2();
        this.getUserEtiquetas(estudiante_id); // Actualizar las etiquetas del usuario
      },
      error: (error) => {
        console.error('Error al agregar la etiqueta:', error);
        this.showAlert4();
      }
    });
  }

  deleteUserTag(estudiante_id: number, etiqueta_id: number): void {
    this._userService.deleteUserTag(estudiante_id, etiqueta_id).subscribe({
      next: (response) => {
        console.log('Etiqueta eliminada:', response);
        this.showAlert3();
        this.getUserEtiquetas(estudiante_id); // Actualizar las etiquetas del usuario
      },
      error: (error) => {
        console.error('Error al eliminar la etiqueta:', error);
        this.showAlert4();
      }
    });
  }

  getEtiquetas(): void {
    this._userService.getEtiquetas().subscribe({
      next: (etiquetas) => {
        this.etiquetas = etiquetas;
        console.log(this.etiquetas);
      },
      error: (error) => {
        console.error('Error al obtener las etiquetas:', error);
      }
    });
  }

  onTagSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const etiquetaId = Number(selectElement.value);
    if (this.data.id) {
      this.addUserTag(this.data.id, etiquetaId);
    }
  }

  onTagDelete(etiquetaId: number): void {
    if (this.data.id) {
      this.deleteUserTag(this.data.id, etiquetaId);
    }
  }

  updateProfile(): void {
    const errors = this.validateFields();
    if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
    }

    const token = this._userService.getToken();
    if (token) {
        this._userService.update(this.data, token).subscribe({
            next: (response) => {
                console.log('Perfil actualizado:', response);
                this.showAlert1();
            },
            error: (error) => {
                console.error('Error al actualizar el perfil:', error);
                let errorList = error.error.failed_input;

                for (let err in errorList) {
                    if (err == 'email') {
                        this.status = 'El email ya se encuentra registrado';
                    }

                    if (err == 'phone') {
                        this.status += ' El número de teléfono ya está en uso';
                    }
                }
            }
        });
    } else {
        console.error('Token no encontrado');
    }
}

  reloadPage(): void {
    window.location.reload();
  }

  validateFields(): string[] {
    const errors: string[] = [];

    if (!this.data.name) {
      errors.push('Nombre completo es requerido.');
    } else if (this.data.name.length > 50) {
      errors.push('Nombre completo no puede tener más de 50 caracteres.');
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!this.data.email || !emailPattern.test(this.data.email)) {
        errors.push('Email es inválido.');
    }

    if (this.data.phone && (this.data.phone.length !== 8 && this.data.phone.length !== 9)) {
      errors.push('Teléfono debe tener 8 (telefono) o 9 (celular) caracteres.');
    }

    if (!this.data.fec_nacimiento) {
        errors.push('Fecha de nacimiento es requerida.');
    }

    if (this.data.ci_estudiante && this.data.ci_estudiante.length != 8) {
        errors.push('Identificación debe de tener 8 caracteres.');
    }

    if (this.data.cod_postal && this.data.cod_postal.length != 5) {
        errors.push('Código postal debe de tener 5 caracteres.');
    }

    if (this.data.desc1.length > 280) {
      errors.push('La descripción 1 no puede tener más de 280 caracteres.');
    }

    if (this.data.desc2.length > 280) {
      errors.push('La descripción 2 no puede tener más de 280 caracteres.');
    }

    return errors;
  }

  getUserData(): void {
    const token = this._userService.getToken();
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.data = response.data;
          console.log('Datos del usuario:', this.data);
        },
        error: (error) => {
          console.error('Error al obtener los datos del usuario:', error);
        }
      });
    } else {
      console.error('Token no encontrado');
    }
  }

  onImageClick(): void {
    this.fileInput.nativeElement.click();
  }
  
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadNewImage(file);
    }
  }
  
  uploadNewImage(file: File): void {

    console.log('ID del usuario:', this.data.id);

    
    // Primero sube la nueva imagen
    this._userService.storeImage(file, this.data.id).subscribe(
      response => {
        console.log('Imagen cargada exitosamente', response);
        const newImageId = response.id;
        this.userImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
  
        // Borrar la imagen anterior si existe
        if (this.previousImageId) {
          this._userService.deleteImage(this.previousImageId).subscribe(() => {
            console.log('Imagen anterior eliminada');
          });
        }
  
        // Actualizar el id_image anterior
        this.previousImageId = newImageId;
      },
      error => {
        console.error('Error al cargar la imagen', error);
      }
    );
  }
  modal(){
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
      console.error('Elemento con ID alert-container2 no encontrado');
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

  alert1Close2() {
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

  alert1Close3() {
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

  alert1Close4() {
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

  alert1Close5() {
    const modal = document.getElementById('alert-container5') as HTMLElement;
    modal.style.display = 'none';
  }


}