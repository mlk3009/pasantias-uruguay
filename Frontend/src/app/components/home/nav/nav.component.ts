import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';

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
  public register: boolean = false;

  public emprise = false;
  public scroll_var = true;

  constructor(
    private viewportScroller: ViewportScroller,
    private _userService: UserService,
    private _cookieService: CookieService
  ) {
    this.token = this._cookieService.get('token');
  }

  ngOnInit() {
    if (this.token) {
      this.register = true;

      this._userService.obtenerUsuario(this.token).subscribe(
        response => {
          this.username = response.data.name;
        },
        error => {
          console.log(<any>error);
        }
      );
    }
    initFlowbite();
  }

  changeDropdown() {
    this.dropdown = !this.dropdown;
  }

  logout() {
    this._cookieService.delete('token');
    this.register = false;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollPosition = this.viewportScroller.getScrollPosition();
    console.log(scrollPosition[1]);
    // Decide qué opción del menú debería estar activa
    if (scrollPosition[1] == 0) {
      this.scroll_var = true;
      console.log(scrollPosition[1]);
    } else {
      this.scroll_var = false;
      console.log(scrollPosition[1]);
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
}