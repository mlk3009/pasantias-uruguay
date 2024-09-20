import { Component } from '@angular/core';
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
export class DatosGeneralesComponent {

  public token: any;

  public estudiante;
  public idiomas;
  public habilidades;
  public educacion;
  public experiencias;

  
  public cv: any = {
    estudiante: {},
    idiomas: {},
    habilidades: {},
    educacion: {},
    experiencias: {},
  };

  constructor(
    private servicioCv: CvService,
    private _router: Router
  ) {
    this.token = localStorage.getItem('token');

    this.estudiante = JSON.parse(localStorage.getItem('studentData') || '{}');
    this.idiomas = JSON.parse(localStorage.getItem('idiomasData') || '{}');
    this.habilidades = JSON.parse(localStorage.getItem('habilidadesData') || '{}');
    this.educacion = JSON.parse(localStorage.getItem('estudiosData') || '{}');
    
    if(localStorage.getItem('experienciaData') != 'No se ingresaron experiencias.') {  
      this.experiencias = JSON.parse(
        localStorage.getItem('experienciaData') || '{}'
      );
    } else {
      this.experiencias = {};
    }
  }

  ngOnInit(){
    this.cv = {
      estudiante: this.estudiante,
      idiomas: this.idiomas,
      habilidades: this.habilidades,
      educacion: this.educacion,
      experiencias: this.experiencias,
    };

    localStorage.setItem('cv', JSON.stringify(this.cv));

    console.log(JSON.stringify(this.cv));
  }

  editEstudiante(){
    this.servicioCv.change.emit({ data: 1 });
  }

  editEstudios(){
    this.servicioCv.change.emit({ data: 2 });
  }

  editHablidadesIdiomas(){
    this.servicioCv.change.emit({ data: 3 });
  }

  editExperiencias(){
    this.servicioCv.change.emit({ data: 4 });
  }

  next(){
  //   this.servicioCv.loadForm(this.token, this.ficha).subscribe(
  //           (response) => {
  //             if (response.status == 'success') {
  //               alert('Ficha cargada correctamente');
  //               this.servicioCv.change.emit({ data: 'success' });
  //               localStorage.setItem('hasFicha', 'true');
  //             } else {
  //               alert('Error al cargar la ficha, intente de nuevo');
  //               this.servicioCv.change.emit({ data: 'error' });
  //               localStorage.removeItem('hasFicha');
  //             }
  //           },
  //           (error) => {
  //             alert('Error al cargar la ficha, intente de nuevo');
  //             this.servicioCv.change.emit({ data: 'error' });
  //             console.log(<any>error);
  //             localStorage.removeItem('hasFicha');
  //           }
  //         );
  }
}


