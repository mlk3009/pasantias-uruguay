import { Component } from '@angular/core';

import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-my-publications',
  standalone: true,
  imports: [ NavComponent],
  templateUrl: './my-publications.component.html',
  styleUrl: './my-publications.component.css'
})
export class MyPublicationsComponent {


  modalDelete(){
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose() {
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalModificar(){
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalModificarClose() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'none';
  }

}
