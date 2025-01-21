import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NavComponent } from '../../home/nav/nav.component';

@Component({
  selector: 'app-user-profile-view',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.css']
})
export class UserProfileViewComponent implements OnInit {
  phone: string | null = null;
  data: any = {};
  userImageUrl: string = '';
  loading: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _userService: UserService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    const token = this._userService.getToken(); 
    if (token) {
    this.loading = true;
    const phone = this._route.snapshot.paramMap.get('phone');
    if (phone) {
      this.phone = phone;
      this.loadUserProfile(this.phone);
    } else {
      console.error('Número de teléfono no proporcionado');
      this.loading = false;
    }
  } else {
    this._router.navigate(['/login']);
  }
  }

  loadUserProfile(phone: string): void {
    this._userService.obtenerUsuarioByPhone(phone).subscribe({
      next: (response) => {
        this.data = response.data;
        this.userImageUrl = this.data.id_image
          ? `http://localhost:8000/images/uploads/${this.data.image}`
          : 'http://localhost:8000/images/user.png';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
        alert('Error: No se encontró al estudiante.');
        this.loading = false;
      }
    });
  }


  modal(){
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }
  
}