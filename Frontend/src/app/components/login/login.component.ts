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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
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

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog
  ) {
    this.user = new User(0, '', '', '', '','', '','');
  }

  ngOnInit() {
    if (this._cookieService.get('token')) {
      this._router.navigate(['/inicio']);
    }
  }

  showPassword() {
    return (this.inputType =
      this.inputType === 'password' ? 'text' : 'password');
  }

  login(form: any) {
    this.loading = true;
    this._userService.login(this.user).subscribe(
      (loginResponse) => {
        const token = loginResponse.token;
        this._cookieService.set('token', token);
        localStorage.setItem('email', this.user.email);
  
        // Acá llamé a la de obtenerUsuario para poder verificar si el email está verificado, usé como parametro el token del login
        this._userService.obtenerUsuario(token).subscribe(
          (userResponse) => {
            this.loading = false;

            
            if (userResponse.data.email_verified_at !== null) {
              this._router.navigate(['/inicio']);
            } else {
              this.dialog.open(ValidAcountComponent);
            }
          },
          (error) => {
            this.loading = false;
            console.error(error);
          }
        );
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
