import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavComponent } from '../../home/nav/nav.component';
import { CompanyService } from '../../../services/company.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';



@Component({
  selector: 'app-abautus',
  standalone: true,
  imports: [CommonModule, NavComponent, FormsModule],
  templateUrl: './abautus.component.html',
  styleUrls: ['./abautus.component.css']
})
export class AbautusComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  loading: boolean = false;
  isPhoneAccess: boolean = false; // Variable para determinar si se accedió mediante phone
  aboutUsTitle: string = '';
  aboutUsParagraph1: string = '';
  aboutUsParagraph2: string = '';
  desc3Title: string = '';
  desc3Paragraph: string = '';

  constructor(
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();
    const phone = this.route.snapshot.paramMap.get('phone');

    if (phone && /^\d{8,9}$/.test(phone)) {
      // Si hay un número en la URL, usarlo como parámetro
      this.isPhoneAccess = true;
      this.companyService.obtenerEmpresaByPhone(phone).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.processAboutUs(this.empresa.aboutUs);
          this.processDesc3(this.empresa.desc3);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener la empresa por teléfono:', error);
          this.loading = false;
        }
      });
    } else if (token) {
      // Si no hay un número en la URL, usar el token para obtener la empresa
      this.companyService.obtenerEmpresa(token).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.processAboutUs(this.empresa.aboutUs);
          this.processDesc3(this.empresa.desc3);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener la empresa:', error);
          this.loading = false;
        }
      });
    } else {
      console.error('Token no encontrado');
      this.loading = false;
    }
  }

  processAboutUs(aboutUs: string): void {
    if (aboutUs) {
      const parts = aboutUs.split('\n').filter(part => part.trim() !== '');
      this.aboutUsTitle = parts[0] || '';
      this.aboutUsParagraph1 = parts[1] || '';
      this.aboutUsParagraph2 = parts[2] || '';
    }
  }

  processDesc3(desc3: string): void {
    if (desc3) {
      const parts = desc3.split('\n').filter(part => part.trim() !== '');
      this.desc3Title = parts[0] || '';
      this.desc3Paragraph = parts[1] || '';
    }
  }

  ngAfterViewInit() {}

  onArrowLeftClick(event: MouseEvent) {
    // Encuentra el contenedor del carousel específico
    const carouselContainer = (event.target as HTMLElement).closest('.section1');
    if (!carouselContainer) return;
  
    // Selecciona solo el carousel dentro del contenedor específico
    const carousel = carouselContainer.querySelector('.carousel');
    const cardWidth = carouselContainer.querySelector('.card')?.clientWidth || 0;
    if (carousel) {
      carousel.scrollLeft -= cardWidth;
    }
  }
  
  onArrowRightClick(event: MouseEvent) {
    // Encuentra el contenedor del carousel específico
    const carouselContainer = (event.target as HTMLElement).closest('.section1');
    if (!carouselContainer) return;
  
    // Selecciona solo el carousel dentro del contenedor específico
    const carousel = carouselContainer.querySelector('.carousel');
    const cardWidth = carouselContainer.querySelector('.card')?.clientWidth || 0;
    if (carousel) {
      carousel.scrollLeft += cardWidth;
    }
  }

  sendContactEmail(contactForm: any): void {
    const email = localStorage.getItem('email') || 'No encontrado';
    const asunto = contactForm.value.subject;
    const descripcion = contactForm.value.message;
    const emailDestino = this.empresa.email;

    this.userService.contactMe(email, asunto, descripcion, emailDestino).subscribe({
        next: (response) => {
            console.log('Correo enviado correctamente', response);
            alert('Correo enviado correctamente');
        },
        error: (error) => {
            console.error('Error al enviar el correo:', error);
            alert('Error al enviar el correo');
        }
    });
  }
}