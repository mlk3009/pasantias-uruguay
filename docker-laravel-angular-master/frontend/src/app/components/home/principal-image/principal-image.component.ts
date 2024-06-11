import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
    selector: 'app-principal-image',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterModule
    ],
    templateUrl: './principal-image.component.html',
    styleUrl: './principal-image.component.css'
})

export class PrincipalImageComponent {
    constructor(private router: Router) {
        initFlowbite();
    }
}