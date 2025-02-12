import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { UserService } from '../../../services/user.service';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-postulations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent], 
  templateUrl: './postulations.component.html',
  styleUrl: './postulations.component.css'
})
export class PostulationsComponent implements OnInit {
  loading: boolean = false;
  data: any = {};
  userEtiquetas: any[] = [];
  postulaciones: any[] = [];

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
        },
        error: (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      });
    } else {
      this._router.navigate(['/login']);
    }
    this.getStudentData();
  }


  getStudentData(): void {
    const token = this._userService.getToken();
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          const estudiante_id = response.data.id;
          this._userService.getStudentData(token, estudiante_id).subscribe({
            next: (response) => {
              this.postulaciones = response.postulaciones;
              console.log('Postulaciones del estudiante:', this.postulaciones);
            },
            error: (error) => {
              console.error('Error al obtener las postulaciones del estudiante:', error);
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

  modal(){
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }
}