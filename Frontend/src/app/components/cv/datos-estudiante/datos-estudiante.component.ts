import { Component, Output } from '@angular/core';
import { Estudiante } from '../../../models/cv';
import { Form, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-datos-estudiante',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './datos-estudiante.component.html'
})
export class DatosEstudianteComponent {
  public token: any;

  public age: any = '...';

  public firstname: string = '';
  public lastname: string = '';

  public bornDay: any;
  public bornMonth: any;
  public bornYear: any;

  public validDate: boolean = true;

  public valid: boolean = false;


  public credencial_en_tramite: boolean = false;

  public studentData: Estudiante = {} as Estudiante;

  public getStudentData: any;

  constructor(
    private _userService: UserService,
    private servicioCv: CvService,
    private route: ActivatedRoute
  ) {
    this.token = this._userService.getToken();

    if (localStorage.getItem('studentData')) {
      this.getLocalStorage();
    }
  }

  validateDate() {
    const isValidDay = this.bornDay >= 1 && this.bornDay <= 31;
    const isValidMonth = this.bornMonth >= 1 && this.bornMonth <= 12;
    const isValidYear = this.bornYear >= 1900;

    if (isValidDay && isValidMonth && isValidYear) {
      const daysInMonth = new Date(this.bornYear, this.bornMonth, 0).getDate();
      const isValidDayInMonth = this.bornDay <= daysInMonth;

      if (isValidDayInMonth) {
        const today = new Date();
        const realMonth = today.getMonth() + 1;
        const birthDate = new Date(
          this.bornYear,
          this.bornMonth - 1,
          this.bornDay
        );
        this.age = today.getFullYear() - birthDate.getFullYear();

        if (
          realMonth < this.bornMonth ||
          (realMonth === this.bornMonth && today.getDate() < this.bornDay)
        ) {
          this.age--;
        }

        this.validDate = this.age > 0 && this.age < 100;

        if (this.validDate === false) {
          this.age = '...';
        }
      } else {
        this.age = '...';
        this.validDate = false;
      }
    } else {
      this.age = '...';
      this.validDate = false;
    }
  }

  checkValidity(boolean: boolean) {
    if (boolean) {
      this.valid = false;
    } else {
      this.valid = true;
    }
  }

  capitalize(sentence: string): string {

    if (!sentence) {
      return '';
    }

    const words = sentence.split(' ');

    const capitalizedWords = words.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return firstLetter + rest;
    });

    const capitalizedSentence = capitalizedWords.join(' ');

    return capitalizedSentence;
  }

  getLocalStorage() {
    this.getStudentData = localStorage.getItem('studentData');
    this.getStudentData = JSON.parse(this.getStudentData);

    this.firstname = localStorage.getItem('firstName') || '';
    this.lastname = localStorage.getItem('lastName') || '';

    this.studentData.nombre_completo = this.getStudentData.nombre_completo || '';
    this.studentData.fecha_nacimiento = this.getStudentData.fecha_nacimiento || '';
    this.studentData.genero = this.getStudentData.genero || '';
    this.studentData.estado_civil = this.getStudentData.estado_civil || '';
    this.studentData.licencia = this.getStudentData.licencia || '';
    this.studentData.cedula = this.getStudentData.cedula || '';


    if(this.getStudentData.credencial_civica == 'En trámite'){
      this.credencial_en_tramite = true;
    } else {
      this.studentData.credencial_civica = this.getStudentData.credencial_civica || '';
    }
    this.studentData.email = this.getStudentData.email || '';
    this.studentData.cel = this.getStudentData.cel || '';

    this.bornDay = localStorage.getItem('bornDay') || '';
    this.bornMonth = localStorage.getItem('bornMonth') || '';
    this.bornYear = localStorage.getItem('bornYear') || '';
  }

  localStorageSave() {
    localStorage.removeItem('studentData');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('borDay');
    localStorage.removeItem('borMonth');
    localStorage.removeItem('borYear');


    if(this.credencial_en_tramite){
      this.studentData.credencial_civica = 'En trámite';
    }

    if(this.studentData.credencial_civica == undefined){
      this.studentData.credencial_civica = 'No tiene';
    }

    if(this.studentData.licencia == undefined){
      this.studentData.licencia = 'No tiene';
    }

    localStorage.setItem('studentData', JSON.stringify(this.studentData));

    localStorage.setItem('firstName', this.firstname);
    localStorage.setItem('lastName', this.lastname);

    localStorage.setItem('bornDay', this.bornDay);
    localStorage.setItem('bornMonth', this.bornMonth);
    localStorage.setItem('bornYear', this.bornYear);
  }

  next() {
    this.firstname = this.capitalize(this.firstname);
    this.lastname = this.capitalize(this.lastname);

    this.studentData.nombre_completo = this.firstname + ' ' + this.lastname;
    this.studentData.fecha_nacimiento =
      this.bornYear + '-' + this.bornMonth + '-' + this.bornDay;
    this.studentData.genero = this.capitalize(
      this.studentData.genero
    );
    this.studentData.estado_civil = this.capitalize(
      this.studentData.estado_civil
    );

    this.localStorageSave();
    this.servicioCv.change.emit({ data: 2 });
  }
}
