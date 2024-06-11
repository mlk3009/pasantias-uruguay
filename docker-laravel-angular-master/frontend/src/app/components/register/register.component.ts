import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { User } from '../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { HttpClientModule } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { routes } from '../../app.routes';
import { CookieService } from 'ngx-cookie-service';

import { ValidAcountComponent } from '../register/valid-acount/valid-acount.component';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [UserService],
})
export class RegisterComponent {
  public user: User;
  public token: any;
  public confirmPassword: any;
  public status: string = '';
  public showError: boolean = false;

  public loading: boolean = false;

  public inputType: string = 'password';
  public inputType2: string = 'password';



  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog
  ) {
    this.user = new User(0, '', '', '');
  }

  capitalize(sentence: string): string {
    const words = sentence.split(' ');

    const capitalizedWords = words.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return firstLetter + rest;
    });

    const capitalizedSentence = capitalizedWords.join(' ');

    return capitalizedSentence;
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
  showPassword2() {
    return (this.inputType2 =
      this.inputType2 === 'password' ? 'text' : 'password');
  }


  
  register(form: any) {
    this.user.name = this.capitalize(this.user.name);
    this.user.email = this.user.email.toLowerCase();

    this.loading = true;

    this._userService.register(this.user).subscribe(
      (response) => {
        this.loading = false;
        //validar email
        localStorage.setItem('email', this.user.email);
        this.dialog.open(ValidAcountComponent);
      },
      (error) => {
        this.loading = false;
        this.showError = true;

        if (
          error.status == 400 ||
          error.status == 401 ||
          error.status == 404 ||
          error.status == 500
        ) {
          this.status = 'Error al registrar usuario';
        } else if (error.status == 422) {
          this.status = 'El correo ya está registrado';
        } else if (error.status == 0) {
          this.status = 'Error de conexión';
        }
      }
    );
  }
}
