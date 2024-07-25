import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { routes } from '../../../app.routes';
import { CookieService } from 'ngx-cookie-service';

import { ValidAcountComponent } from '../../register/valid-acount/valid-acount.component';

@Component({
  selector: 'app-register-p2',
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
  templateUrl: './register-p2.component.html',
  styleUrl: './register-p2.component.css'
})
export class RegisterP2Component {
  public user: User;
  public token: any;
  public status: string = '';
  public showError: boolean = false;
  public loading: boolean = false;



  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.user = new User(0, '', '', '', '','', '','');

    const navigation = this._router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as User;
      this.user = new User(
        state.id || 0,
        state.name || '',
        state.email || '',
        state.password || '',
        state.location || '',
        state.ci_estudiante || '',
        state.phone || '',
        state.cod_postal || ''
      );
    } 
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



  
  register(form: any) {

    this.user.password;
    this.user.name = this.capitalize(this.user.name);
    this.user.email = this.user.email.toLowerCase();
    this.user.location;
    this.user.ci_estudiante;
    this.user.cod_postal;
    this.user.phone;
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
          this.status = 'Error en el servidor';
        } else {
          this.status = 'Error desconocido';
        }
      }
    );
  }
}
