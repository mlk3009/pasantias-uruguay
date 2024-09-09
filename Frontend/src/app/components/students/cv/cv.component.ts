import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';

import { NavComponent } from '../../home/nav/nav.component';
import { InsideCvComponent } from './inside-cv/inside-cv.component';
import { FooterComponent } from '../../home/footer/footer.component';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule, NavComponent, InsideCvComponent, FooterComponent],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.css'
})
export class CVComponent {

}
