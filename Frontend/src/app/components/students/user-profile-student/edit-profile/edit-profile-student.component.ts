import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/user';
import { UserService } from '../../../../services/user.service';
import { NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-user-profile-student',
  standalone: true,
  imports: [],
  templateUrl: './edit-profile-student.component.html',
  providers: [UserService],
})
export class EditProfileStudentComponent {
  loading: boolean = false
  status: string = '';
  showError: boolean = false;

  data = {
    name: '',
    ci_estudiante: '',
    email: '',
    cod_postal: '',
    location: '',
    phone: '',
    rol: '',
    fec_nacimiento: ''
  };

  constructor(
    private _userService: UserService,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    const navigation = this._router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      this.data.name = state["name"];
      this.data.ci_estudiante = state["ci_estudiante"];
      this.data.email = state["email"];
      this.data.cod_postal = state["cod_postal"];
      this.data.location = state["location"];
      this.data.phone = state["phone"];
      this.data.rol = state["rol"];
      this.data.fec_nacimiento = state["day"] + '/' + state["month"] + '/' + state["year"];
    }
    this.loading = true;
  }

  edit() {
    this._userService.update(this.data).subscribe(
      (response) => {
        this.loading = false;
        return this._router.navigate(['/profile']);
      },
      (error) => {
        console.log(error.error.failed_input);
        let errorList = error.error.failed_input;

        for (let err in errorList) {
          if (err == 'email') {
            this.status = 'El email ya se encuentra registrado';
          }

          if (err == 'ci_estudiante') {
            this.status += ' La cédula ya se encuentra registrada';
          }
        }

        console.error('Error al registrar el usuario', error);
        this.loading = false;
        this.showError = true;
      }
    );
  }
}
