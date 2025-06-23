import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NavComponent } from '../../home/nav/nav.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 



@Component({
  selector: 'app-user-profile-view',
  standalone: true,
  imports: [NavComponent, CommonModule, FormsModule],
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.css']
})
export class UserProfileViewComponent implements OnInit {
  phone: any = {};
  data: any = {};
  userImageUrl: string = '';
  loading: boolean = false;
  userEtiquetas: any[] = [];
  cvLink: string = '';
  percent = 100; // Cambia este valor según el avance

  constructor(
    private _route: ActivatedRoute,
    private _userService: UserService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const phone = this._route.snapshot.paramMap.get('phone');
    if (phone) {
      this.phone = phone;
      this.loadUserProfile(this.phone);
    } else {
      console.error('Número de teléfono no proporcionado');
      this.loading = false;
    }
  }



  loadUserProfile(phone: string): void {
    this._userService.obtenerUsuarioByPhone(phone).subscribe({
      next: (response) => {
        this.data = response.data; 
        this.userEtiquetas = response.data.etiquetas;
        if (this.data.image) {
          this.userImageUrl = `http://localhost:8000/images/uploads/${this.data.image}`;
        } else {
          this.userImageUrl = 'http://localhost:8000/images/user.png';
        }
        this.cvLink = `http://localhost:8000/pdfs/cv_${this.data.cv}.pdf`;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
        this.showAlert3();
        this.loading = false;
      }
    });
  }


sendContactEmail(contactForm: any): void {
    const email = localStorage.getItem('email') || 'No encontrado';
    const asunto = contactForm.value.subject;
    const descripcion = contactForm.value.message;
    const emailDestino = this.data.email;

    this._userService.contactMe(email, asunto, descripcion, emailDestino).subscribe({
        next: (response) => {
            console.log('Correo enviado correctamente', response);
            this.showAlert1();
            this.modalClose();
            contactForm.resetForm(); // Limpia los campos del formulario
        },
        error: (error) => {
            console.error('Error al enviar el correo:', error);
            this.showAlert2();
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

  showAlert1(): void {
    const modal = document.getElementById('alert-container') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container2 no encontrado');
    }
  }

  alert1Close() {
    const modal = document.getElementById('alert-container') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert2(): void {
    const modal = document.getElementById('alert-container2') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container2 no encontrado');
    }
  }

  alert2Close() {
    const modal = document.getElementById('alert-container2') as HTMLElement;
    modal.style.display = 'none';
  }

  showAlert3(): void {
    const modal = document.getElementById('alert-container3') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
  
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
  
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500); // Duration of fade-out animation
      }, 2000);
    } else {
      console.error('Elemento con ID alert-container3 no encontrado');
    }
  }

  alert3Close() {
    const modal = document.getElementById('alert-container3') as HTMLElement;
    modal.style.display = 'none';
  }
  
}