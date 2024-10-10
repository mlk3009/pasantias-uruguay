import { Component } from '@angular/core';
import { Router, RouterModule, NavigationExtras } from '@angular/router';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, etiqueta } from '../../../services/user.service';
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
  public etiquetas: etiqueta[] = [];
  public selectedEtiquetaId: number | null = null;

  public day: number = 0;
  public month: number = 0;
  public year: number = 0;

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog
  ) {
    this.user = new User(0, '', '', '', '', '', '', '', '');
    const navigation = this._router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      this.user["name"] = state["name"].split(' ')[0];
      this.surName = state["surname"];
      this.user["email"] = state["email"];
      this.user["password"] = state["password"];
      this.confirmPassword = state["password"];
      this.user["location"] = state["location"];
      this.selectedEtiquetaId = state["selectedEtiquetaId"];

      this.user["ci_estudiante"] = state["ci"] || '';
      this.user["cod_postal"] = state["cod_postal"] || '';
      this.user["phone"] = state["phone"] || '';
      this.day = state["day"];
      this.month = state["month"];
      this.year = state["year"];
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

    this.getEtiquetas();
  }

  getEtiquetas(): void {
    this._userService.getEtiquetas().subscribe(
      response => {
        this.etiquetas = response;
      },
      error => {
        console.error('Error al obtener las etiquetas', error);
      }
    );
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
        surname: this.surName,
        email: this.user.email,
        password: this.user.password,
        confirmPassword: this.confirmPassword,
        location: this.user.location,
        selectedEtiquetaId: this.selectedEtiquetaId,

        ci: this.user.ci_estudiante,
        cod_postal: this.user.cod_postal,
        phone: this.user.phone,
        day: this.day,
        month: this.month,
        year: this.year
      }
    };

    this._router.navigate(['register-p2'], navigationExtras);
  }

}