import { Component } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-administrar-usuarios',
  standalone: true,
  imports: [ NavComponent],
  templateUrl: './administrar-usuarios.component.html',
  styleUrl: './administrar-usuarios.component.css'
})
export class AdministrarUsuariosComponent {

  modalDelete(){
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalBan(){
    const modal = document.getElementById('banModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalBanClose() {
    const modal = document.getElementById('banModal') as HTMLElement;
    modal.style.display = 'none';
  }

}
