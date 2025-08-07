import { Component, OnInit, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-educacion',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './edit-educacion.component.html',
  styleUrls: ['./edit-educacion.component.css']
})
export class EditEducacionComponent implements OnInit {
  // Validación: todos los campos requeridos deben estar completos, excepto descripción
  isFormValid(): boolean {
    return this.estudios.every(estudio =>
      estudio.nivel.trim() !== '' &&
      estudio.institucion.trim() !== '' &&
      estudio.titulo.trim() !== '' &&
      estudio.fecha_inicio.trim() !== ''
    );
  }
  public token: any;
  public estudios: any[] = [];
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
    // ...eliminado log...
    
    if (cvData && cvData.educacion) {
      this.estudios = cvData.educacion.map((edu: any) => ({
        nivel: edu.nivel || '',
        institucion: edu.institucion || '',
        titulo: edu.titulo || '',
        fecha_inicio: edu.fecha_inicio || '',
        fecha_fin: edu.fecha_fin || '',
        actualmente: edu.actualmente || false,
        fin_estimado: edu.fin_estimado || '',
        descripcion: edu.descripcion || ''
      }));
      
      // ...eliminado log...
    } else {
      // ...eliminado log...
      this.loadFromLocalStorage();
    }

    // Si no hay estudios, agregar uno vacío
    if (this.estudios.length === 0) {
      this.addEstudio();
    }
  }

  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('edit-educacion');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.estudios = parsedData || [];
    }
  }

  addEstudio(): void {
    const nuevoEstudio = {
      nivel: '',
      institucion: '',
      titulo: '',
      fecha_inicio: '',
      fecha_fin: '',
      actualmente: false,
      fin_estimado: '',
      descripcion: ''
    };
    this.estudios.push(nuevoEstudio);
  }

  removeEstudio(index: number): void {
    if (this.estudios.length > 1) {
      this.estudios.splice(index, 1);
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
    this.estudios.forEach(estudio => {
      if (estudio.titulo) estudio.titulo = this.capitalize(estudio.titulo);
      if (estudio.institucion) estudio.institucion = this.capitalize(estudio.institucion);
      if (estudio.descripcion) estudio.descripcion = this.capitalize(estudio.descripcion);
    });

    // Guardar en localStorage específico para edición
    localStorage.setItem('edit-educacion', JSON.stringify(this.estudios));
    
    // ...eliminado log...
  }

  saveAndGoBack(): void {
    if (this.isFormValid()) {
      this.saveToLocalStorage();
      this.onSave.emit(this.estudios);
      this.servicioCv.change.emit({ data: 'back', section: 'educacion' });
    }
  }

  nextSection(): void {
    if (this.isFormValid()) {
      this.saveToLocalStorage();
      this.servicioCv.change.emit({ data: 'next', section: 'habilidades-idiomas' });
    }
  }
}
