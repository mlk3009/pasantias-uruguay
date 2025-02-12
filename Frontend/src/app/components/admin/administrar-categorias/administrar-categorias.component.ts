import { Component } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-administrar-categorias',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './administrar-categorias.component.html',
  styleUrl: './administrar-categorias.component.css'
})
export class AdministrarCategoriasComponent {

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
