import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { User } from '../../../../models/user';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'home-perfil',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  providers: [UserService],
})
export class HomeProfileComponent {
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
}
