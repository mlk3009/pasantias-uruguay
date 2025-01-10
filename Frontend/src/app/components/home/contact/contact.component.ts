import { Component } from '@angular/core';
import { CommonModule, ViewportScroller  } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { HostListener } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  constructor(private userService: UserService) {}

  contactUs(email: string, asunto: string, descripcion: string): void {
    this.userService.contactUs(email, asunto, descripcion).subscribe(
      response => {
        console.log('Correo enviado correctamente', response);
      },
      error => {
        console.error('Error al enviar el correo', error);
      }
    );
  }
}