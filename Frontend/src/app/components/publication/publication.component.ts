import { Component } from '@angular/core';

import { NavComponent } from '../home/nav/nav.component';
import { FooterComponent } from '../home/footer/footer.component';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [NavComponent, FooterComponent],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.css'
})
export class PublicationComponent {

}
