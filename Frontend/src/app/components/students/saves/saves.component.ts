import { Component } from '@angular/core';

import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-saves',
  standalone: true,
  imports: [NavComponent,],
  templateUrl: './saves.component.html',
  styleUrl: './saves.component.css'
})
export class SavesComponent {

}
