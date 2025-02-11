import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile-enterprise',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile-enterprise.component.html',
  styleUrls: ['./user-profile-enterprise.component.css']
})
export class UserProfileEnterpriseComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  publicaciones: any[] = [];
  loading: boolean = false;
  isPhoneAccess: boolean = false; // Variable para determinar si se accedió mediante phone

  desc1Title: string = '';
  desc1Paragraph1: string = '';
  desc1Paragraph2: string = '';
  desc2Title: string = '';
  desc2Paragraph1: string = '';
  desc2Paragraph2: string = '';
  desc3Title: string = '';
  desc3Paragraph: string = '';

  constructor(
    private companyService: CompanyService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();
    const phone = this.route.snapshot.paramMap.get('phone');

    if (phone && /^\d{8,9}$/.test(phone)) {
      // Si hay un número en la URL, usarlo como parámetro
      this.isPhoneAccess = true; // Indicar que se accedió mediante phone
      this.companyService.obtenerEmpresaByPhone(phone).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.processDesc1(this.empresa.desc1);
          this.processDesc2(this.empresa.desc2);
          this.processDesc3(this.empresa.desc3);
          this.obtenerPublicaciones(this.empresa.phone);
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
          this.processDesc1(this.empresa.desc1);
          this.processDesc2(this.empresa.desc2);
          this.processDesc3(this.empresa.desc3);
          this.obtenerPublicaciones(this.empresa.id);
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

  obtenerPublicaciones(empresaId: string): void {
    this.companyService.obtenerPublicaciones(empresaId, undefined, 9).subscribe({
      next: (response) => {
        this.publicaciones = response.data;
      },
      error: (error) => {
        console.error('Error al obtener las publicaciones:', error);
      }
    });
  }

  processDesc1(desc1: string): void {
    if (desc1) {
      const parts = desc1.split('\n').filter(part => part.trim() !== '');
      this.desc1Title = parts[0] || '';
      this.desc1Paragraph1 = parts[1] || '';
      this.desc1Paragraph2 = parts[2] || '';
    }
  }

  processDesc2(desc2: string): void {
    if (desc2) {
      const parts = desc2.split('\n').filter(part => part.trim() !== '');
      this.desc2Title = parts[0] || '';
      this.desc2Paragraph1 = parts[1] || '';
      this.desc2Paragraph2 = parts[2] || '';
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