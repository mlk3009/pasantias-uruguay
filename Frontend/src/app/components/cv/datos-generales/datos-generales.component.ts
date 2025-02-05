import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';
import { CvService } from '../../../services/cv.service';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';

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

  public cv: any = {
    estudiante: {},
    idiomas: [],
    habilidades: [],
    educacion: [],
    experiencias: [],
  };

  constructor(
    private servicioCv: CvService,
    private _router: Router
  ) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit() {
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
    this.servicioCv.loadForm(this.token, this.cv).subscribe(
      (response) => {
        alert('Ficha cargada correctamente');
        this.servicioCv.change.emit({ data: 'success' });
        localStorage.setItem('hasFicha', 'true');
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