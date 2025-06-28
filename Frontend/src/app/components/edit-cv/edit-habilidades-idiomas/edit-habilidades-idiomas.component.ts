import { Component, OnInit, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-habilidades-idiomas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './edit-habilidades-idiomas.component.html',
  styleUrls: ['./edit-habilidades-idiomas.component.css']
})
export class EditHabilidadesIdiomasComponent implements OnInit {
  public token: any;
  public idiomas: any[] = [];
  public habilidades: any[] = [];
  public onSave = new EventEmitter<any>();
  public onCancel = new EventEmitter<any>();

  constructor(
    private _userService: UserService,
    private servicioCv: CvService,
    private route: ActivatedRoute,
    private _router: Router
  ) {
    this.token = this._userService.getToken();
  }

  ngOnInit(): void {
    this.loadDataFromEditContext();
  }

  loadDataFromEditContext(): void {
    // Intentar obtener datos desde el servicio
    const cvData = this.servicioCv.getCurrentEditData();
    console.log('Datos del CV recibidos en edit-habilidades-idiomas:', cvData);
    
    if (cvData) {
      // Cargar idiomas
      if (cvData.idiomas) {
        this.idiomas = cvData.idiomas.map((idioma: any) => ({
          idioma: idioma.idioma || '',
          nivel: idioma.nivel || 'Básico'
        }));
      }
      
      // Cargar habilidades
      if (cvData.habilidades) {
        this.habilidades = cvData.habilidades.map((habilidad: any) => ({
          habilidad: habilidad.habilidad || '',
          nivel: habilidad.nivel || 'Básico'
        }));
      }
      
      console.log('Idiomas cargados:', this.idiomas);
      console.log('Habilidades cargadas:', this.habilidades);
    } else {
      console.log('No hay datos en el servicio, intentando localStorage...');
      this.loadFromLocalStorage();
    }

    // Si no hay datos, agregar uno vacío de cada uno
    if (this.idiomas.length === 0) {
      this.addIdioma();
    }
    if (this.habilidades.length === 0) {
      this.addHabilidad();
    }
  }

  loadFromLocalStorage(): void {
    const savedIdiomas = localStorage.getItem('edit-idiomas');
    if (savedIdiomas) {
      this.idiomas = JSON.parse(savedIdiomas);
    }
    
    const savedHabilidades = localStorage.getItem('edit-habilidades');
    if (savedHabilidades) {
      this.habilidades = JSON.parse(savedHabilidades);
    }
  }

  addIdioma(): void {
    const nuevoIdioma = {
      idioma: '',
      nivel: 'Básico'
    };
    this.idiomas.push(nuevoIdioma);
  }

  removeIdioma(index: number): void {
    if (this.idiomas.length > 1) {
      this.idiomas.splice(index, 1);
    }
  }

  addHabilidad(): void {
    const nuevaHabilidad = {
      habilidad: '',
      nivel: 'Básico'
    };
    this.habilidades.push(nuevaHabilidad);
  }

  removeHabilidad(index: number): void {
    if (this.habilidades.length > 1) {
      this.habilidades.splice(index, 1);
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

    return capitalizedWords.join(' ');
  }

  saveToLocalStorage(): void {
    // Capitalizar todos los campos de texto antes de guardar
    this.idiomas.forEach(idioma => {
      if (idioma.idioma) idioma.idioma = this.capitalize(idioma.idioma);
    });

    this.habilidades.forEach(habilidad => {
      if (habilidad.habilidad) habilidad.habilidad = this.capitalize(habilidad.habilidad);
    });

    // Guardar en localStorage específico para edición
    localStorage.setItem('edit-idiomas', JSON.stringify(this.idiomas));
    localStorage.setItem('edit-habilidades', JSON.stringify(this.habilidades));
    
    console.log('Idiomas guardados en localStorage:', this.idiomas);
    console.log('Habilidades guardadas en localStorage:', this.habilidades);
  }

  saveAndGoBack(): void {
    this.saveToLocalStorage();
    
    // Emitir evento para notificar al componente padre
    this.onSave.emit({ idiomas: this.idiomas, habilidades: this.habilidades });
    
    // Notificar al servicio que se guardaron los cambios
    this.servicioCv.change.emit({ data: 'back', section: 'habilidades-idiomas' });
  }

  nextSection(): void {
    this.saveToLocalStorage();
    
    // Notificar al servicio para ir a la siguiente sección (experiencias)
    this.servicioCv.change.emit({ data: 'next', section: 'experiencias' });
  }
}
