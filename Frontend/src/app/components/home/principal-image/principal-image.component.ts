
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { PublicationService } from '../../../services/publication.service';

@Component({
    selector: 'app-principal-image',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterModule,
        FormsModule
    ],
    templateUrl: './principal-image.component.html',
    styleUrls: ['./principal-image.component.css']
})
export class PrincipalImageComponent implements OnInit {
    clientes: string = '3000+';
    empresasAfiliadas: string = '100+';
    llamadosLaborales: string = '13.500+';
    recomendaciones: string = '1000+';
    utusAfiliadas: string = '5';
    operadoresActivos: string = '40+';

    isDropdownOpen = false;
    selectedLugar: string = 'Lugar';
    departamentos: string[] = [
        'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida',
        'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera',
        'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private publicationService: PublicationService
    ) {
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

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    selectLugar(dep: string) {
        this.selectedLugar = dep;
        this.isDropdownOpen = false;
    }

    buscarPublicaciones(params: any) {
        if (!params.location || params.location === 'Lugar') {
            delete params.location;
        }
        this.publicationService.setFiltered(true);
        this.publicationService.searchPublications(params).subscribe({
            next: () => {
                const sub = this.publicationService.publications$.subscribe((result: any[] = []) => {
                    if (!result || result.length === 0) {
                        sub.unsubscribe();
                        return;
                    }
                    sub.unsubscribe();
                    this.router.navigate(['/publications-in']).then(() => {
                        setTimeout(() => {
                            const el = document.getElementById('top');
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 300);
                    });
                });
            },
            error: (err: any) => {
                if (err && err.message && err.message.includes('No se encontraron publicaciones')) {
                    this.showAlertCustom('No se encontraron resultados');
                }
            }
        });
    }

    showAlertCustom(message: string): void {
        const modal = document.getElementById('alert-container-custom') as HTMLElement;
        const msgSpan = document.getElementById('alert-custom-message') as HTMLElement;
        if (modal && msgSpan) {
            msgSpan.textContent = message;
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
            setTimeout(() => {
                modal.classList.remove('fade-in');
                modal.classList.add('fade-out');
                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.classList.remove('fade-out');
                }, 500);
            }, 2000);
        }
    }
}