import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-principal-image-in',
  standalone: true,
  imports: [ CommonModule, RouterOutlet, RouterModule],
  templateUrl: './principal-image-in.component.html',
  styleUrl: './principal-image-in.component.css'
})
export class PrincipalImageInComponent {
  constructor(private router: Router) {
    initFlowbite();
  }
}
