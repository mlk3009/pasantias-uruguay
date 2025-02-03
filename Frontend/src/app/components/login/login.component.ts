import { Component } from '@angular/core';
import { User } from '../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ValidAcountComponent } from '../register/valid-acount/valid-acount.component';

import { routes } from '../../app.routes';

import { CookieService } from 'ngx-cookie-service';

import { NavComponent } from '../home/nav/nav.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NavComponent,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatDialogModule,
    ValidAcountComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [UserService],
})
export class LoginComponent {
  public user: User;
  public status: string = '';
  public loading: boolean = false;
  public showError: boolean = false;
  public inputType: string = 'password';
  public rememberMe: boolean = false; // Nueva propiedad

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog
  ) {
    this.user = new User(0, '', '', '', '','', '','','','');
  }

  ngOnInit() {
    const token = this._cookieService.get('token') || localStorage.getItem('token');
    if (token) {
      this._router.navigate(['/inicio']);
    }
  }

  showPassword() {
    return (this.inputType =
      this.inputType === 'password' ? 'text' : 'password');
  }
  get isLoggedIn() {
    const token = this._cookieService.get('token') || localStorage.getItem('token');
    return !!token;
  }
  login(form: any) {
    this.loading = true;
    this._userService.login(this.user).subscribe(
      (loginResponse) => {
        const token = loginResponse.token;
        if (this.rememberMe) {
          localStorage.setItem('token', token);
        } else {
          this._cookieService.set('token', token);
        }
        localStorage.setItem('email', this.user.email);

        return this._router.navigate(['/']);
      },
      (error) => {
        this.loading = false;
        if (
          error.status == 400 ||
          error.status == 401 ||
          error.status == 404 ||
          error.status == 500
        ) {
          if (error.error.message === 'Email not verified') {
            this.showError = true;
            this.status = 'Esta cuenta necesita verificarse primero';
          } else {
            this.showError = true;
            this.status = 'Usuario o contraseña incorrectos';
          }
        } else if (error.status == 0) {
          this.showError = true;
          this.status = 'Error de conexión';
        }
      }
    );
  }
}