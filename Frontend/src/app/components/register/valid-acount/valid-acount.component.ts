import { Component } from '@angular/core';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../../services/validation.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-valid-acount',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatDialogModule,
  ],
  templateUrl: './valid-acount.component.html',
  styleUrl: './valid-acount.component.css',
  providers: [ValidationService, UserService, CookieService],
})
export class ValidAcountComponent {
  public user: User;
  public status: string = '';

  public loading: boolean = false;
  public codeSend: boolean = true;

  public code1 = '';
  public code2 = '';
  public code3 = '';
  public code4 = '';
  public code5 = '';
  public code6 = '';
  public code = '';

  public confirmation: boolean = false;

  public showError: boolean = false;

  constructor(
    private _validateService: ValidationService,
    private router: Router,
    private _cookieService: CookieService,
    private _userService: UserService,
    private _router: Router,
    private dialog: MatDialog
  ) {
    this.user = new User(0, '', '', '', '');
  }

  concatenateCodes(code1: string, code2: string, code3: string, code4: string, code5: string, code6: string) {
    this.code = code1 + code2 + code3 + code4 + code5 + code6;
  }


onPaste(event: ClipboardEvent, index: number) {
  // Prevenir el comportamiento de pegado predeterminado
  event.preventDefault();

  // Comprobar que event.clipboardData no es nulo
  if (event.clipboardData) {
    // Obtener el texto pegado
    let pastedText = event.clipboardData.getData('text');

    // Si el texto pegado tiene más de 6 caracteres, recórtalo
    if (pastedText.length > 6) {
      pastedText = pastedText.substring(0, 6);
    }

    // Dividir el texto pegado en caracteres
    const characters = pastedText.split('');

    // Distribuir los caracteres entre los campos de entrada
    if (characters.length > 0) this.code1 = characters[0];
    if (characters.length > 1) this.code2 = characters[1];
    if (characters.length > 2) this.code3 = characters[2];
    if (characters.length > 3) this.code4 = characters[3];
    if (characters.length > 4) this.code5 = characters[4];
    if (characters.length > 5) this.code6 = characters[5];

    // Llamar a la función concatenateCodes para actualizar el código completo
    this.concatenateCodes(this.code1, this.code2, this.code3, this.code4, this.code5, this.code6);
  }
}



  changePassword() {
    this.loading = true;

    let email = localStorage.getItem('email') || '';

    if (email == '') {
      this.status = 'error';
      return;
    }

    this._validateService.validateEmail(email, this.code).subscribe(
      (response) => {
        console.log(response);
        if (response.code == 401) {
          this.loading = false;
          this.showError = true;
          this.status = 'Código incorrecto';
        } else {
          this.dialog.closeAll();
          
          // Con este codigo agarro la URL actual
          const currentUrl = this._router.createUrlTree([], {relativeTo: this._router.routerState.root}).toString();
          if (currentUrl === '/login') {
            this._router.navigate(['/inicio']);
          } else {
            this._router.navigate(['/login']);
          }
        }
      },
      (error) => {
        this.status = 'error';
        console.log(<any>error);
      }
    
    );
} }