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
  constructor(private userService: UserService, private route: ActivatedRoute) {}

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

  ngOnInit() {
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