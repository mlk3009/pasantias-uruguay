import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { NavComponent } from '../../../components/home/nav/nav.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Importar Router
import { CompanyService } from '../../../services/company.service';
import { UserService } from '../../../services/user.service';
import { PublicationService } from '../../../services/publication.service';

@Component({
  selector: 'app-edit-enterprise-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, RouterModule], // Agregar FormsModule a imports
  templateUrl: './edit-enterprise-profile.component.html',
  styleUrls: ['./edit-enterprise-profile.component.css']
})
export class EditEnterpriseProfileComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('fileInputEmpresa') fileInputEmpresa!: ElementRef;
  @ViewChild('fileInputMuro2') fileInputMuro2!: ElementRef;
  @ViewChild('fileInputMuro') fileInputMuro!: ElementRef;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  publications: any[] = [];
  loading: boolean = false;
  errorMessage: string = ''; 
  userImageUrl: string = '';
  empresaImageUrl: string = '';
  muro2ImageUrl: string = '';
  muroImageUrl: string = '';
  previousImageId: string | null = null;
  previousEmpresaImageId: string | null = null;
  previousMuro2ImageId: string | null = null;
  previousMuroImageId: string | null = null;
  displayedPublications: any[] = [];

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
    private router: Router,
    private publicationService: PublicationService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.companyService.getToken();

    if (token) {
      this.companyService.obtenerEmpresa(token).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.getPublications(); // Llamar sin parámetros para obtener publicaciones destacadas
          this.processDesc1(this.empresa.desc1);
          this.processDesc2(this.empresa.desc2);
          this.processDesc3(this.empresa.desc3);
          this.processAboutUs(this.empresa.aboutUs);
          this.cargarImagenesEmpresa(this.empresa.images);
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


  cargarImagenesEmpresa(images: any[]): void {
    const profileImage = images.find((img: any) => img.desc === 'profile');
    const empresaImage = images.find((img: any) => img.desc === 'empresaimg');
    const muro2Image = images.find((img: any) => img.desc === 'muro2');
    const muroImage = images.find((img: any) => img.desc === 'muro');

    if (profileImage) {
      this.userImageUrl = `http://localhost:8000/images/uploads/${profileImage.image}`;
      this.previousImageId = profileImage.id;
    } else {
      this.userImageUrl = 'http://localhost:8000/images/user.png';
      this.previousImageId = null;
    }

    if (empresaImage) {
      this.empresaImageUrl = `http://localhost:8000/images/uploads/${empresaImage.image}`;
      this.previousEmpresaImageId = empresaImage.id;
    } else {
      this.empresaImageUrl = 'http://localhost:8000/images/empresa.png';
      this.previousEmpresaImageId = null;
    }

    if (muro2Image) {
      this.muro2ImageUrl = `http://localhost:8000/images/uploads/${muro2Image.image}`;
      this.previousMuro2ImageId = muro2Image.id;
    } else {
      this.muro2ImageUrl = 'http://localhost:8000/images/default-muro2.png';
      this.previousMuro2ImageId = null;
    }

    if (muroImage) {
      this.muroImageUrl = `http://localhost:8000/images/uploads/${muroImage.image}`;
      this.previousMuroImageId = muroImage.id;
    } else {
      this.muroImageUrl = 'http://localhost:8000/images/default-muro.png';
      this.previousMuroImageId = null;
    }
  }

  getPublications(category?: string, featured: boolean = true): void {
    this.publicationService.getPublications(category, featured).subscribe(
      (response) => {
        console.log('Respuesta de publicaciones:', response); // Debug log
        if (response && response.length > 0 && response[0].publications) {
          this.displayedPublications = response[0].publications;
          console.log('Publicaciones encontradas:', this.displayedPublications.length); // Debug log
          this.displayedPublications.forEach(publication => {
            publication.imageUrl = publication.image 
              ? `http://localhost:8000/images/uploads/${publication.image}` 
              : 'http://localhost:8000/images/defaultpub.jpg';
          });
        } else {
          console.log('No se encontraron publicaciones o estructura de respuesta incorrecta'); // Debug log
          this.displayedPublications = [];
        }
      },
      (error) => {
        console.error('Error al obtener publicaciones:', error);
        this.displayedPublications = [];
      }
    );
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
      this.uploadNewImage(file, 'empresaimg');
    }
  }

  onEmpresaImageClick(): void {
    this.fileInputMuro2.nativeElement.click();
  }

  onEmpresaFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadNewImage(file, 'muro2');
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
          // Borrar la imagen anterior si existe y no es una imagen predeterminada
          if (this.previousImageId && this.previousImageId !== null) {
            this.userService.deleteImage(this.previousImageId).subscribe(
              () => console.log('Imagen anterior de perfil eliminada'),
              error => console.error('Error al eliminar imagen anterior de perfil:', error)
            );
          }
          
          this.userImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
          this.previousImageId = newImageId;
          
        } else if (desc === 'empresaimg') {
          // Borrar la imagen anterior si existe y no es una imagen predeterminada
          if (this.previousEmpresaImageId && this.previousEmpresaImageId !== null) {
            this.userService.deleteImage(this.previousEmpresaImageId).subscribe(
              () => console.log('Imagen anterior de empresa eliminada'),
              error => console.error('Error al eliminar imagen anterior de empresa:', error)
            );
          }
          
          this.empresaImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
          this.previousEmpresaImageId = newImageId;
          
        } else if (desc === 'muro2') {
          // Borrar la imagen anterior si existe y no es una imagen predeterminada
          if (this.previousMuro2ImageId && this.previousMuro2ImageId !== null) {
            this.userService.deleteImage(this.previousMuro2ImageId).subscribe(
              () => console.log('Imagen anterior de muro2 eliminada'),
              error => console.error('Error al eliminar imagen anterior de muro2:', error)
            );
          }
          
          this.muro2ImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
          this.previousMuro2ImageId = newImageId;
          
        } else if (desc === 'muro') {
          // Borrar la imagen anterior si existe y no es una imagen predeterminada
          if (this.previousMuroImageId && this.previousMuroImageId !== null) {
            this.userService.deleteImage(this.previousMuroImageId).subscribe(
              () => console.log('Imagen anterior de muro eliminada'),
              error => console.error('Error al eliminar imagen anterior de muro:', error)
            );
          }
          
          this.muroImageUrl = `http://localhost:8000/images/uploads/${response.image}`;
          this.previousMuroImageId = newImageId;
        }
      },
      error => {
        console.error('Error al cargar la imagen', error);
      }
    );
  }

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
}