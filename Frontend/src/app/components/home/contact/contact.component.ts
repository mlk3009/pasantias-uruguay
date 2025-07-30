import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  isLoggedIn: boolean = false;
  userEmail: string = '';

  isLoading: boolean = false;

  constructor(private userService: UserService, private route: ActivatedRoute) {}


  showAlertCustom(message: string): void {
    const modal = document.getElementById('alert-container-custom') as HTMLElement;
    const msgSpan = document.getElementById('alert-custom-message') as HTMLElement;
    if (modal && msgSpan) {
      msgSpan.textContent = message;
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
      setTimeout(() => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
        setTimeout(() => {
          modal.style.display = 'none';
          modal.classList.remove('fade-out');
        }, 500);
      }, 2000);
    }
  }

  contactUs(asunto: string, descripcion: string): void {
    this.isLoading = true;
    this.userService.contactUs(this.userEmail, asunto, descripcion).subscribe(
      response => {
        this.showAlertCustom('Mensaje enviado correctamente');
        this.isLoading = false;
        // window.location.reload();
      },
      error => {
        this.showAlertCustom('Error al enviar el mensaje');
        this.isLoading = false;
      }
    );
  }

  ngOnInit() {
    const token = this.userService.getToken();
    if (token) {
      this.userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.isLoggedIn = true;
          this.userEmail = response.data.email;
        },
        error: (error) => {
          console.error('Error al obtener el usuario:', error);
        }
      });
    }

    this.route.fragment.subscribe((fragment: string | null) => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          window.scrollTo({
            top: element.offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  }
}