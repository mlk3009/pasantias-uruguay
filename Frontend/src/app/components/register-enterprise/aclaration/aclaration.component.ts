import { Component } from '@angular/core';

import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-aclaration',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './aclaration.component.html',
  styleUrl: './aclaration.component.css'
})
export class AclarationComponent {

  modal(){
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }

}
