import { Component } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-administrar-solicitudes',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './administrar-solicitudes.component.html',
  styleUrl: './administrar-solicitudes.component.css'
})
export class AdministrarSolicitudesComponent {

  modalDelete(){
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalSolicitud(){
    const modal = document.getElementById('solicitudModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalSolicitudClose() {
    const modal = document.getElementById('solicitudModal') as HTMLElement;
    modal.style.display = 'none';
  }

}
