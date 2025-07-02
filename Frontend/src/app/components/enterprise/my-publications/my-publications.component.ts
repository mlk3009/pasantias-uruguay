import { Component, OnInit, OnChanges, SimpleChanges, HostListener, OnDestroy } from '@angular/core';
import { NavComponent } from '../../home/nav/nav.component';
import { CompanyService } from '../../../services/company.service';
import { PublicationService } from '../../../services/publication.service'; // Importar el servicio
import { UserService } from '../../../services/user.service'; // Importar el servicio de usuario
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-publications',
  standalone: true,
  imports: [NavComponent, CommonModule, HttpClientModule, FormsModule, RouterModule],
  templateUrl: './my-publications.component.html',
  styleUrls: ['./my-publications.component.css']
})
export class MyPublicationsComponent implements OnInit, OnChanges, OnDestroy {

  publicaciones: any[] = [];
  empresa: any;
  loading: boolean = false;
  displayedPublications: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 18;
  isPhoneAccess: boolean = false;
  userImageUrl: string = '';
  saldos: any[] = []; 
  necesitaData: any[] = []; // Para almacenar datos de saldos disponibles 

  newPublication: any = {
    title: '',
    description: '',
    description2: '',
    description3: '',
    salary: null,
    location: '',
    type: '',
    time: '',
    vacancies: null,
    empresa_id: null,
    saldo_id: null,
    id_image: [],
    etiquetas: []
  };

  // Variables para el carrusel de imágenes
  publicationImages: any[] = [];
  currentImageIndex: number = 0;
  
  // Variable para rastrear imágenes temporales
  temporaryImageIds: string[] = [];

  // Variables para etiquetas
  etiquetas: any[] = [];
  selectedEtiquetas: any[] = [];
  selectedEtiquetasEdit: any[] = []; // Para el formulario de edición

  // Variable para modal de promoción
  selectedNewPromocion: string = '';

  startDate: string = '';
  endDate: string = '';
  searchParams: any = {
    search: '',
    location: '',
    etiqueta: '',
    featured: false,
    is_deleted: false,
    phone: ''
  };
  noPublicationsMessage: string = '';
  deletePublicationId: number | null = null;
  disablePublicationId: number | null = null;

