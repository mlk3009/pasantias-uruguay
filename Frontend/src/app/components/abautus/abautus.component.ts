import { Component } from '@angular/core';

import { NavComponent } from '../home/nav/nav.component';
import { FooterComponent } from '../home/footer/footer.component';
import { PublicacionesComponent } from '../home/publicaciones/publicaciones.component';

@Component({
  selector: 'app-abautus',
  standalone: true,
  imports: [ NavComponent, FooterComponent, PublicacionesComponent,],
  templateUrl: './abautus.component.html',
  styleUrl: './abautus.component.css'
})
export class AbautusComponent {

}
