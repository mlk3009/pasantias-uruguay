import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { UserService } from '../../../services/user.service';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent], // Añade FormsModule al array de imports
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  loading: boolean = false;
  data: any = {};
  userEtiquetas: any[] = [];
  etiquetas: any[] = [];

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
        },
        error: (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      });
    } else {
      console.error('Token no encontrado');
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
                // Redirigir o mostrar un mensaje de éxito
            },
            error: (error) => {
                console.error('Error al actualizar el perfil:', error);
            }
        });
    } else {
        console.error('Token no encontrado');
    }
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

  modal(){
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }
}