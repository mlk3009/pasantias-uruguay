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

  constructor(private userService: UserService, private route: ActivatedRoute) {}


  contactUs(asunto: string, descripcion: string): void {
    this.userService.contactUs(this.userEmail, asunto, descripcion).subscribe(
      response => {
        console.log('Correo enviado correctamente', response);
        window.location.reload();
      },
      error => {
        console.error('Error al enviar el correo', error);
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