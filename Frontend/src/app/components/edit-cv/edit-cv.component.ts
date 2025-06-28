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
    console.log('Token obtenido:', this.token);
    this.studentData = this.studentData;

    if (this.token == null) {
      console.log('No hay token, redirigiendo a login');
      this._router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    const modalButton = document.getElementById('modalButton');
    if (modalButton) {
      modalButton.addEventListener('click', () => this.volver());
    }

    initFlowbite();

    // Obtener información del usuario y verificar si tiene CV
    this.loadUserDataAndCV();

    // Suscribirse a cambios del servicio CV
    this.servicioCv.change.subscribe((data: any) => {
      console.log('Cambio recibido del servicio:', data);
      if (data.data === 'success') {
        // Volver al resumen después de guardar exitosamente una sección
        this.backToSummary();
      } else if (data.data === 'cancel') {
        // El usuario canceló la edición, volver al resumen
        this.backToSummary();
      } else if (data.data === 'back') {
        // Volver al resumen
        this.backToSummary();
      } else if (data.data === 'finish') {
        // Finalizar edición, volver al resumen
        this.backToSummary();
      } else if (data.data === 'next') {
        // Ir a la siguiente sección
        this.goToNextSection(data.section);
      } else if (typeof data.data === 'number') {
        // Cambio de formulario
        this.formPart = data.data;
      }
    });
  }

  loadUserDataAndCV(): void {
    console.log('Cargando datos del usuario...');
    this._userService.obtenerUsuario(this.token).subscribe({
      next: (response: any) => {
        console.log('Respuesta del usuario:', response);
        if (response.data && response.data.cv_id) {
          this.cvId = response.data.cv_id.toString();
          console.log('CV ID encontrado:', this.cvId);
          // Establecer el modo de edición en el servicio
          this.servicioCv.setEditMode(true, this.cvId);
          this.loadExistingCvData();
        } else {
          // El usuario no tiene CV, redirigir a crear CV
          console.log('Usuario no tiene CV, redirigiendo a crear CV');
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
    console.log('Cargando datos existentes del CV con ID:', this.cvId);
    console.log('Token a usar para getFicha:', this.token);
    this.servicioCv.getFicha(this.token, this.cvId).subscribe({
      next: (response: any) => {
        console.log('Respuesta getFicha:', response);
        if (response.status === 'success') {
          this.existingCvData = response.data;
          
          // Normalizar los nombres de propiedades para compatibilidad con el frontend
          const normalizedData = {
            ...response.data,
            experiencias: response.data.experiencia || response.data.experiencias || [] // Convertir 'experiencia' a 'experiencias'
          };
          
          // Guardar los datos normalizados en el servicio para que los componentes de edición los puedan usar
          this.servicioCv.setCurrentEditData(normalizedData);
          
          // Cargar TODOS los datos en localStorage inmediatamente
          this.loadAllDataToLocalStorage(normalizedData);
          
          // Cargar los datos del resumen desde localStorage
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
    console.log('Cargando TODOS los datos en localStorage para edición:', cvData);
    
    // Datos del estudiante
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
      console.log('✅ Datos del estudiante guardados en localStorage:', studentData);
    }

    // Datos de educación
    if (cvData.educacion && cvData.educacion.length > 0) {
      localStorage.setItem('edit-educacion', JSON.stringify(cvData.educacion));
      console.log('✅ Datos de educación guardados en localStorage:', cvData.educacion);
    } else {
      localStorage.setItem('edit-educacion', JSON.stringify([]));
    }

    // Datos de idiomas
    if (cvData.idiomas && cvData.idiomas.length > 0) {
      localStorage.setItem('edit-idiomas', JSON.stringify(cvData.idiomas));
      console.log('✅ Datos de idiomas guardados en localStorage:', cvData.idiomas);
    } else {
      localStorage.setItem('edit-idiomas', JSON.stringify([]));
    }

    // Datos de habilidades
    if (cvData.habilidades && cvData.habilidades.length > 0) {
      localStorage.setItem('edit-habilidades', JSON.stringify(cvData.habilidades));
      console.log('✅ Datos de habilidades guardados en localStorage:', cvData.habilidades);
    } else {
      localStorage.setItem('edit-habilidades', JSON.stringify([]));
    }

    // Datos de experiencias
    if (cvData.experiencias && cvData.experiencias.length > 0) {
      localStorage.setItem('edit-experiencias', JSON.stringify(cvData.experiencias));
      console.log('✅ Datos de experiencias guardados en localStorage:', cvData.experiencias);
    } else {
      localStorage.setItem('edit-experiencias', JSON.stringify([]));
    }

    console.log('🎯 Todos los datos han sido cargados en localStorage para edición');
  }

  loadSummaryFromLocalStorage(): void {
    console.log('Cargando datos del resumen desde localStorage...');
    
    // Construir cvData desde localStorage
    const studentData = JSON.parse(localStorage.getItem('edit-student') || '{}');
    const educacionData = JSON.parse(localStorage.getItem('edit-educacion') || '[]');
    const idiomasData = JSON.parse(localStorage.getItem('edit-idiomas') || '[]');
    const habilidadesData = JSON.parse(localStorage.getItem('edit-habilidades') || '[]');
    const experienciasData = JSON.parse(localStorage.getItem('edit-experiencias') || '[]');

    // Reconstruir la estructura de cvData para el resumen
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

    console.log('✅ Datos del resumen cargados desde localStorage:', this.cvData);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) { 
    this.volver();
    $event.returnValue = true;
  }

  volver() {
      this._router.navigate(['/user-profile']);
      
      // Limpiar localStorage de datos del CV original
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
      
      // Limpiar localStorage de los nuevos componentes de edición
      localStorage.removeItem('edit-student');
      localStorage.removeItem('edit-educacion');
      localStorage.removeItem('edit-idiomas');
      localStorage.removeItem('edit-habilidades');
      localStorage.removeItem('edit-experiencias');
      
      console.log('LocalStorage limpiado, navegando al perfil de usuario');
  }

  modal(): void {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  goToNextSection(nextSection: string): void {
    console.log('Navegando a la siguiente sección:', nextSection);
    
    // Asegurar que los datos estén disponibles en el servicio
    if (this.cvData) {
      this.servicioCv.setCurrentEditData(this.cvData);
    }
    
    // Ir a la sección correspondiente
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
    
    console.log('Vista cambiada a:', this.currentView);
  }

  editSection(section: string): void {
    console.log('Editando sección:', section);
    
    // Asegurar que los datos estén disponibles en el servicio desde localStorage
    this.loadSummaryFromLocalStorage(); // Actualizar cvData desde localStorage
    if (this.cvData) {
      this.servicioCv.setCurrentEditData(this.cvData);
    }
    
    // Cambiar a la vista de edición correspondiente
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
    
    console.log('Vista cambiada a:', this.currentView);
  }

  backToSummary(): void {
    console.log('Volviendo al resumen...');
    this.currentView = 'summary';
    
    // Recargar los datos del resumen desde localStorage para mostrar los cambios
    this.loadSummaryFromLocalStorage();
    
    console.log('✅ Resumen actualizado con los datos del localStorage');
  }

  saveCV(): void {
    // Preparar los datos del CV desde localStorage
    const cvDataToSave = this.prepareCvDataForSave();
    
    console.log('Guardando CV con datos:', cvDataToSave);
    
    this.servicioCv.updateCV(this.token, this.cvId, cvDataToSave).subscribe({
      next: (response: any) => {
        console.log('CV actualizado:', response);
        
        // Intentar regenerar el PDF
        console.log('Intentando regenerar PDF...');
        this.servicioCv.regenerarPDF(parseInt(this.cvId)).then(
          (pdfResponse: any) => {
            console.log('PDF regenerado exitosamente:', pdfResponse);
            alert('¡CV actualizado y PDF regenerado exitosamente!');
            this.volver();
          },
          (pdfError: any) => {
            console.error('Error al regenerar PDF:', pdfError);
            
            // Si falla la regeneración, intentar con el método normal
            console.log('Fallback: intentando generar PDF normal...');
            this.servicioCv.generarPDF(parseInt(this.cvId)).then(
              (fallbackResponse: any) => {
                console.log('PDF generado con método fallback:', fallbackResponse);
                alert('¡CV actualizado exitosamente!');
                this.volver();
              },
              (fallbackError: any) => {
                console.error('Error en fallback PDF:', fallbackError);
                
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
        console.error('Error actualizando CV:', error);
        alert('Error al actualizar el CV. Por favor, intenta de nuevo.\n\nDetalles: ' + (error.message || 'Error desconocido'));
      }
    });
  }

  prepareCvDataForSave(): any {
    // Preparar los datos desde localStorage, incluyendo las nuevas claves de edit
    const studentData = JSON.parse(localStorage.getItem('edit-student') || localStorage.getItem('studentData') || '{}');
    
    // Para educación, intentar obtener desde las nuevas claves de edit
    let educacionData = JSON.parse(localStorage.getItem('edit-educacion') || '[]');
    if (educacionData.length === 0) {
      const oldEducacionData = JSON.parse(localStorage.getItem('estudiosData') || '{}');
      educacionData = oldEducacionData.estudios || [];
    }
    
    // Para idiomas y habilidades
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
    
    // Para experiencias
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

    console.log('Datos preparados para guardar:', cvData);
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
