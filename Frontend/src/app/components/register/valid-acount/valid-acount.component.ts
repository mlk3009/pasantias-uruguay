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
    this.user = new User(0, '', '', '');
  }

  concatenateCodes(code1: string, code2: string, code3: string, code4: string, code5: string, code6: string) {
    this.code = code1 + code2 + code3 + code4 + code5 + code6;
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
          this._router.navigate(['/login']);
        }
      },
      (error) => {
        this.status = 'error';
        console.log(<any>error);
      }
    );
  }
}
