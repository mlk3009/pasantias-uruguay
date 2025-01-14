import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { UserService } from '../../../services/user.service';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, NavComponent], // Añade CommonModule al array de imports
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
  }

  getUserEtiquetas(userId: number): void {
    this._userService.getUserEtiquetas(userId).subscribe({
      next: (userEtiquetas) => {
        this.userEtiquetas = userEtiquetas;
        console.log(this.userEtiquetas); // Verifica que las etiquetas del usuario se asignen correctamente
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
        console.log(this.etiquetas); // Verifica que las etiquetas se asignen correctamente
      },
      error: (error) => {
        console.error('Error al obtener las etiquetas:', error);
      }
    });
  }
}