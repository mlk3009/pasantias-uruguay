import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, ActivatedRoute } from '@angular/router';
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
    styleUrls: ['./principal-image.component.css']
})
export class PrincipalImageComponent implements OnInit {

    // Si se quiere vincultar a una tabla de la bdd
    clientes: string = '3000+';
    empresasAfiliadas: string = '100+';
    llamadosLaborales: string = '13.500+';
    recomendaciones: string = '1000+';
    utusAfiliadas: string = '5';
    operadoresActivos: string = '40+';

    constructor(private router: Router, private route: ActivatedRoute) {
        initFlowbite();
    }

    ngOnInit() {
        this.route.fragment.subscribe((fragment: string | null) => {
            if (fragment) {
                const element = document.getElementById(fragment);
                if (element) {
                    window.scrollTo({
                        top: element.offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
}