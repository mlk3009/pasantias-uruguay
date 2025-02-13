import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { NavComponent } from '../../home/nav/nav.component';
import { ActivatedRoute, Router } from '@angular/router'; // Importar Router
import { CompanyService } from '../../../services/company.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-edit-enterprise-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent], // Agregar FormsModule a imports
  templateUrl: './edit-enterprise-profile.component.html',
  styleUrls: ['./edit-enterprise-profile.component.css']
})
export class EditEnterpriseProfileComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fileInputEmpresa') fileInputEmpresa!: ElementRef;
  @ViewChild('fileInputMuro') fileInputMuro!: ElementRef;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  publications: any[] = [];
  loading: boolean = false;
  errorMessage: string = ''; 
  userImageUrl: string = '';
  empresaImageUrl: string = '';
  muroImageUrl: string = '';
  previousImageId: string | null = null;
  previousEmpresaImageId: string | null = null;
  previousMuroImageId: string | null = null;

  desc1Title: string = '';
  desc1Paragraph1: string = '';
  desc1Paragraph2: string = '';
  desc2Title: string = '';
  desc2Paragraph1: string = '';
  desc2Paragraph2: string = '';
  desc3Title: string = '';
  desc3Paragraph: string = '';
  aboutUsTitle: string = '';
  aboutUsParagraph1: string = '';
  aboutUsParagraph2: string = '';

  constructor(
    private companyService: CompanyService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router // Inyectar Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();

    if (token) {
      this.companyService.obtenerEmpresa(token).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.obtenerPublicaciones(this.empresa.id);
          this.processDesc1(this.empresa.desc1);
          this.processDesc2(this.empresa.desc2);
          this.processDesc3(this.empresa.desc3);
          this.processAboutUs(this.empresa.aboutUs);
          if (this.empresa.id_image) {
            this.userImageUrl = `http://localhost:8000/images/uploads/${this.empresa.image}`;
            this.previousImageId = this.empresa.id_image;
          } else {
            this.userImageUrl = 'http://localhost:8000/images/user.png';
          }
          if (this.empresa.id_empresa_image) {
            this.empresaImageUrl = `http://localhost:8000/images/uploads/${this.empresa.empresa_image}`;
            this.previousEmpresaImageId = this.empresa.id_empresa_image;
          } else {
            this.empresaImageUrl = 'http://localhost:8000/images/empresa.png';
          }
          if (this.empresa.id_muro_image) {
            this.muroImageUrl = `http://localhost:8000/images/uploads/${this.empresa.muro_image}`;
            this.previousMuroImageId = this.empresa.id_muro_image;
          } else {
            this.muroImageUrl = 'http://localhost:8000/images/default-muro.png';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al obtener la empresa:', error);
          this.errorMessage = 'Error al obtener la empresa: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      console.error('Token no encontrado');
      this.errorMessage = 'Token no encontrado';
      this.loading = false;
    }
  }

  obtenerPublicaciones(empresaId: string): void {
    this.companyService.obtenerPublicaciones(empresaId, undefined, 9).subscribe({
      next: (response) => {
        this.publications = response.data;
      },
      error: (error) => {
        console.error('Error al obtener las publicaciones:', error);
        this.errorMessage = 'Error al obtener las publicaciones: ' + error.message;
      }
    });
  }

  ngAfterViewInit() {}

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

  processAboutUs(aboutUs: string): void {
    if (aboutUs) {
      const parts = aboutUs.split('\n').filter(part => part.trim() !== '');
      this.aboutUsTitle = parts[0] || '';
      this.aboutUsParagraph1 = parts[1] || '';
      this.aboutUsParagraph2 = parts[2] || '';
    }
  }

  combineDesc1(): string {
    return [this.desc1Title, this.desc1Paragraph1, this.desc1Paragraph2].filter(part => part.trim() !== '').join('\n');
  }

  combineDesc2(): string {
    return [this.desc2Title, this.desc2Paragraph1, this.desc2Paragraph2].filter(part => part.trim() !== '').join('\n');
  }

  combineDesc3(): string {
    return [this.desc3Title, this.desc3Paragraph].filter(part => part.trim() !== '').join('\n');
  }

  combineAboutUs(): string {
    return [this.aboutUsTitle, this.aboutUsParagraph1, this.aboutUsParagraph2].filter(part => part.trim() !== '').join('\n');
  }

  updateProfile(): void {
    const token = this.companyService.getToken();
    if (token) {
      const data = {
        ...this.empresa,
        name: this.empresa.name,
        email: this.empresa.email,
        sede: this.empresa.sede,
        phone: this.empresa.phone,
        desc1: this.combineDesc1(),
        desc2: this.combineDesc2(),
        desc3: this.combineDesc3(),
        aboutUs: this.combineAboutUs()
      };
  
      this.userService.update(data, token).subscribe({
        next: (response) => {
          console.log('Perfil actualizado con éxito:', response);
          window.location.reload();
        },
        error: (error) => {
          console.error('Error al actualizar el perfil:', error);
          this.errorMessage = 'Error al actualizar el perfil: ' + error.message;
        }
      });
    } else {
      console.error('Token no encontrado');
      this.errorMessage = 'Token no encontrado';
    }
  }

  onImageClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadNewImage(file, 'profile');
    }
  }

  onEmpresaImageClick(): void {
    this.fileInputEmpresa.nativeElement.click();
  }

  onEmpresaFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadNewImage(file, 'empresaimg');
    }
  }

  onMuroImageClick(): void {
    this.fileInputMuro.nativeElement.click();
  }

  onMuroFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadNewImage(file, 'muro');
    }
  }

  uploadNewImage(file: File, desc: string): void {
    console.log('ID de la empresa:', this.empresa.id);
  
    // Primero sube la nueva imagen
    this.userService.storeImage(file, this.empresa.id, desc).subscribe(
      response => {
        console.log('Imagen cargada exitosamente', response);
        const newImageId = response.id;
        if (desc === 'profile') {
          this.userImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
  
          // Borrar la imagen anterior si existe
          if (this.previousImageId) {
            this.userService.deleteImage(this.previousImageId).subscribe(() => {
              console.log('Imagen anterior eliminada');
            });
          }
  
          // Actualizar el id_image anterior
          this.previousImageId = newImageId;
        } else if (desc === 'empresaimg') {
          this.empresaImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
  
          // Borrar la imagen anterior si existe
          if (this.previousEmpresaImageId) {
            this.userService.deleteImage(this.previousEmpresaImageId).subscribe(() => {
              console.log('Imagen anterior eliminada');
            });
          }
  
          // Actualizar el id_empresa_image anterior
          this.previousEmpresaImageId = newImageId;
        } else if (desc === 'muro') {
          this.muroImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
  
          // Borrar la imagen anterior si existe
          if (this.previousMuroImageId) {
            this.userService.deleteImage(this.previousMuroImageId).subscribe(() => {
              console.log('Imagen anterior eliminada');
            });
          }
  
          // Actualizar el id_muro_image anterior
          this.previousMuroImageId = newImageId;
        }
      },
      error => {
        console.error('Error al cargar la imagen', error);
      }
    );
  }

  onArrowLeftClick(event: MouseEvent) {
    // Lógica para el carrusel existente
  }

  onArrowRightClick(event: MouseEvent) {
    // Lógica para el carrusel existente
  }
}