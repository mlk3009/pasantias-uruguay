import { Component } from '@angular/core';
import { Educacion } from '../../../models/cv';
import { Form, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';

@Component({
  selector: 'app-educacion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './datos-estudios.component.html'
})
export class DatosEstudiosComponent {
  public token: any;

  public getEstudiosData: any;

  public estudiosReady: boolean = false;

  Estudios: Educacion[] = [{ nivel: '', institucion: '', titulo: '', fecha_inicio: '', fecha_fin: '', actualmente: false, fin_estimado: '', descripcion: '' }];


  constructor(
    private _userService: UserService,
    private servicioCv: CvService
  ) {
    this.token = this._userService.getToken();

    if (localStorage.getItem('estudiosData')) {
      this.getLocalStorage();
      this.estudioReadyCheck();
    }
  }

  ngOnInit(): void {
  }

  addEstudio() {
    this.Estudios.push({  nivel: '', institucion: '', titulo: '', fecha_inicio: '', fecha_fin: '', actualmente: false, fin_estimado: '', descripcion: ''});
  }

  removeEstudio(index: number) {
    this.Estudios.splice(index, 1);
    if (this.Estudios.length == 0) {
      this.addEstudio();
    }
  }

  estudioReadyCheck() {
    if (this.Estudios[this.Estudios.length - 1].nivel == '') {
      this.Estudios.pop();
    }
    this.estudiosReady = true;
  }

  estudiosAdd() {
    this.estudiosReady = false;
    this.Estudios.push({  nivel: '', institucion: '', titulo: '', fecha_inicio: '', fecha_fin: '', actualmente: false, fin_estimado: '', descripcion: '' });
  }

  getLocalStorage() {
    this.getEstudiosData = localStorage.getItem('estudiosData');
    this.getEstudiosData = JSON.parse(this.getEstudiosData);
    this.Estudios = this.getEstudiosData;
  }

  localStorageSave() {
    localStorage.setItem('estudiosData', JSON.stringify(this.Estudios));
  }

  capitalize(sentence: string): string {
    if (!sentence) {
      return '';
    }
    const words = sentence.split(' ');

    const capitalizedWords = words.map(word => {
      const firstLetter = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return firstLetter + rest;
    });

    const capitalizedSentence = capitalizedWords.join(' ');

    return capitalizedSentence;
  }


  back() {
    for (let i = 0; i < this.Estudios.length; i++) {
      this.Estudios[i].institucion = this.capitalize(this.Estudios[i].institucion);
      this.Estudios[i].titulo = this.capitalize(this.Estudios[i].titulo);
    }

    this.localStorageSave();
    this.servicioCv.change.emit({ data: 2 });
  }

  next() {
    for (let i = 0; i < this.Estudios.length; i++) {
      this.Estudios[i].institucion = this.capitalize(this.Estudios[i].institucion);
      this.Estudios[i].titulo = this.capitalize(this.Estudios[i].titulo);
    }

    this.localStorageSave();
    this.servicioCv.change.emit({ data: 3 });
  }

}



