import { Component, HostListener, OnDestroy } from '@angular/core';
import {
  Estudiante, Idioma, Educacion, Experiencia, Habilidad, Cv,
} from '../../../models/cv';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';
import { DatosEstudianteComponent } from '../datos-estudiante/datos-estudiante.component';
import { DatosGeneralesComponent } from '../datos-generales/datos-generales.component';
import { OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatosEstudiosComponent } from '../datos-estudios/datos-estudios.component';
import { DatosHabilidadesIdiomasComponent } from '../datos-habilidaes-idiomas/datos-habilidades-idiomas.component';
import { DatosExperienciasComponent } from '../datos-experiencias/experiencias.component';

@Component({
  selector: 'app-edit-cv',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DatosEstudianteComponent,
    DatosEstudiosComponent,
    DatosHabilidadesIdiomasComponent,
    DatosExperienciasComponent,
    DatosGeneralesComponent
  ],
  templateUrl: './edit-cv.component.html',
  styleUrls: ['./edit-cv.component.css'],
  providers: [UserService, CvService]
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
    this.servicioCv.change.subscribe((data) => {
      console.log('Cambio recibido del servicio:', data);
      if (data.data === 'success') {
        // Volver al resumen después de guardar exitosamente una sección
        this.backToSummary();
      } else if (typeof data.data === 'number') {
        // Cambio de formulario
        this.formPart = data.data;
      }
    });
  }

  loadUserDataAndCV(): void {
    console.log('Cargando datos del usuario...');
    this._userService.obtenerUsuario(this.token).subscribe({
      next: (response) => {
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
      error: (error) => {
        console.error('Error obteniendo datos del usuario:', error);
        this._router.navigate(['/login']);
      }
    });
  }

  loadExistingCvData(): void {
    console.log('Cargando datos existentes del CV con ID:', this.cvId);
    console.log('Token a usar para getFicha:', this.token);
    this.servicioCv.getFicha(this.token, this.cvId).subscribe({
      next: (response) => {
        console.log('Respuesta getFicha:', response);
        if (response.status === 'success') {
          this.existingCvData = response.data;
          this.cvData = response.data; // Para mostrar en el resumen
          this.preloadFormData();
        } else {
          console.error('Error en la respuesta getFicha:', response);
          alert('Error cargando los datos del CV');
        }
      },
      error: (error) => {
        console.error('Error cargando datos del CV:', error);
        console.error('Detalles del error:', error.error);
        alert('Error cargando los datos del CV: ' + (error.message || 'Error desconocido'));
        // No redirigir inmediatamente, permitir que el usuario vea el error
      }
    });
  }

  preloadFormData(): void {
    if (this.existingCvData) {
      // Precargar datos en localStorage para que los componentes los usen
      if (this.existingCvData.cv) {
        const studentData = {
          nombre_completo: this.existingCvData.cv.nombre_completo,
          cedula: this.existingCvData.estudiante?.ci_estudiante,
          fecha_nacimiento: this.existingCvData.cv.fecha_nacimiento,
          genero: this.existingCvData.cv.genero,
          estado_civil: this.existingCvData.cv.estado_civil,
          licencia: this.existingCvData.cv.licencia
        };
        localStorage.setItem('studentData', JSON.stringify(studentData));
      }

      if (this.existingCvData.educacion) {
        localStorage.setItem('estudiosData', JSON.stringify(this.existingCvData.educacion));
      }

      if (this.existingCvData.experiencias) {
        localStorage.setItem('ExperienciaData', JSON.stringify(this.existingCvData.experiencias));
      }

      if (this.existingCvData.idiomas) {
        localStorage.setItem('idiomasData', JSON.stringify(this.existingCvData.idiomas));
      }

      if (this.existingCvData.habilidades) {
        localStorage.setItem('habilidadesData', JSON.stringify(this.existingCvData.habilidades));
      }
    }
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
  }

  modal(): void {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  editSection(section: string): void {
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
  }

  backToSummary(): void {
    this.currentView = 'summary';
    // Recargar los datos del CV para reflejar cualquier cambio
    this.loadExistingCvData();
  }

  saveCV(): void {
    // Preparar los datos del CV desde localStorage
    const cvDataToSave = this.prepareCvDataForSave();
    
    console.log('Guardando CV con datos:', cvDataToSave);
    
    this.servicioCv.updateCV(this.token, this.cvId, cvDataToSave).subscribe({
      next: (response: any) => {
        console.log('CV actualizado:', response);
        alert('CV actualizado correctamente');
        
        // Generar PDF
        this.servicioCv.generarPDF(parseInt(this.cvId)).then(
          (pdfResponse) => {
            console.log('PDF generado:', pdfResponse);
            alert('PDF actualizado exitosamente');
            // Limpiar localStorage y redirigir
            this.volver();
          },
          (pdfError) => {
            console.error('Error generando PDF:', pdfError);
            alert('CV guardado pero error al generar el PDF');
            this.volver();
          }
        );
      },
      error: (error) => {
        console.error('Error actualizando CV:', error);
        alert('Error al actualizar el CV, intente de nuevo');
      }
    });
  }

  prepareCvDataForSave(): any {
    // Preparar los datos desde localStorage
    const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
    const educacionData = JSON.parse(localStorage.getItem('estudiosData') || '{}');
    const idiomasData = JSON.parse(localStorage.getItem('idiomasData') || '{}');
    const habilidadesData = JSON.parse(localStorage.getItem('habilidadesData') || '{}');
    const experienciasData = localStorage.getItem('ExperienciaData');
    
    let experiencias = [];
    if (experienciasData && experienciasData !== 'No se ingresaron experiencias.') {
      experiencias = JSON.parse(experienciasData).experiencias || [];
    }

    return {
      nombre_completo: studentData.nombre_completo,
      fecha_nacimiento: studentData.fecha_nacimiento,
      genero: studentData.genero,
      estado_civil: studentData.estado_civil,
      licencia: studentData.licencia,
      cedula: studentData.cedula,
      idiomas: idiomasData.idiomas || [],
      habilidades: habilidadesData.habilidades || [],
      educacion: educacionData.estudios || [],
      experiencias: experiencias,
    };
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
