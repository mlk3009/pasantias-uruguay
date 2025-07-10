import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { CompanyService } from '../../../services/company.service';

import { HttpClientModule } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

import { CookieService } from 'ngx-cookie-service';

import { NavComponent } from '../../../components/home/nav/nav.component';

@Component({
  selector: 'app-register-in-1',
  standalone: true,
  imports: [NavComponent, ReactiveFormsModule, FormsModule, CommonModule, RouterModule, HttpClientModule, MatDialogModule],
  templateUrl: './register-in-1.component.html',
  styleUrl: './register-in-1.component.css'
})
export class RegisterIn1Component {
  public user: any = {};
  public confirmPassword: any;
  public status: string = '';
  public showError: boolean = false;
  public loading: boolean = false;
  public inputType: string = 'password';
  public inputType2: string = 'password';
  public desc: string = '';

  public locations = [
    'Montevideo',
    'Canelones',
    'Maldonado',
    'Artigas',
    'Cerro Largo',
    'Colonia',
    'Durazno',
    'Flores',
    'Florida',
    'Lavalleja',
    'Paysandú',
    'Río Negro',
    'Rivera',
    'Rocha',
    'Salto',
    'San José',
    'Soriano',
    'Tacuarembó',
    'Treinta y Tres'
  ];

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _cookieService: CookieService,
    private dialog: MatDialog,
    private _companyService: CompanyService
  ) {}

  capitalize(sentence: string): string {
    const words = sentence.split(' ');

    const capitalizedWords = words.map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return firstLetter + rest;
    });

    const capitalizedSentence = capitalizedWords.join(' ');

    return capitalizedSentence;
  }

  ngOnInit() {
    if (this._cookieService.get('token')) {
      this._router.navigate(['/inicio']);
    }
  }

  showPassword() {
    return (this.inputType =
      this.inputType === 'password' ? 'text' : 'password');
  }
  showPassword2() {
    return (this.inputType2 =
      this.inputType2 === 'password' ? 'text' : 'password');
  }

  register(form: any) {
    if (this.user.password !== this.confirmPassword) {
      this.status = 'Las contraseñas no coinciden';
      this.showError = true;
      return;
    }

    this.user.name = this.capitalize(this.user.name);
    this.user.email = this.user.email.toLowerCase();
    this.user.rol = 'empresa'; // Asegurarse de que el rol sea "empresa"
    this.user.phone = this.user.phone; // Asegurarse de que el teléfono esté incluido

    // Añadir la descripción al objeto user
    this.user.desc = this.desc;

    this.loading = true;
    this._userService.register(this.user).subscribe(
      response => {
        this.loading = false;
        this._router.navigate(['/inicio']);
      },
      error => {
        this.loading = false;
        this.status = 'Error al registrar la empresa';
        this.showError = true;
      }
    );
  }
}