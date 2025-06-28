import { Component, OnInit, EventEmitter } from '@angular/core';
import { Estudiante } from '../../../models/cv';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-datos-estudiante',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './edit-datos-estudiante.component.html',
  styleUrls: ['./edit-datos-estudiante.component.css']
})
export class EditDatosEstudianteComponent implements OnInit {
  public token: any;
  data: any = {};
  public credencial_en_tramite: boolean = false;
  public studentData: Estudiante = {} as Estudiante;
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
    console.log('Datos del CV recibidos en edit-datos-estudiante:', cvData);
    
    if (cvData && cvData.cv) {
      // Datos del CV
      this.studentData.nombre_completo = cvData.cv.nombre_completo || '';
      this.studentData.fecha_nacimiento = cvData.cv.fecha_nacimiento || '';
      this.studentData.genero = cvData.cv.genero || '';
      this.studentData.estado_civil = cvData.cv.estado_civil || '';
      this.studentData.licencia = cvData.cv.licencia || 'No tiene';
      
      // Datos del estudiante
      if (cvData.estudiante) {
        this.studentData.cedula = cvData.estudiante.ci_estudiante || '';
        // Para campos que no están en la respuesta, necesitamos obtenerlos del usuario
        this.loadUserData();
      }
      
      console.log('Datos del estudiante cargados:', this.studentData);
    } else {
      console.log('No hay datos del CV en el servicio, intentando localStorage...');
      // Fallback a localStorage si no hay datos en el servicio
      this.loadFromLocalStorage();
    }

    // Verificar si credencial está en trámite
    if (this.studentData.credencial_civica === 'En trámite') {
      this.credencial_en_tramite = true;
      this.studentData.credencial_civica = '';
    }
  }

  loadUserData(): void {
    // Obtener datos adicionales del usuario (email, cel, credencial_civica)
    const token = this._userService.getToken();
    if (token) {
      this._userService.obtenerUsuario(token).subscribe({
        next: (response: any) => {
          if (response.data) {
            this.studentData.email = response.data.email || '';
            this.studentData.cel = response.data.phone || '';
            // La credencial cívica puede venir del CV o estar vacía
            if (!this.studentData.credencial_civica) {
              this.studentData.credencial_civica = '';
            }
            console.log('Datos adicionales del usuario cargados:', {
              email: this.studentData.email,
              cel: this.studentData.cel
            });
          }
        },
        error: (error: any) => {
          console.error('Error obteniendo datos adicionales del usuario:', error);
        }
      });
    }
  }

  loadFromLocalStorage(): void {
    const savedData = localStorage.getItem('edit-student');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.studentData = { ...this.studentData, ...parsedData };
      console.log('Datos del estudiante cargados desde localStorage:', this.studentData);
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
    if (this.credencial_en_tramite) {
      this.studentData.credencial_civica = 'En trámite';
    }

    if (!this.studentData.credencial_civica) {
      this.studentData.credencial_civica = '';
    }

    if (!this.studentData.licencia) {
      this.studentData.licencia = 'No tiene';
    }

    // Guardar en la nueva clave de localStorage para edición
    localStorage.setItem('edit-student', JSON.stringify(this.studentData));
    
    console.log('Datos del estudiante guardados en edit-student:', this.studentData);
  }

  saveAndGoBack(): void {
    // Capitalizar campos antes de guardar
    this.studentData.nombre_completo = this.capitalize(this.studentData.nombre_completo);
    this.studentData.genero = this.capitalize(this.studentData.genero);
    this.studentData.estado_civil = this.capitalize(this.studentData.estado_civil);

    this.saveToLocalStorage();
    
    // Emitir evento para notificar al componente padre
    this.onSave.emit(this.studentData);
    
    // Notificar al servicio que se guardaron los cambios
    this.servicioCv.change.emit({ data: 'success', section: 'estudiante' });
  }

  nextSection(): void {
    // Capitalizar campos antes de guardar
    this.studentData.nombre_completo = this.capitalize(this.studentData.nombre_completo);
    this.studentData.genero = this.capitalize(this.studentData.genero);
    this.studentData.estado_civil = this.capitalize(this.studentData.estado_civil);

    this.saveToLocalStorage();
    
    // Notificar al servicio para ir a la siguiente sección (educación)
    this.servicioCv.change.emit({ data: 'next', section: 'educacion' });
  }

  goBack(): void {
    // Emitir evento de cancelación
    this.onCancel.emit();
    
    // Notificar al servicio para volver al resumen
    this.servicioCv.change.emit({ data: 'cancel' });
  }
}
