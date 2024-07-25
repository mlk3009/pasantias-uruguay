import { Component } from '@angular/core';
import { Router, RouterModule, NavigationExtras } from '@angular/router';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { routes } from '../../../app.routes';
import { CookieService } from 'ngx-cookie-service';

import { ValidAcountComponent } from '../valid-acount/valid-acount.component';

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
  public surName: string = '';
  public location: any;


  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog
  ) {
    this.user = new User(0, '', '', '', '','', '','');
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
    if (this.user.password !== this.confirmPassword) {
      this.status = 'Las contraseñas no coinciden';
      this.showError = true;
      return;
    }

    this.user.name = this.capitalize(this.user.name) + ' ' + this.capitalize(this.surName);
    this.user.email = this.user.email.toLowerCase();

    const navigationExtras: NavigationExtras = {
      state: {
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        location: this.user.location
      }
    };

    this._router.navigate(['register-p2'], navigationExtras);
  }

}