import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { NavigationExtras } from '@angular/router';
import { filter } from 'rxjs/operators';

import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements AfterViewInit {
  isDropdownVisible = false;
  public token: string = '';
  public username: string = '';
  public dropdown = false;
  public currentRoute: string = '';

  public emprise = false;
  public scroll_var = true;
  

  public data = { name: '', surname: '', email: '', password: '', location: '', ci_estudiante: '', cod_postal: '', fec_nacimiento: '', phone: '', rol: '', cv: '' };

  constructor(
    private viewportScroller: ViewportScroller,
    private _userService: UserService,
    private _cookieService: CookieService,
    private _router: Router,
    private router: Router,
  ) {
    this.token = this._cookieService.get('token');
    this.currentRoute = this.router.url;
    
    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    if (this.token) {
      this._userService.obtenerUsuario(this.token).subscribe(
        response => {
          this.username = response.data.name;
          this.data = response.data;
        },
        error => {
          console.log(<any>error);
        }
      );
    }
    

    initFlowbite();
  }

  open_profile() {
    const navigationExtras: NavigationExtras = {
      state: {
        name: this.data.name,
        ci_estudiante: this.data.ci_estudiante,
        email: this.data.email,
        location: this.data.location,
        cod_postal: this.data.cod_postal,
        phone: this.data.phone,
        day: this.data.fec_nacimiento.split('-')[2],
        month: this.data.fec_nacimiento.split('-')[1],
        year: this.data.fec_nacimiento.split('-')[0],
        rol: this.data.rol,
        cv: this.data.cv
      }
    };

    this._router.navigate(['/user-profile'], navigationExtras);
  }

  get isLoggedIn() {
    const token = this._cookieService.get('token') || localStorage.getItem('token');
    return !!token;
  }

  changeDropdown() {
    this.dropdown = !this.dropdown;
  }

  logout() {
    this._userService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
      },
      error => {
        console.error('Logout error', error);
      }
    );
  
    this._cookieService.delete('token');
    this._router.navigate(['/inicio']).then(() => {
      window.location.reload();
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollPosition = this.viewportScroller.getScrollPosition();
    // Decide qué opción del menú debería estar activa
    if (scrollPosition[1] == 0) {
      this.scroll_var = true;
    } else {
      this.scroll_var = false;
    }
  }

  ngAfterViewInit(): void {
    // Selecciona el botón con el atributo data-dial-toggle
    const dialToggleButton = document.querySelector('[data-dial-toggle="speed-dial-menu-dropdown-alternative"]');

    // Asegúrate de que el botón exista
    if (dialToggleButton) {
      // Agrega un evento de clic al botón
      dialToggleButton.addEventListener('click', () => {
        // Selecciona el menú correspondiente usando el valor de aria-controls
        const menuId = dialToggleButton.getAttribute('aria-controls');
        if (menuId) { // Verifica que menuId no sea null
          const menu = document.getElementById(menuId);

          if (menu) {
            // Alterna la visibilidad del menú
            const isExpanded = dialToggleButton.getAttribute('aria-expanded') === 'true';
            dialToggleButton.setAttribute('aria-expanded', (!isExpanded).toString());
            menu.classList.toggle('hidden'); // Alterna la clase 'hidden' para mostrar/ocultar el menú
          }
        }
      });
    }
  }

  moveTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    } else {
      this.router.navigate(['/ruta-del-componente'], { fragment: section });
    }
  }

  showMenu(menuId: string) {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.classList.remove('hidden');
    }
  }
  
  hideMenu(menuId: string) {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.classList.add('hidden');
    }
  }
  
  toggleMenu(menuId: string, dialToggleButton: HTMLElement) {
    if (menuId) { // Verifica que menuId no sea null
      const menu = document.getElementById(menuId);
  
      if (menu) {
        // Alterna la visibilidad del menú
        const isExpanded = dialToggleButton.getAttribute('aria-expanded') === 'true';
        dialToggleButton.setAttribute('aria-expanded', (!isExpanded).toString());
        if (isExpanded) {
          this.hideMenu(menuId);
        } else {
          this.showMenu(menuId);
        }
      }
    }
  }

  navigateToPublications() {
    this.router.navigate(['/publications']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#hide') && !target.closest('#dropdown-container')) {
      this.isDropdownVisible = false;
    }
  }


  modal(){
    const modal = document.getElementById('shopModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('shopModal') as HTMLElement;
    modal.style.display = 'none';
  }

  isActiveRoute(route: string): boolean {
    if (route === 'inicio') {
      return this.currentRoute === '/' || this.currentRoute === '/inicio' || this.currentRoute.startsWith('/inicio');
    }
    if (route === 'abaut-us') {
      return this.currentRoute.startsWith('/abaut-us');
    }
    if (route === 'publications') {
      return this.currentRoute.startsWith('/publications');
    }
    return false;
  }

  navigateToContact() {
    // Navegar a /inicio primero
    this.router.navigate(['/inicio']).then(() => {
      // Esperar y hacer scroll hacia el área de contacto (no completamente al final)
      setTimeout(() => {
        // Calcular una posición que sea aproximadamente el 80% de la página
        const scrollPosition = document.body.scrollHeight * 0.8;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
        console.log('Scroll ejecutado a posición:', scrollPosition);
      }, 500);
    });
  }

  navigateToInicio() {
    if (this.currentRoute === '/' || this.currentRoute === '/inicio') {
      // Si ya estamos en inicio, solo hacer scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si estamos en otra página, navegar a inicio
      this.router.navigate(['/inicio']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  navigateToAboutUs() {
    if (this.currentRoute.startsWith('/abaut-us')) {
      // Si ya estamos en nosotros, solo hacer scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si estamos en otra página, navegar a nosotros
      this.router.navigate(['/abaut-us']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

}
