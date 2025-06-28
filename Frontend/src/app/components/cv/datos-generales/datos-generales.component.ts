import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';
import { CvService } from '../../../services/cv.service';
import { UserService } from '../../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-datos-generales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datos-generales.component.html'
})
export class DatosGeneralesComponent implements OnInit {

  public token: any;
  public estudiante: any;
  public idiomas: any;
  public habilidades: any;
  public educacion: any;
  public experiencias: any;
  public isEditMode: boolean = false;
  public cvId: string = '';

  public cv: any = {
    estudiante: {},
    idiomas: [],
    habilidades: [],
    educacion: [],
    experiencias: [],
  };

  constructor(
    private servicioCv: CvService,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit() {
    // Detectar si estamos en modo edición usando el servicio
    this.isEditMode = this.servicioCv.getEditMode();
    this.cvId = this.servicioCv.getCurrentCvId();

    this.estudiante = JSON.parse(localStorage.getItem('studentData') || '{}');
    this.idiomas = JSON.parse(localStorage.getItem('idiomasData') || '{}').idiomas || [];
    this.habilidades = JSON.parse(localStorage.getItem('habilidadesData') || '{}').habilidades || [];
    this.educacion = JSON.parse(localStorage.getItem('estudiosData') || '{}').estudios || [];
    
    if (localStorage.getItem('ExperienciaData') != 'No se ingresaron experiencias.') {  
      this.experiencias = JSON.parse(localStorage.getItem('ExperienciaData') || '{}').experiencias || [];
    } else {
      this.experiencias = [];
    }

    this.cv = {
      nombre_completo: this.estudiante.nombre_completo,
      fecha_nacimiento: this.estudiante.fecha_nacimiento,
      genero: this.estudiante.genero,
      estado_civil: this.estudiante.estado_civil,
      licencia: this.estudiante.licencia,
      cedula: this.estudiante.cedula,
      idiomas: this.idiomas,
      habilidades: this.habilidades,
      educacion: this.educacion,
      experiencias: this.experiencias,
    };

    localStorage.setItem('cv', JSON.stringify(this.cv));
  }

  editEstudiante() {
    this.servicioCv.change.emit({ data: 1 });
  }

  editEstudios() {
    this.servicioCv.change.emit({ data: 2 });
  }

  editHablidadesIdiomas() {
    this.servicioCv.change.emit({ data: 3 });
  }

  editExperiencias() {
    this.servicioCv.change.emit({ data: 4 });
  }

  next() {
    if (this.isEditMode) {
      // Modo edición - usar updateCV
      this.servicioCv.updateCV(this.token, this.cvId, this.cv).subscribe(
        (response: any) => {
          alert('CV actualizado correctamente');
          this.servicioCv.change.emit({ data: 'success' });
          
          // Actualizar this.cv con los datos del response
          this.cv = response.cv;
          
          // Llamar a la función para generar el PDF
          this.servicioCv.generarPDF(this.cv?.id).then(
            (pdfResponse) => {
              console.log('Respuesta del PDF:', pdfResponse);
              alert('PDF actualizado exitosamente');
              // Redirigir al inicio después de actualizar
              this._router.navigate(['/inicio']);
            },
            (pdfError) => {
              alert('Error al generar el PDF, intente de nuevo');
              console.log(<any>pdfError);
            }
          );
        },
        (error) => {
          alert('Error al actualizar el CV, intente de nuevo');
          this.servicioCv.change.emit({ data: 'error' });
          console.log(<any>error);
        }
      );
    } else {
      // Modo creación - usar loadForm
      this.servicioCv.loadForm(this.token, this.cv).subscribe(
        (response: any) => {
          alert('Ficha cargada correctamente');
          this.servicioCv.change.emit({ data: 'success' });
          localStorage.setItem('hasFicha', 'true');
    
          // Actualizar this.cv con los datos del response
          this.cv = response.cv;
    
          // Verificar el ID del CV
          console.log('ID del CV:', this.cv?.id);
    
          // Llamar a la nueva función para generar el PDF
          this.servicioCv.generarPDF(this.cv?.id).then(
            (pdfResponse) => {
              console.log('Respuesta del PDF:', pdfResponse);
              alert('PDF generado exitosamente');
            },
            (pdfError) => {
              alert('Error al generar el PDF, intente de nuevo');
              console.log(<any>pdfError);
            }
          );
        },
        (error) => {
          alert('Error al cargar la ficha, intente de nuevo');
          this.servicioCv.change.emit({ data: 'error' });
          console.log(<any>error);
          localStorage.removeItem('hasFicha');
        }
      );
    }
  }
}