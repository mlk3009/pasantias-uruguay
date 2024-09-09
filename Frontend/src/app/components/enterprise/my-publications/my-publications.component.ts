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

}
