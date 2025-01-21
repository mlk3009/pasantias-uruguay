import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { NavigationExtras } from '@angular/router';

import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements AfterViewInit {

  public token: string = '';
  public username: string = '';
  public dropdown = false;

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
    this._router.navigate(['/']);

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

  

}