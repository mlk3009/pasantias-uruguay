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

// Si se quiere vincultar a una tabla de la bdd
    clientes: string = '3000+';
    empresasAfiliadas: string = '100+';
    llamadosLaborales: string = '13.500+';
    recomendaciones: string = '1000+';
    utusAfiliadas: string = '5';
    operadoresActivos: string = '40+';


    constructor(private router: Router) {
        initFlowbite();
    }
}