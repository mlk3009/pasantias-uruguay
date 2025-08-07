import { Component, HostListener, OnDestroy } from '@angular/core';
import {
  Estudiante, Idioma, Educacion, Experiencia, Habilidad, Cv,
} from '../../models/cv';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { CvService } from '../../services/cv.service';
import { DatosEstudianteComponent } from '../cv/datos-estudiante/datos-estudiante.component';
import { DatosGeneralesComponent } from '../cv/datos-generales/datos-generales.component';
import { OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EditDatosEstudianteComponent } from './edit-datos-estudiante/edit-datos-estudiante.component';
import { EditEducacionComponent } from './edit-educacion/edit-educacion.component';
import { EditHabilidadesIdiomasComponent } from './edit-habilidades-idiomas/edit-habilidades-idiomas.component';
import { EditExperienciasComponent } from './edit-experiencias/edit-experiencias.component';

@Component({
  selector: 'app-edit-cv',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DatosGeneralesComponent,
    EditDatosEstudianteComponent,
    EditEducacionComponent,
    EditHabilidadesIdiomasComponent,
    EditExperienciasComponent
  ],
  templateUrl: './edit-cv.component.html',
  styleUrls: ['./edit-cv.component.css']
})
export class EditCvComponent implements OnInit, OnDestroy {
  public token: any;
  public fichaCompleta: boolean = false;
  public formPart: number = 1;
  studentData: any;
  public cvId: string = '';
  public existingCvData: any = null;
  public cvData: any = null;
  public currentView: string = 'summary';

