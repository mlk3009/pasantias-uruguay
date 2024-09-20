import { Component, HostListener } from '@angular/core';
import {
  Estudiante, Idioma, Educacion, Experiencia, Habilidad, Cv,
} from '../../models/cv';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { CvService } from '../../services/cv.service';
import { DatosEstudianteComponent } from './datos-estudiante/datos-estudiante.component';
import { DatosGeneralesComponent } from './datos-generales/datos-generales.component';
import { OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatosEstudiosComponent } from './datos-estudios/datos-estudios.component';
import { DatosHabilidadesIdiomasComponent } from './datos-habilidaes-idiomas/datos-habilidades-idiomas.component';
import { DatosExperienciasComponent } from './datos-experiencias/experiencias.component';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DatosEstudianteComponent,
    DatosEstudiosComponent,
    DatosHabilidadesIdiomasComponent,
    DatosExperienciasComponent,
    DatosGeneralesComponent,
  ],
  templateUrl: './cv.component.html',
  providers: [UserService, CvService]
})
export class CvComponent implements OnInit {
  public token: any;
  public fichaCompleta: boolean = false;
  public formPart: number = 1;
  studentData: any;

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
    initFlowbite();

    if(localStorage.getItem('studentData')) {
     this.formPart = 2;
    }

    if(localStorage.getItem('estudiosData')) {
      this.formPart = 3;
    }

    if(localStorage.getItem('idiomasData') || localStorage.getItem('habilidadesData')) {
      this.formPart = 4;
    }

    if(localStorage.getItem('ExperienciaData') || localStorage.getItem('SinExperiencias')) {
      this.formPart = 5;
    }
    
    this.servicioCv.change.subscribe((data) => {
      this.formPart = data.data;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) { 
    this.volver();
    $event.returnValue = true;
  }

  volver() {
    if (confirm('¿Estás seguro de que quieres volver?') == true) {
      this._router.navigate(['/inicio']);
      localStorage.removeItem('studentData');
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
  }
}
