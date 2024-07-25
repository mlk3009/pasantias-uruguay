import { Component } from '@angular/core';
import { User } from '../../models/user';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './restore.component.html',
  styleUrl: './restore.component.css',
  providers: [UserService]
})
export class RestoreComponent {
  public user: User;
  public status: string = '';

  public loading: boolean = false;
  public codeSend: boolean = false;


  public code = '';
  public password_confirmation = '';

  public confirmation: boolean = false;


  public showError: boolean = false;

  constructor(
    private _userService: UserService,
    private router: Router
  ) {
    this.user = new User(0, '', '', '', '','', '','');
  }

  checkPassword(password: string, confirmation: string) {
    this.confirmation = password === confirmation ? true : false;
  }

  chargeCode(newValue: string) {
    this.code = newValue;
  }

  restore(form: any) {
    this.loading = true;

    this._userService.restore(this.user).subscribe(
      response => {
        this.codeSend = true;
        this.loading = false;
        this.showError = false;
      },
      error => {
        this.loading = false;
        this.codeSend = false;
        this.showError = true;
        this.status = 'Usuario no encontrado.';
        console.log(<any>error);
      }
    );
  }

  changePassword() {
    this.loading = true;

    this._userService.checkCode(this.user.email, this.code).subscribe(
      response => {
        console.log(response)
        if (response.code == 401) {
          this.loading = false;
          this.showError = true;
          this.status = "Código incorrecto";
        } else {
          this._userService.changePassword(this.user.email, this.user.password).subscribe(
            response => { 
              this.status = 'success';
              this.loading = false;
              this.router.navigate(['/login']);
            },
            error => {
              this.loading = false;
              this.status = 'error';
              console.log(<any>error);
            }
          );
        }
      },
      error => {
        this.status = 'error';
        console.log(<any>error);
      }
    );
  }

}