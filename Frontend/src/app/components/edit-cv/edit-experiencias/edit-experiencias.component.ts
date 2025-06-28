import { Component, OnInit, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-experiencias',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './edit-experiencias.component.html',
  styleUrls: ['./edit-experiencias.component.css']
})
export class EditExperienciasComponent implements OnInit {
  public token: any;
  public experiencias: any[] = [];
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
    console.log('Datos del CV recibidos en edit-experiencias:', cvData);
    
    if (cvData && cvData.experiencias) {
      this.experiencias = cvData.experiencias.map((exp: any) => ({
        puesto: exp.puesto || '',
        empresa: exp.empresa || '',
        referencias: exp.referencias || '',
        fecha_inicio: exp.fecha_inicio || '',
        fecha_fin: exp.fecha_fin || '',
        actualmente: exp.actualmente || false,
        descripcion: exp.descripcion || ''
      }));
      
      console.log('Datos de experiencias cargados:', this.experiencias);
    } else {
      console.log('No hay datos de experiencias en el servicio, intentando localStorage...');
      this.loadFromLocalStorage();
    }

    // Si no hay experiencias, agregar una vacía
    if (this.experiencias.length === 0) {
      this.addExperiencia();
    }
  }

  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('edit-experiencias');
    if (savedData) {
      this.experiencias = JSON.parse(savedData);
    }
  }

  addExperiencia(): void {
    const nuevaExperiencia = {
      puesto: '',
      empresa: '',
      referencias: '',
      fecha_inicio: '',
      fecha_fin: '',
      actualmente: false,
      descripcion: ''
    };
    this.experiencias.push(nuevaExperiencia);
  }

  removeExperiencia(index: number): void {
    if (this.experiencias.length > 1) {
      this.experiencias.splice(index, 1);
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
    this.experiencias.forEach(exp => {
      if (exp.puesto) exp.puesto = this.capitalize(exp.puesto);
      if (exp.empresa) exp.empresa = this.capitalize(exp.empresa);
      if (exp.referencias) exp.referencias = this.capitalize(exp.referencias);
      if (exp.descripcion) exp.descripcion = this.capitalize(exp.descripcion);
    });

    // Guardar en localStorage específico para edición
    localStorage.setItem('edit-experiencias', JSON.stringify(this.experiencias));
    
    console.log('Datos de experiencias guardados en localStorage:', this.experiencias);
  }

  saveAndGoBack(): void {
    this.saveToLocalStorage();
    
    // Emitir evento para notificar al componente padre
    this.onSave.emit(this.experiencias);
    
    // Notificar al servicio que se guardaron los cambios
    this.servicioCv.change.emit({ data: 'back', section: 'experiencias' });
  }

  finishEditing(): void {
    this.saveToLocalStorage();
    
    // Notificar al servicio para finalizar la edición
    this.servicioCv.change.emit({ data: 'finish', section: 'experiencias' });
  }
}
