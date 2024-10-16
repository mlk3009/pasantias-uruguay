import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-user-profile-student',
  standalone: true,
  imports: [],
  templateUrl: './user-profile-student.component.html',
  styleUrl: './user-profile-student.component.css',
  providers: [UserService],
})
export class UserProfileStudentComponent {
  loading: boolean = false;

  data = {
    name: '',
    ci_estudiante: '',
    email: '',
    cod_postal: '',
    location: '',
    phone: '',
    rol: '',
    fec_nacimiento: '',
    cv: ''
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
      this.data.cv = state["cv"];
    }
    this.loading = true;
  }

  edit_profile() {
    const navigationExtras: NavigationExtras = {
      state: {
        name: this.data.name,
        ci_estudiante: this.data.ci_estudiante,
        email: this.data.email,
        location: this.data.location,
        cod_postal: this.data.cod_postal,
        phone: this.data.phone,
        day: this.data.fec_nacimiento.split('-')[2],
        month: this.data.fec_nacimiento.split('-')[1],
        year: this.data.fec_nacimiento.split('-')[0],
        rol: this.data.rol,
        cv: this.data.cv
      }
    };

    this._router.navigate(['/edit-profile'], navigationExtras);
  }
}
