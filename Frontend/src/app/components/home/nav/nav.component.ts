import { Component } from '@angular/core';
import { CommonModule, ViewportScroller  } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { HostListener } from '@angular/core';

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
  styleUrl: './nav.component.css'
})
export class NavComponent {

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
    console.log(scrollPosition[1])
    // De cide qué opción del menú debería estar activa
    if (scrollPosition[1] == 0) {
      this.scroll_var = true;
      console.log(scrollPosition[1])
    }
    else { this.scroll_var = false;
      console.log(scrollPosition[1])
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll2(event: Event): void {
    const scrollPosition = this.viewportScroller.getScrollPosition();
    console.log(scrollPosition[1])
    // De cide qué opción del menú debería estar activa
    if (scrollPosition[1] == 0) {
      this.scroll_var = true;
      console.log(scrollPosition[1])
    }
    else { this.scroll_var = false;
      console.log(scrollPosition[1])
    }
  }
}
