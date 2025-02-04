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
  data: any = {};

  public age: any = '...';

  public validDate: boolean = true;

  public valid: boolean = false;

  public credencial_en_tramite: boolean = false;

  public studentData: Estudiante = {} as Estudiante;

  public getStudentData: any;

  constructor(
    private _userService: UserService,
    private servicioCv: CvService,
    private route: ActivatedRoute,
    private _router: Router
  ) {
    this.token = this._userService.getToken();

    if (localStorage.getItem('studentData')) {
      this.getLocalStorage();
    }
  }

  checkValidity(boolean: boolean) {
    this.valid = !boolean;
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

    return capitalizedWords.join(' ');
  }

  getLocalStorage() {
    this.getStudentData = localStorage.getItem('studentData');
    this.getStudentData = JSON.parse(this.getStudentData);

    this.studentData.nombre_completo = this.getStudentData.nombre_completo || '';
    this.studentData.fecha_nacimiento = this.getStudentData.fecha_nacimiento || '';
    this.studentData.genero = this.getStudentData.genero || '';
    this.studentData.estado_civil = this.getStudentData.estado_civil || '';
    this.studentData.licencia = this.getStudentData.licencia || '';
    this.studentData.cedula = this.getStudentData.cedula || '';

    if (this.getStudentData.credencial_civica == 'En trámite') {
      this.credencial_en_tramite = true;
    } else {
      this.studentData.credencial_civica = this.getStudentData.credencial_civica || '';
    }
    this.studentData.email = this.getStudentData.email || '';
    this.studentData.cel = this.getStudentData.cel || '';
  }

  localStorageSave() {
    localStorage.removeItem('studentData');

    if (this.credencial_en_tramite) {
      this.studentData.credencial_civica = 'En trámite';
    }

    if (this.studentData.credencial_civica == undefined) {
      this.studentData.credencial_civica = '';
    }

    if (this.studentData.licencia == undefined) {
      this.studentData.licencia = 'No tiene';
    }

    localStorage.setItem('studentData', JSON.stringify(this.studentData));
  }

  next() {
    this.studentData.nombre_completo = this.capitalize(this.studentData.nombre_completo);
    this.studentData.genero = this.capitalize(this.studentData.genero);
    this.studentData.estado_civil = this.capitalize(this.studentData.estado_civil);

    this.localStorageSave();
    this.servicioCv.change.emit({ data: 2 });
  }

  ngOnInit(): void {
    const token = this._userService.getToken();
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.data = response.data;
          console.log(this.data);

          // Asignar los datos obtenidos a las propiedades del componente
          this.studentData.cedula = this.data.ci_estudiante;
          this.studentData.cel = this.data.phone;
          this.studentData.email = this.data.email;
          this.studentData.fecha_nacimiento = this.data.fec_nacimiento;
          this.studentData.nombre_completo = this.data.name;
          this.studentData.genero = this.data.genero; // Asignar el género

          // Actualizar el almacenamiento local
          this.localStorageSave();
        },
        error: (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      });
    } else {
      this._router.navigate(['/login']);
    }
  }
}