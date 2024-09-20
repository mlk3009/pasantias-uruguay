import { Component } from '@angular/core';
import { Idioma, Habilidad } from '../../../models/cv';
import { Form, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';

@Component({
  selector: 'app-datos-habilidades-idiomas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './datos-habilidades-idiomas.component.html'
})
export class DatosHabilidadesIdiomasComponent {
  public token: any;

  public getIdiomasData: any;
  public getHabilidadesData: any;

  public idiomasReady: boolean = false;
  public habilidadesReady: boolean = false;

  idiomas: Idioma[] = [{ idioma: '', nivel: '' }];
  habilidades: Habilidad[] = [{ habilidad: '', nivel: '' }];

  constructor(
    private _userService: UserService,
    private CvService: CvService
  ) {
    this.token = this._userService.getToken();

    if (localStorage.getItem('idiomasData')) {
      this.getLocalStorage();
    }

    if (localStorage.getItem('habilidadesData')) {
      this.getLocalStorage();
    }
  }

  addIdioma() {
    this.idiomas.push({  idioma: '', nivel: '' });
  }

  removeIdioma(index: number) {
    this.idiomas.splice(index, 1);
    if (this.idiomas.length == 0) {
      this.addIdioma();
    }
  }

  idiomasReadyCheck() {
    if (this.idiomas[this.idiomas.length - 1].idioma == '') {
      this.idiomas.pop();
    }
    this.idiomasReady = true;
  }

  idiomasAdd() {
    this.idiomasReady = false;
    this.idiomas.push({  idioma: '', nivel: ''});
  }

  addHabilidad() {
    this.habilidades.push({ habilidad: '', nivel: '' });
  }

  removeHabilidad(index: number) {
    this.habilidades.splice(index, 1);
    if (this.habilidades.length == 0) {
      this.addHabilidad();
    }
  }

  habilidadReadyCheck() {
    if (this.habilidades[this.habilidades.length - 1].habilidad == '') {
      this.habilidades.pop();
    }
    this.habilidadesReady = true;
  }

  habilidadAdd() {
    this.habilidadesReady = false;
    this.habilidades.push({ habilidad: '', nivel: '' });
  }


  getLocalStorage() {
    this.getIdiomasData = localStorage.getItem('idiomasData');
    this.getIdiomasData = JSON.parse(this.getIdiomasData);
    this.idiomas = this.getIdiomasData;

    this.getHabilidadesData = localStorage.getItem('habilidadesData');
    this.getHabilidadesData = JSON.parse(this.getHabilidadesData);
    this.habilidades = this.getHabilidadesData;

    this.idiomasReady = true;
    this.habilidadesReady = true;
  }

  localStorageSave() {
    localStorage.setItem('idiomasData', JSON.stringify(this.idiomas));
    localStorage.setItem('habilidadesData', JSON.stringify(this.habilidades));
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
    for (let i = 0; i < this.idiomas.length; i++) {
      this.idiomas[i].idioma = this.capitalize(this.idiomas[i].idioma);
    }

    for (let i = 0; i < this.habilidades.length; i++) {
      this.habilidades[i].habilidad = this.capitalize(this.habilidades[i].habilidad);
    }

    this.localStorageSave();
    this.CvService.change.emit({ data: 2 });
  }

  next() {
    for (let i = 0; i < this.idiomas.length; i++) {
      this.idiomas[i].idioma = this.capitalize(this.idiomas[i].idioma);
    }
    for (let i = 0; i < this.habilidades.length; i++) {
      this.habilidades[i].habilidad = this.capitalize(this.habilidades[i].habilidad);
    }

    this.localStorageSave();
    this.CvService.change.emit({ data: 4 });
  }

}