import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-principal-image-publications',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './principal-image-publications.component.html',
  styleUrl: './principal-image-publications.component.css'
})
export class PrincipalImagePublicationsComponent {

  constructor(private router: Router) {
    initFlowbite();
  }

  pago() {
    var rangeInput = document.getElementById('price-range-input');
    var currencyInput = document.getElementById('currency-input');

    
  }
}
