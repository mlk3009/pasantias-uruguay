import { Component } from '@angular/core';
import { User } from '../../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../../services/validation.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-valid-acount',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule,
  ],
  templateUrl: './valid-acount.component.html',
  providers: [ValidationService],
})
export class ValidAcountComponent {
  public user: User;
  public status: string = '';

  public loading: boolean = false;
  public codeSend: boolean = true;

  public code = '';

  public confirmation: boolean = false;

  public showError: boolean = false;

  constructor(
    private _validateService: ValidationService,
    private router: Router
  ) {
    this.user = new User(0, '', '', '');
  }

  chargeCode(newValue: string) {
    this.code = newValue;
  }

  changePassword() {
    this.loading = true;

    this._validateService.validateEmail(this.user.email, this.code).subscribe(
      (response) => {
        console.log(response);
        if (response.code == 401) {
          this.loading = false;
          this.showError = true;
          this.status = 'Código incorrecto';
        } else {
          this.router.navigate(['/Inicio']);
        }
      },
      (error) => {
        this.status = 'error';
        console.log(<any>error);
      }
    );
  }
}
