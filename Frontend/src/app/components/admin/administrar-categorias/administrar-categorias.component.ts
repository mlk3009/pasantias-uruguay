import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../home/nav/nav.component';
import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-administrar-categorias',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './administrar-categorias.component.html',
  styleUrl: './administrar-categorias.component.css'
})
export class AdministrarCategoriasComponent {
  
  user: any = {};
  userimage: string = 'http://localhost:8000/images/user.png';


constructor(private _userService: UserService, private _adminService: AdminService) {}
  
    ngOnInit(): void {
      this.obtenerUsuario();
    }
  
    obtenerUsuario(): void {
      const token = this._userService.getToken();
      if (token) {
        this._userService.obtenerUsuario(token).subscribe({
          next: (response) => {
            this.user = response.data;
          },
          error: (error) => {
            console.error('Error fetching user:', error);
          }
        });
      }
    }

  modalDelete(){
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalModify(){
    const modal = document.getElementById('modifyModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalModifyClose() {
    const modal = document.getElementById('modifyModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalAnadir(){
    const modal = document.getElementById('añadirModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalAnadirClose() {
    const modal = document.getElementById('añadirModal') as HTMLElement;
    modal.style.display = 'none';
  }

}