  constructor(
    private _userService: UserService,
    private servicioCv: CvService,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    this.token = this._userService.getToken();
    this.studentData = this.studentData;
    if (this.token == null) {
      this._router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    const modalButton = document.getElementById('modalButton');
    if (modalButton) {
      modalButton.addEventListener('click', () => this.volver());
    }
    initFlowbite();
    this.loadUserDataAndCV();
    this.servicioCv.change.subscribe((data: any) => {
      if (data.data === 'success' || data.data === 'cancel' || data.data === 'back' || data.data === 'finish') {
        this.backToSummary();
      } else if (data.data === 'next') {
        this.goToNextSection(data.section);
      } else if (typeof data.data === 'number') {
        this.formPart = data.data;
      }
    });
  }

  loadUserDataAndCV(): void {
    this._userService.obtenerUsuario(this.token).subscribe({
      next: (response: any) => {
        if (response.data && response.data.cv_id) {
          this.cvId = response.data.cv_id.toString();
          this.servicioCv.setEditMode(true, this.cvId);
          this.loadExistingCvData();
        } else {
          alert('No tienes un CV creado. Serás redirigido para crear uno nuevo.');
          this._router.navigate(['/cv']);
        }
      },
      error: (error: any) => {
        console.error('Error obteniendo datos del usuario:', error);
        this._router.navigate(['/login']);
      }
    });
  }

  loadExistingCvData(): void {
    this.servicioCv.getFicha(this.token, this.cvId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.existingCvData = response.data;
          const normalizedData = {
            ...response.data,
            experiencias: response.data.experiencia || response.data.experiencias || []
          };
          this.servicioCv.setCurrentEditData(normalizedData);
          this.loadAllDataToLocalStorage(normalizedData);
          this.loadSummaryFromLocalStorage();
        } else {
          console.error('Error en la respuesta getFicha:', response);
          alert('Error cargando los datos del CV');
        }
      },
      error: (error: any) => {
        console.error('Error cargando datos del CV:', error);
        console.error('Detalles del error:', error.error);
        alert('Error cargando los datos del CV: ' + (error.message || 'Error desconocido'));
      }
    });
  }

  loadAllDataToLocalStorage(cvData: any): void {
    if (cvData.cv || cvData.estudiante) {
      const studentData = {
        nombre_completo: cvData.cv?.nombre_completo || '',
        cedula: cvData.estudiante?.ci_estudiante || '',
        fecha_nacimiento: cvData.cv?.fecha_nacimiento || '',
        genero: cvData.cv?.genero || '',
        estado_civil: cvData.cv?.estado_civil || '',
        licencia: cvData.cv?.licencia || '',
        cel: cvData.estudiante?.cel || '',
        email: cvData.estudiante?.email || '',
        credencial_civica: cvData.estudiante?.credencial_civica || ''
      };
      localStorage.setItem('edit-student', JSON.stringify(studentData));
    }
    if (cvData.educacion && cvData.educacion.length > 0) {
      localStorage.setItem('edit-educacion', JSON.stringify(cvData.educacion));
    } else {
      localStorage.setItem('edit-educacion', JSON.stringify([]));
    }
    if (cvData.idiomas && cvData.idiomas.length > 0) {
      localStorage.setItem('edit-idiomas', JSON.stringify(cvData.idiomas));
    } else {
      localStorage.setItem('edit-idiomas', JSON.stringify([]));
    }
    if (cvData.habilidades && cvData.habilidades.length > 0) {
      localStorage.setItem('edit-habilidades', JSON.stringify(cvData.habilidades));
    } else {
      localStorage.setItem('edit-habilidades', JSON.stringify([]));
    }
    if (cvData.experiencias && cvData.experiencias.length > 0) {
      localStorage.setItem('edit-experiencias', JSON.stringify(cvData.experiencias));
    } else {
      localStorage.setItem('edit-experiencias', JSON.stringify([]));
    }
  }

  loadSummaryFromLocalStorage(): void {
    const studentData = JSON.parse(localStorage.getItem('edit-student') || '{}');
    const educacionData = JSON.parse(localStorage.getItem('edit-educacion') || '[]');
    const idiomasData = JSON.parse(localStorage.getItem('edit-idiomas') || '[]');
    const habilidadesData = JSON.parse(localStorage.getItem('edit-habilidades') || '[]');
    const experienciasData = JSON.parse(localStorage.getItem('edit-experiencias') || '[]');
    this.cvData = {
      cv: {
        nombre_completo: studentData.nombre_completo || '',
        fecha_nacimiento: studentData.fecha_nacimiento || '',
        genero: studentData.genero || '',
        estado_civil: studentData.estado_civil || '',
        licencia: studentData.licencia || ''
      },
      estudiante: {
        ci_estudiante: studentData.cedula || '',
        cel: studentData.cel || '',
        email: studentData.email || '',
        credencial_civica: studentData.credencial_civica || ''
      },
      educacion: educacionData,
      idiomas: idiomasData,
      habilidades: habilidadesData,
      experiencias: experienciasData
    };
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) { 
    this.volver();
    $event.returnValue = true;
  }

  volver() {
      this._router.navigate(['/user-profile']);
      localStorage.removeItem('studentData');
      localStorage.removeItem('cv');
      localStorage.removeItem('SinExperiencias');
      localStorage.removeItem('lastName');
      localStorage.removeItem('firstName');
      localStorage.removeItem('bornDay');
      localStorage.removeItem('bornYear');
      localStorage.removeItem('bornMonth');
      localStorage.removeItem('estudiosData');
      localStorage.removeItem('ExperienciaData');
      localStorage.removeItem('idiomasData');
      localStorage.removeItem('habilidadesData');
      localStorage.removeItem('ficha');
      localStorage.removeItem('edit-student');
      localStorage.removeItem('edit-educacion');
      localStorage.removeItem('edit-idiomas');
      localStorage.removeItem('edit-habilidades');
      localStorage.removeItem('edit-experiencias');
  }

  modal(): void {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  goToNextSection(nextSection: string): void {
    if (this.cvData) {
      this.servicioCv.setCurrentEditData(this.cvData);
    }
    switch (nextSection) {
      case 'educacion':
        this.currentView = 'educacion';
        this.formPart = 2;
        break;
      case 'habilidades-idiomas':
        this.currentView = 'habilidades-idiomas';
        this.formPart = 3;
        break;
      case 'experiencias':
        this.currentView = 'experiencias';
        this.formPart = 4;
        break;
      default:
        this.backToSummary();
        break;
    }
  }

  editSection(section: string): void {
    this.loadSummaryFromLocalStorage();
    if (this.cvData) {
      this.servicioCv.setCurrentEditData(this.cvData);
    }
    switch (section) {
      case 'estudiante':
        this.currentView = 'estudiante';
        this.formPart = 1;
        break;
      case 'educacion':
        this.currentView = 'educacion';
        this.formPart = 2;
        break;
      case 'habilidades-idiomas':
        this.currentView = 'habilidades-idiomas';
        this.formPart = 3;
        break;
      case 'experiencias':
        this.currentView = 'experiencias';
        this.formPart = 4;
        break;
      default:
        this.currentView = 'summary';
        break;
    }
  }

  backToSummary(): void {
    this.currentView = 'summary';
    this.loadSummaryFromLocalStorage();
  }

  saveCV(): void {
    const cvDataToSave = this.prepareCvDataForSave();
    this.servicioCv.updateCV(this.token, this.cvId, cvDataToSave).subscribe({
      next: (response: any) => {
        this.servicioCv.regenerarPDF(parseInt(this.cvId)).then(
          (pdfResponse: any) => {
            alert('¡CV actualizado y PDF regenerado exitosamente!');
            this.volver();
          },
          (pdfError: any) => {
            this.servicioCv.generarPDF(parseInt(this.cvId)).then(
              (fallbackResponse: any) => {
                alert('¡CV actualizado exitosamente!');
                this.volver();
              },
              (fallbackError: any) => {
                if (fallbackError.status === 409) {
                  alert('¡CV actualizado correctamente!\n\nNota: El PDF ya existía. Los cambios del CV están guardados correctamente.');
                } else {
                  alert('CV guardado correctamente.\n\nHubo un problema al generar el PDF, pero todos tus cambios están guardados en el sistema.');
                }
                this.volver();
              }
            );
          }
        );
      },
      error: (error: any) => {
        if (error?.error?.error_detail) {
          console.error('Error BD:', error.error.error_detail);
        }
        alert('Error al actualizar el CV. Por favor, intenta de nuevo.\n\nDetalles: ' + (error.message || 'Error desconocido'));
      }
    });
  }

  prepareCvDataForSave(): any {
    const studentData = JSON.parse(localStorage.getItem('edit-student') || localStorage.getItem('studentData') || '{}');
    let educacionData = JSON.parse(localStorage.getItem('edit-educacion') || '[]');
    if (educacionData.length === 0) {
      const oldEducacionData = JSON.parse(localStorage.getItem('estudiosData') || '{}');
      educacionData = oldEducacionData.estudios || [];
    }
    let idiomasData = JSON.parse(localStorage.getItem('edit-idiomas') || '[]');
    if (idiomasData.length === 0) {
      const oldIdiomasData = JSON.parse(localStorage.getItem('idiomasData') || '{}');
      idiomasData = oldIdiomasData.idiomas || [];
    }
    let habilidadesData = JSON.parse(localStorage.getItem('edit-habilidades') || '[]');
    if (habilidadesData.length === 0) {
      const oldHabilidadesData = JSON.parse(localStorage.getItem('habilidadesData') || '{}');
      habilidadesData = oldHabilidadesData.habilidades || [];
    }
    let experiencias = JSON.parse(localStorage.getItem('edit-experiencias') || '[]');
    if (experiencias.length === 0) {
      const experienciasData = localStorage.getItem('ExperienciaData');
      if (experienciasData && experienciasData !== 'No se ingresaron experiencias.') {
        const parsed = JSON.parse(experienciasData);
        experiencias = parsed.experiencias || [];
      }
    }
    const cvData = {
      nombre_completo: studentData.nombre_completo,
      fecha_nacimiento: studentData.fecha_nacimiento,
      genero: studentData.genero,
      estado_civil: studentData.estado_civil,
      licencia: studentData.licencia,
      cedula: studentData.cedula || studentData.ci_estudiante,
      cel: studentData.cel,
      email: studentData.email,
      credencial_civica: studentData.credencial_civica,
      idiomas: idiomasData,
      habilidades: habilidadesData,
      educacion: educacionData,
      experiencias: experiencias,
    };
    return cvData;
  }
  
  modalClose(): void {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  ngOnDestroy(): void {
    // Limpiar el estado del servicio
    this.servicioCv.setEditMode(false, '');
    // Limpiar el estado y los datos almacenados al destruir el componente
    this.volver();
  }
}
