import { Component } from '@angular/core';
import { Experiencia } from '../../../models/cv';
import { Form, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';

@Component({
  selector: 'app-datos-experiencias',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './experiencias.component.html'
})
export class DatosExperienciasComponent {
  public token: any;

  public getExperienciaData: any;

  public experienciasReady: boolean = false;

  Experiencias: Experiencia[] = [{ puesto: '', empresa: '',  fecha_inicio: '', fecha_fin: '', actualmente: false, descripcion: '', referencias: '' }];


  constructor(
    private _userService: UserService,
    private servicioCv: CvService
  ) {
    this.token = this._userService.getToken();

    if (localStorage.getItem('ExperienciaData')) {
      this.getLocalStorage();
      this.experienciasReadyCheck();
    }
  }

  ngOnInit(): void {
  }

  addExperiencia() {
    this.Experiencias.push({  puesto: '', empresa: '',  fecha_inicio: '', fecha_fin: '', actualmente: false, descripcion: '', referencias: '' });
  }

  removeExperiencia(index: number) {
    this.Experiencias.splice(index, 1);
    if (this.Experiencias.length == 0) {
      this.addExperiencia();
    }
  }

  experienciasReadyCheck() {
    if (this.Experiencias[this.Experiencias.length - 1].puesto == '') {
      this.Experiencias.pop();
    }
    this.experienciasReady = true;
  }

  experienciaAdd() {
    this.experienciasReady = false;
    this.Experiencias.push({  puesto: '', empresa: '',  fecha_inicio: '', fecha_fin: '', actualmente: false, descripcion: '', referencias: ''  });
  }

  getLocalStorage() {
    this.getExperienciaData = localStorage.getItem('ExperienciaData');
    this.getExperienciaData = JSON.parse(this.getExperienciaData);
    this.Experiencias = this.getExperienciaData;
  }

  localStorageSave() {
    localStorage.setItem('ExperienciaData', JSON.stringify(this.Experiencias));
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
    for (let i = 0; i < this.Experiencias.length; i++) {
      this.Experiencias[i].puesto = this.capitalize(this.Experiencias[i].puesto);
      this.Experiencias[i].empresa = this.capitalize(this.Experiencias[i].empresa);
      this.Experiencias[i].referencias = this.capitalize(this.Experiencias[i].referencias);
    }

    this.localStorageSave();
    this.servicioCv.change.emit({ data: 4 });
  }

  next() {
    for (let i = 0; i < this.Experiencias.length; i++) {
      this.Experiencias[i].puesto = this.capitalize(this.Experiencias[i].puesto);
      this.Experiencias[i].empresa = this.capitalize(this.Experiencias[i].empresa);
      this.Experiencias[i].referencias = this.capitalize(this.Experiencias[i].referencias);
    }

    this.localStorageSave();
    this.servicioCv.change.emit({ data: 5 });
  }

  omit(){
    localStorage.setItem('SinExperiencias', JSON.stringify({
      content: 'No se registraron experiencias'
    }));
    this.servicioCv.change.emit({ data: 5 });
  }
}