  constructor(
    private companyService: CompanyService,
    private publicationService: PublicationService, // Inyectar el servicio
    private userService: UserService, // Inyectar el servicio de usuario
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publications']) {
      this.currentPage = 1; // Resetear a la primera página cuando cambien las publicaciones
      this.updateDisplayedPublications();
    }
  }

  ngOnInit(): void {
    this.loading = true;
    // Inicializar variables del carrusel
    this.publicationImages = [];
    this.currentImageIndex = 0;
    this.temporaryImageIds = [];
    
    const token = this.companyService.getToken();
    const phone = this.route.snapshot.paramMap.get('phone');

    if (phone && /^\d{8,9}$/.test(phone)) {
      // Si hay un número en la URL, usarlo como parámetro
      this.isPhoneAccess = true;
      this.companyService.obtenerEmpresaByPhone(phone).subscribe({
        next: (response) => {
          this.empresa = response.data;
          this.newPublication.empresa_id = this.empresa.id; // Asignar empresa_id a la nueva publicación
          this.searchParams.phone = this.empresa.phone; // Asignar el phone a searchParams
          this.obtenerPublicaciones(this.empresa.phone);
          this.cargarImagenesEmpresa(this.empresa.images);
          this.obtenerSaldo(this.empresa.id); // Obtener los saldos
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
          this.newPublication.empresa_id = this.empresa.id; 
          this.searchParams.phone = this.empresa.phone; 
          this.obtenerPublicaciones(this.empresa.id);
          this.cargarImagenesEmpresa(this.empresa.images);
          this.obtenerSaldo(this.empresa.id); 
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

    // Cargar etiquetas disponibles
    this.getEtiquetas();
  }

  cargarImagenesEmpresa(images: any[]): void {
    const empresaImage = images.find((img: any) => img.desc === 'empresaimg');
    if (empresaImage) {
      this.userImageUrl = `http://localhost:8000/images/uploads/${empresaImage.image}`;
    } else {
      this.userImageUrl = 'http://localhost:8000/images/empresa.png';
    }
  }

  obtenerPublicaciones(empresaId: string): void {
    this.companyService.obtenerPublicaciones(empresaId, undefined, undefined).subscribe({
      next: (response) => {
        this.publicaciones = response.data;
        
        // Agregar imageUrl a cada publicación
        this.publicaciones.forEach((publicacion: any) => {
          publicacion.imageUrl = publicacion.image 
            ? `http://localhost:8000/images/uploads/${publicacion.image}` 
            : 'http://localhost:8000/images/defaultPubli.jpg';
        });
        
        this.updateDisplayedPublications(); // Actualizar las publicaciones mostradas
      },
      error: (error) => {
        console.error('Error al obtener las publicaciones:', error);
      }
    });
  }

  obtenerSaldo(empresaId: string): void {
    this.companyService.obtenerSaldo(empresaId).subscribe({
      next: (response) => {
        this.saldos = response.data;
        this.necesitaData = response.data; // Los datos ya incluyen quantity
        console.log('Datos de saldos y cantidades cargados:', this.necesitaData);
      },
      error: (error) => {
        console.error('Error al obtener los saldos:', error);
      }
    });
  }

  loadPublicationData(publication: any): void {
    this.newPublication = { ...publication };
    
    // Cargar etiquetas de la publicación para edición
    if (publication.etiquetas && Array.isArray(publication.etiquetas)) {
      this.selectedEtiquetasEdit = publication.etiquetas.map((etiquetaName: string) => {
        return this.etiquetas.find(e => e.name === etiquetaName);
      }).filter(Boolean); // Eliminar elementos undefined
    } else {
      this.selectedEtiquetasEdit = [];
    }

    const [startDate, endDate] = publication.time ? publication.time.split(' - ') : ['', ''];
    this.startDate = startDate;
    this.endDate = endDate;
  }

  modalDelete(id: number) {
    this.deletePublicationId = id;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeleteClose() {
    this.deletePublicationId = null;
    const modal = document.getElementById('deleteModal') as HTMLElement;
    modal.style.display = 'none';
  }

  confirmDeletePublication() {
    if (this.deletePublicationId !== null) {
      this.publicationService.destroyPublication(this.deletePublicationId).subscribe(
        response => {
          // Actualiza la lista después de eliminar
          this.obtenerPublicaciones(this.empresa.id);
          this.modalDeleteClose();
        },
        error => {
          console.error('Error al eliminar la publicación:', error);
          this.modalDeleteClose();
        }
      );
    }
  }
  modalModificar(publication: any) {
    this.loadPublicationData(publication);
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalModificarClose() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'none';
  }

  verPostulantes(tituloPublicacion: string) {
    // Navegar a /postulantes con el título de la publicación como query parameter
    this.router.navigate(['/postulantes'], { 
      queryParams: { 
        search: tituloPublicacion 
      } 
    });
  }

  modalDeshabilitar(id: number) {
    this.disablePublicationId = id;
    const modal = document.getElementById('deshabilitarModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalDeshabilitarClose() {
    this.disablePublicationId = null;
    const modal = document.getElementById('deshabilitarModal') as HTMLElement;
    modal.style.display = 'none';
  }

  confirmDisablePublication() {
    if (this.disablePublicationId !== null) {
      this.publicationService.softDeletePublication(this.disablePublicationId).subscribe(
        response => {
          console.log('Publicación deshabilitada exitosamente:', response);
          // Actualizar la lista después de deshabilitar
          this.obtenerPublicaciones(this.empresa.id);
          this.modalDeshabilitarClose();
        },
        error => {
          console.error('Error al deshabilitar la publicación:', error);
          this.modalDeshabilitarClose();
        }
      );
    }
  }

  modalHabilitarInfo() {
    const modal = document.getElementById('habilitarInfoModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalHabilitarInfoClose() {
    const modal = document.getElementById('habilitarInfoModal') as HTMLElement;
    modal.style.display = 'none';
  }

  onDeletedFilterChange() {
    // Recargar las publicaciones cuando cambie el filtro de suspendidos
    if (this.isPhoneAccess) {
      this.obtenerPublicaciones(this.empresa.phone);
    } else {
      this.obtenerPublicaciones(this.empresa.id);
    }
  }

  imgModificar() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalImgClose() {
    const modal = document.getElementById('modificarModal') as HTMLElement;
    modal.style.display = 'none';
  }

  modalAnadir() {
    // Limpiar el formulario cuando se abre el modal
    this.newPublication = {
      title: '',
      description: '',
      description2: '',
      description3: '',
      salary: null,
      location: '',
      type: '',
      time: '',
      vacancies: null,
      empresa_id: this.empresa.id,
      saldo_id: null,
      id_image: [],
      etiquetas: []
    };
    
    // Limpiar fechas
    this.startDate = '';
    this.endDate = '';
    
    // Limpiar etiquetas seleccionadas
    this.selectedEtiquetas = [];
    
    // Limpiar imágenes
    this.publicationImages = [];
    this.currentImageIndex = 0;
    
    const modal = document.getElementById('añadirModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalAnadirClose() {
    const modal = document.getElementById('añadirModal') as HTMLElement;
    modal.style.display = 'none';
    
    // Limpiar las imágenes temporales que no se han guardado
    this.cleanTemporaryImages();
    
    // Limpiar el formulario completo
    this.newPublication = {
      title: '',
      description: '',
      description2: '',
      description3: '',
      salary: null,
      location: '',
      type: '',
      time: '',
      vacancies: null,
      empresa_id: null,
      saldo_id: null,
      id_image: [],
      etiquetas: []
    };
    
    // Limpiar fechas
    this.startDate = '';
    this.endDate = '';
    
    // Limpiar las imágenes del carrusel
    this.publicationImages = [];
    this.currentImageIndex = 0;
    
    // Limpiar las etiquetas seleccionadas
    this.selectedEtiquetas = [];
  }

  updateDisplayedPublications(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPublications = this.publicaciones.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if ((this.currentPage * this.itemsPerPage) < this.publicaciones.length) {
      this.currentPage++;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); // Desplazarse al elemento con id "top"
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPublications();
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' }); // Desplazarse al elemento con id "top"
    }
  }

  // Método para validar si todos los campos obligatorios están completos
  isFormValid(): boolean {
    return !!(
      this.newPublication.title &&
      this.newPublication.salary &&
      this.newPublication.location &&
      this.newPublication.vacancies &&
      this.newPublication.saldo_id &&
      this.selectedEtiquetas.length > 0 // Al menos una etiqueta debe estar seleccionada
    );
  }

  // Nueva función para crear una publicación
  createPublication(): void {
    // Solo asignar time si ambas fechas están presentes
    if (this.startDate && this.endDate) {
      this.newPublication.time = `${this.startDate} - ${this.endDate}`;
    } else if (this.startDate) {
      this.newPublication.time = this.startDate;
    } else if (this.endDate) {
      this.newPublication.time = this.endDate;
    } else {
      this.newPublication.time = null; // Asignar null en lugar de cadena vacía
    }
    
    // Limpiar campos vacíos para enviar null en lugar de cadenas vacías
    if (!this.newPublication.type || this.newPublication.type === '') {
      this.newPublication.type = null;
    }
    
    // Agregar las etiquetas seleccionadas a la publicación
    const etiquetaIds = this.selectedEtiquetas.map(etiqueta => etiqueta.id);
    const publicationData = {
      ...this.newPublication,
      etiquetas: etiquetaIds
    };
    
    this.publicationService.createPublication(publicationData).subscribe(
      response => {
        console.log('Publication created successfully:', response);
        
        // Limpiar el array de imágenes temporales ya que se guardó la publicación
        this.temporaryImageIds = [];
        
        // Limpiar las etiquetas seleccionadas
        this.selectedEtiquetas = [];
        
        // Actualizar la lista de publicaciones después de crear una nueva
        this.obtenerPublicaciones(this.empresa.id);
        this.modalAnadirClose(); // Cerrar el modal después de crear la publicación
      },
      error => {
        console.error('Error creating publication:', error);
      }
    );
  }

  updatePartial(id: string, updatedPublication: any): void {
    // Agregar etiquetas si están seleccionadas
    if (this.selectedEtiquetasEdit.length > 0) {
      updatedPublication.etiquetas = this.selectedEtiquetasEdit.map(e => e.id);
    }

    this.publicationService.updatePartial(id, updatedPublication).subscribe(
      response => {
        console.log('Publication updated successfully:', response);
        this.obtenerPublicaciones(this.empresa.id);
        this.modalModificarClose();
      },
      error => {
        console.error('Error updating publication:', error);
      }
    );
  }

  storeImage(file: File, userId?: number): void {
    this.userService.storeImage(file, userId).subscribe(
      response => {
        console.log('Imagen cargada exitosamente', response);
      },
      error => {
        console.error('Error al cargar la imagen:', error);
      }
    );
  }

  deleteImage(imageId: string): void {
    this.userService.deleteImage(imageId).subscribe(
      response => {
        console.log('Imagen eliminada exitosamente', response);
      },
      error => {
        console.error('Error al eliminar la imagen:', error);
      }
    );
  }

  searchPublications(): void {
    this.publicationService.searchPublications(this.searchParams).subscribe(
      (response: any) => { // <-- aquí el cast
        if (Array.isArray(response) && response.length > 0 && response[0].publications) {
          this.publicaciones = response[0].publications;
        }
        else if (!Array.isArray(response) && response && response.publications) {
          this.publicaciones = response.publications;
        }
        else if (Array.isArray(response)) {
          this.publicaciones = response;
        }
        else {
          this.publicaciones = [];
        }
        
        // Agregar imageUrl a cada publicación
        this.publicaciones.forEach((publicacion: any) => {
          publicacion.imageUrl = publicacion.image 
            ? `http://localhost:8000/images/uploads/${publicacion.image}` 
            : 'http://localhost:8000/images/defaultPubli.jpg';
        });
        
        this.noPublicationsMessage = '';
        this.updateDisplayedPublications();
      },
      (error) => {
        if (error.message === 'No se encontraron publicaciones.') {
          this.publicaciones = [];
          this.noPublicationsMessage = 'No se encontraron publicaciones.';
          this.updateDisplayedPublications();
        } else {
          console.error('Error searching publications:', error);
        }
      }
    );
  }

  // Método para limpiar imágenes temporales
  cleanTemporaryImages(): void {
    if (this.temporaryImageIds.length > 0) {
      // Usar múltiples llamadas individuales a deleteImage
      const deleteRequests = this.temporaryImageIds.map(imageId => 
        this.userService.deleteImage(imageId)
      );
      
      // Ejecutar todas las peticiones en paralelo
      forkJoin(deleteRequests).subscribe(
        (responses: any[]) => {
          console.log('Imágenes temporales eliminadas exitosamente', responses);
          this.temporaryImageIds = [];
        },
        (error: any) => {
          console.error('Error al eliminar imágenes temporales:', error);
          // Aún así limpiar el array para evitar intentos repetidos
          this.temporaryImageIds = [];
        }
      );
    }
  }

  // Escuchar evento beforeunload para limpiar imágenes antes de recargar/cerrar
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: any): void {
    if (this.temporaryImageIds.length > 0) {
      // Llamar a la limpieza de imágenes temporales
      this.cleanTemporaryImages();
    }
  }

  // Implementar OnDestroy para limpiar cuando el componente se destruye
  ngOnDestroy(): void {
    this.cleanTemporaryImages();
  }

  // Métodos para el carrusel de imágenes
  addImageToPublication(file: File): void {
    const imageOrder = this.publicationImages.length + 1;
    const desc = `publicationImage${imageOrder}`;
    
    this.userService.storeImage(file, this.empresa.id, desc).subscribe(
      (response: any) => {
        console.log('Imagen cargada exitosamente', response);
        const newImage = {
          id: response.id,
          image: response.image,
          desc: desc,
          order: imageOrder,
          url: `http://localhost:8000/images/uploads/${response.image}`
        };
        this.publicationImages.push(newImage);
        this.publicationImages.sort((a, b) => a.order - b.order);
        this.newPublication.id_image.push(response.id);
        
        // Agregar a imágenes temporales para poder limpiarlas si no se guarda la publicación
        this.temporaryImageIds.push(response.id);
      },
      (error: any) => {
        console.error('Error al cargar la imagen:', error);
      }
    );
  }

  removeImageFromPublication(index: number): void {
    if (index >= 0 && index < this.publicationImages.length) {
      const imageToRemove = this.publicationImages[index];
      
      this.userService.deleteImage(imageToRemove.id).subscribe(
        response => {
          console.log('Imagen eliminada exitosamente', response);
          this.publicationImages.splice(index, 1);
          
          // Remover de la lista de IDs de la publicación
          const imageIdIndex = this.newPublication.id_image.indexOf(imageToRemove.id);
          if (imageIdIndex > -1) {
            this.newPublication.id_image.splice(imageIdIndex, 1);
          }
          
          // Remover de imágenes temporales también
          const tempImageIndex = this.temporaryImageIds.indexOf(imageToRemove.id);
          if (tempImageIndex > -1) {
            this.temporaryImageIds.splice(tempImageIndex, 1);
          }
          
          // Ajustar el índice currentImageIndex si es necesario
          if (this.currentImageIndex >= this.publicationImages.length) {
            this.currentImageIndex = Math.max(0, this.publicationImages.length - 1);
          }
          
          // Reordenar las imágenes restantes
          this.reorderImages();
        },
        error => {
          console.error('Error al eliminar la imagen:', error);
        }
      );
    }
  }

  changeImageOrder(imageIndex: number, newOrder: number): void {
    if (!newOrder || imageIndex < 0 || imageIndex >= this.publicationImages.length || 
        newOrder < 1 || newOrder > this.publicationImages.length) {
      return;
    }
    
    const imageToMove = this.publicationImages[imageIndex];
    const oldOrder = imageToMove.order;
    
    // Si es la misma posición, no hacer nada
    if (oldOrder === newOrder) {
      return;
    }
    
    // Encontrar la imagen que actualmente tiene el newOrder
    const conflictingImage = this.publicationImages.find(img => img.order === newOrder && img !== imageToMove);
    
    if (conflictingImage) {
      // Intercambiar órdenes
      conflictingImage.order = oldOrder;
      conflictingImage.desc = `publicationImage${oldOrder}`;
    }
    
    // Actualizar la imagen movida
    imageToMove.order = newOrder;
    imageToMove.desc = `publicationImage${newOrder}`;
    
    // Reordenar array
    this.publicationImages.sort((a, b) => a.order - b.order);
    
    // Actualizar el índice actual para seguir mostrando la misma imagen
    this.currentImageIndex = this.publicationImages.findIndex(img => img === imageToMove);
    
    // Actualizar en el backend
    const imageOrders = this.publicationImages.map(img => ({
      image_id: img.id,
      new_order: img.order
    }));
    
    this.updateImageOrder(imageOrders);
  }

  updateImageOrder(imageOrders: any[]): void {
    // Implementar llamada al servicio para actualizar orden en el backend
    this.publicationService.cambiarOrdenImg(this.newPublication.id, imageOrders).subscribe(
      (response: any) => {
        console.log('Orden de imágenes actualizado exitosamente', response);
      },
      (error: any) => {
        console.error('Error al actualizar el orden de las imágenes:', error);
      }
    );
  }

  reorderImages(): void {
    this.publicationImages.forEach((img, index) => {
      img.order = index + 1;
      img.desc = `publicationImage${index + 1}`;
    });
    
    if (this.publicationImages.length > 0) {
      const imageOrders = this.publicationImages.map(img => ({
        image_id: img.id,
        new_order: img.order
      }));
      this.updateImageOrder(imageOrders);
    }
  }

  nextImage(): void {
    if (this.publicationImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.publicationImages.length;
    }
  }

  prevImage(): void {
    if (this.publicationImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.publicationImages.length) % this.publicationImages.length;
    }
  }

  getCurrentImage(): any {
    if (this.publicationImages.length > 0 && this.currentImageIndex >= 0 && this.currentImageIndex < this.publicationImages.length) {
      return this.publicationImages[this.currentImageIndex];
    }
    return null;
  }

  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.addImageToPublication(file);
    }
  }

  // Métodos para manejar etiquetas
  getEtiquetas(): void {
    this.userService.getEtiquetas().subscribe({
      next: (etiquetas) => {
        this.etiquetas = etiquetas;
      },
      error: (error) => {
        console.error('Error al obtener las etiquetas:', error);
      }
    });
  }

  onTagSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const etiquetaId = Number(selectElement.value);
    
    // Verificar que se haya seleccionado una etiqueta válida
    if (etiquetaId && this.selectedEtiquetas.length < 3) {
      const etiqueta = this.etiquetas.find(e => e.id === etiquetaId);
      if (etiqueta && !this.isEtiquetaSelected(etiquetaId)) {
        this.selectedEtiquetas.push(etiqueta);
        this.newPublication.etiquetas = this.selectedEtiquetas.map(e => e.id);
        // Resetear el select a la opción por defecto después de agregar
        selectElement.value = '';
      }
    }
  }

  onTagDelete(etiquetaId: number): void {
    this.selectedEtiquetas = this.selectedEtiquetas.filter(e => e.id !== etiquetaId);
    this.newPublication.etiquetas = this.selectedEtiquetas.map(e => e.id);
  }

  isEtiquetaSelected(etiquetaId: number): boolean {
    return this.selectedEtiquetas.some(etiqueta => etiqueta.id === etiquetaId);
  }

  // Métodos para etiquetas en edición
  onEtiquetaSelect(event: any): void {
    const etiquetaId = parseInt(event.target.value);
    if (etiquetaId && !this.isEtiquetaSelectedEdit(etiquetaId)) {
      const etiqueta = this.etiquetas.find(e => e.id === etiquetaId);
      if (etiqueta && this.selectedEtiquetasEdit.length < 3) {
        this.selectedEtiquetasEdit.push(etiqueta);
      }
      event.target.value = ''; // Reset select
    }
  }

  isEtiquetaSelectedEdit(etiquetaId: number): boolean {
    return this.selectedEtiquetasEdit.some(etiqueta => etiqueta.id === etiquetaId);
  }

  removeEtiquetaEdit(etiquetaId: number): void {
    this.selectedEtiquetasEdit = this.selectedEtiquetasEdit.filter(e => e.id !== etiquetaId);
  }

  getSaldoQuantity(saldoId: number): number {
    console.log('Buscando cantidad para saldo_id:', saldoId);
    console.log('Datos disponibles:', this.necesitaData);
    const necesita = this.necesitaData.find((n: any) => n.saldo_id === saldoId);
    console.log('Resultado encontrado:', necesita);
    return necesita ? necesita.quantity : 0;
  }

  // Función para permitir solo números en los inputs
  onlyNumbers(event: any): void {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    event.target.value = numericValue;
    
    // Actualizar el modelo correspondiente
    if (event.target.placeholder.includes('Remuneración')) {
      this.newPublication.salary = numericValue ? parseInt(numericValue) : null;
    } else if (event.target.placeholder.includes('Plazas')) {
      this.newPublication.vacancies = numericValue ? parseInt(numericValue) : null;
    }
  }

  // Métodos para modal de promoción
  openPromocionModal(): void {
    this.selectedNewPromocion = '';
    // Recargar datos de saldos antes de abrir el modal
    this.obtenerSaldo(this.empresa.id.toString());
    const modal = document.getElementById('promocionModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closePromocionModal(): void {
    this.selectedNewPromocion = '';
    const modal = document.getElementById('promocionModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  confirmPromocionChange(): void {
    if (this.selectedNewPromocion) {
      // Actualizar la publicación con la nueva promoción
      this.newPublication.saldo_id = parseInt(this.selectedNewPromocion);
      this.closePromocionModal();
      // Llamar al método de actualización con la promoción
      this.updatePartialWithPromocion(this.newPublication.id, this.newPublication);
    }
  }

  updatePartialWithPromocion(id: number, updatedPublication: any): void {
    // Incluir las etiquetas seleccionadas si hay
    if (this.selectedEtiquetasEdit.length > 0) {
      updatedPublication.etiquetas = this.selectedEtiquetasEdit.map(e => e.id);
    }

    // Incluir el saldo_id para la promoción
    updatedPublication.empresa_id = this.empresa.id;

    this.publicationService.updatePartial(id.toString(), updatedPublication).subscribe({
      next: (response: any) => {
        console.log('Publicación actualizada con promoción:', response);
        this.ngOnInit();
        this.modalModificarClose();
        alert('Publicación actualizada y promoción cambiada exitosamente');
      },
      error: (error: any) => {
        console.error('Error al actualizar publicación con promoción:', error);
        if (error.error && error.error.message) {
          alert('Error: ' + error.error.message);
        } else {
          alert('Error al actualizar la publicación con promoción');
        }
      }
    });
  }
}