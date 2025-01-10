import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { NavigationExtras } from '@angular/router';
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
  public year: number = 0;
  public month: number = 0;
  public day: number = 0;
  public validDate: boolean = false;
  public selectedEtiquetaId: number | null = null;

  public surName: string = '';

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.user = new User(0, '', '', '', '', '', '', '', '', '');
    const navigation = this._router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      this.surName = state["surname"];
      this.user["name"] = state["name"];
      this.user["email"] = state["email"];
      this.user["password"] = state["password"];
      this.user["location"] = state["location"];
      this.selectedEtiquetaId = state["selectedEtiquetaId"];

      this.user.ci_estudiante = state["ci"] || '';
      this.user.cod_postal = state["cod_postal"] || '';
      this.user.phone = state["phone"] || '';
      this.day = state["day"] || 0;
      this.month = state["month"] || 0;
      this.year = state["year"] || 0;
      this.validateDate();
    }
  }

  validateDate() {
    const isValidDay = this.day >= 1 && this.day <= 31;
    const isValidMonth = this.month >= 1 && this.month <= 12;
    const isValidYear = this.year >= 1900;

    if (isValidDay && isValidMonth && isValidYear) {
      const daysInMonth = new Date(this.year, this.month, 0).getDate();
      const isValidDayInMonth = this.day <= daysInMonth;

      if (isValidDayInMonth) {
        const today = new Date();
        const realMonth = today.getMonth() + 1;
        const birthDate = new Date(
          this.year,
          this.month - 1,
          this.day
        );

        this.validDate = true;
      } else {
        this.validDate = false;
      }
    } else {
      this.validDate = false;
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

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this._userService.storeImage(file).subscribe(
        response => {
          console.log('Imagen cargada exitosamente', response);
          this.user.id_image = response.id;
        },
        error => {
          console.error('Error al cargar la imagen', error);
        }
      );
    }
  }
  

  addUserTag(estudiante_id: number, etiqueta_id: number): void {
    this._userService.addUserTags(estudiante_id, etiqueta_id).subscribe(
      response => {
        console.log('Etiqueta agregada correctamente:', response);
      },
      error => {
        console.error('Error al agregar la etiqueta:', error);
      }
    );
  }

  volver() {
    const navigationExtras: NavigationExtras = {
      state: {
        surname: this.surName,
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        confimPassword: this.user.password,
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

    this._router.navigate(['register'], navigationExtras);
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
    this.user.fec_nacimiento = this.year.toString() + '-' + this.month.toString() + '-' + this.day.toString();

    console.log(this.user);


    this._userService.register(this.user).subscribe(
      (response) => {
        this.loading = false;
        localStorage.setItem('email', this.user.email);
        // this.dialog.open(ValidAcountComponent);

        const estudiante_id = response.data.id;
        const etiqueta_id = this.selectedEtiquetaId;
        if (estudiante_id && etiqueta_id) {
          this.addUserTag(estudiante_id, etiqueta_id);
        } else {
          console.error('Estudiante ID o Etiqueta ID no están disponibles');
        }

       return this._router.navigate(['/']);
      },
      (error) => {
        console.log(error.error.failed_input);
        let errorList = error.error.failed_input;

        for (let err in errorList) {
          if (err == 'email'){
            this.status = 'El email ya se encuentra registrado';
          }

          if (err == 'ci_estudiante') {
            this.status += ' La cédula ya se encuentra registrada';
          }
        }

        console.error('Error al registrar el usuario', error);
        this.loading = false;
        this.showError = true;
      }
    );
  }
}
