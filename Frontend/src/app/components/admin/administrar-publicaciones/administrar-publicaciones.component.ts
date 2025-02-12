import { Component, OnInit } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';


@Component({
  selector: 'app-administrar-publicaciones',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './administrar-publicaciones.component.html',
  styleUrl: './administrar-publicaciones.component.css'
})
export class AdministrarPublicacionesComponent {
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
