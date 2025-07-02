import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, ViewportScroller, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { NavigationExtras } from '@angular/router';
import { filter } from 'rxjs/operators';

import { UserService } from '../../../services/user.service';
import { CompanyService } from '../../../services/company.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    FormsModule,
  ],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements AfterViewInit {
  isDropdownVisible = false;
  isHistorialModalVisible = false;
  public token: string = '';
  public username: string = '';
  public dropdown = false;
  public currentRoute: string = '';

  public emprise = false;
  public scroll_var = true;
  
  // Propiedades para empresa
  public saldosEmpresa: any[] = [];
  public historialPublicaciones: any[] = [];
  public historialPublicacionesCompleto: any[] = [];
  public mostrarSoloDeshabilitadas = false;
  public loadingSaldo = false;
  public loadingHistorial = false;
  
  // Propiedades para saldos disponibles (precios dinámicos desde BD)
  public saldosDisponibles: any[] = [];
  public loadingSaldosDisponibles = false;

  // Precios dinámicos para las tarjetas (se cargan desde BD)
  public precioNormalIndividual = 0;
  public precioPackNormal = 0;
  public precioDestacadaIndividual = 0;
  public precioPackDestacada = 0;

  // Precios según duración y cantidad (se cargan desde BD)
  public preciosNormales: any = {};
  public preciosPackNormal: any = {};
  public preciosDestacadas: any = {};
  public preciosPackDestacada: any = {};

  public data = { name: '', surname: '', email: '', password: '', location: '', ci_estudiante: '', cod_postal: '', fec_nacimiento: '', phone: '', rol: '', cv: '' };

  // Propiedades para el modal de confirmación
  public showConfirmModal = false;
  public selectedCompra: any = null;
  public processingPurchase = false;

  constructor(
    private viewportScroller: ViewportScroller,
    private _userService: UserService,
    private _cookieService: CookieService,
    private _router: Router,
    private router: Router,
    private _companyService: CompanyService,
  ) {
    this.token = this._cookieService.get('token');
    this.currentRoute = this.router.url;
    
    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    if (this.token) {
      this._userService.obtenerUsuario(this.token).subscribe(
        response => {
          this.username = response.data.name;
          this.data = response.data;
          
          // Si es empresa, cargar saldos
          if (this.data.rol === 'empresa') {
            this.loadCompanySaldos();
          }
        },
        error => {
          // Error manejado silenciosamente
        }
      );
    }
    

    initFlowbite();
  }

  open_profile() {
    const navigationExtras: NavigationExtras = {
      state: {
        name: this.data.name,
        ci_estudiante: this.data.ci_estudiante,
        email: this.data.email,
        location: this.data.location,
        cod_postal: this.data.cod_postal,
        phone: this.data.phone,
        day: this.data.fec_nacimiento.split('-')[2],
        month: this.data.fec_nacimiento.split('-')[1],
        year: this.data.fec_nacimiento.split('-')[0],
        rol: this.data.rol,
        cv: this.data.cv
      }
    };

    this._router.navigate(['/user-profile'], navigationExtras);
  }

  get isLoggedIn() {
    const token = this._cookieService.get('token');
    return !!token;
  }

  changeDropdown() {
    this.dropdown = !this.dropdown;
  }

  logout() {
    this._userService.logout().subscribe(
      response => {
        // Logout exitoso - el UserService ya limpia las cookies
        this._router.navigate(['/inicio']).then(() => {
          window.location.reload();
        });
      },
      error => {
        console.error('Logout error', error);
        // Incluso si hay error, limpiar localmente
        this._cookieService.delete('token');
        this._router.navigate(['/inicio']).then(() => {
          window.location.reload();
        });
      }
    );
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollPosition = this.viewportScroller.getScrollPosition();
    // Decide qué opción del menú debería estar activa
    if (scrollPosition[1] == 0) {
      this.scroll_var = true;
    } else {
      this.scroll_var = false;
    }
  }

  ngAfterViewInit(): void {
    // Selecciona el botón con el atributo data-dial-toggle
    const dialToggleButton = document.querySelector('[data-dial-toggle="speed-dial-menu-dropdown-alternative"]');

    // Asegúrate de que el botón exista
    if (dialToggleButton) {
      // Agrega un evento de clic al botón
      dialToggleButton.addEventListener('click', () => {
        // Selecciona el menú correspondiente usando el valor de aria-controls
        const menuId = dialToggleButton.getAttribute('aria-controls');
        if (menuId) { // Verifica que menuId no sea null
          const menu = document.getElementById(menuId);

          if (menu) {
            // Alterna la visibilidad del menú
            const isExpanded = dialToggleButton.getAttribute('aria-expanded') === 'true';
            dialToggleButton.setAttribute('aria-expanded', (!isExpanded).toString());
            menu.classList.toggle('hidden'); // Alterna la clase 'hidden' para mostrar/ocultar el menú
          }
        }
      });
    }
  }

  moveTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    } else {
      this.router.navigate(['/ruta-del-componente'], { fragment: section });
    }
  }

  showMenu(menuId: string) {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.classList.remove('hidden');
    }
  }
  
  hideMenu(menuId: string) {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.classList.add('hidden');
    }
  }
  
  toggleMenu(menuId: string, dialToggleButton: HTMLElement) {
    if (menuId) { // Verifica que menuId no sea null
      const menu = document.getElementById(menuId);
  
      if (menu) {
        // Alterna la visibilidad del menú
        const isExpanded = dialToggleButton.getAttribute('aria-expanded') === 'true';
        dialToggleButton.setAttribute('aria-expanded', (!isExpanded).toString());
        if (isExpanded) {
          this.hideMenu(menuId);
        } else {
          this.showMenu(menuId);
        }
      }
    }
  }

  navigateToPublications() {
    this.router.navigate(['/publications']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#hide') && !target.closest('#dropdown-container')) {
      this.isDropdownVisible = false;
    }
  }


  modal(){
    const modal = document.getElementById('shopModal') as HTMLElement;
    modal.style.display = 'flex';
    
    // Cargar precios desde la base de datos
    this.loadSaldosDisponibles();
  }

  modalClose() {
    const modal = document.getElementById('shopModal') as HTMLElement;
    modal.style.display = 'none';
  }

  isActiveRoute(route: string): boolean {
    if (route === 'inicio') {
      return this.currentRoute === '/' || this.currentRoute === '/inicio' || this.currentRoute.startsWith('/inicio');
    }
    if (route === 'abaut-us') {
      return this.currentRoute.startsWith('/abaut-us');
    }
    if (route === 'publications') {
      return this.currentRoute.startsWith('/publications');
    }
    return false;
  }

  navigateToContact() {
    // Navegar a /inicio primero
    this.router.navigate(['/inicio']).then(() => {
      // Esperar y hacer scroll hacia el área de contacto (no completamente al final)
      setTimeout(() => {
        // Calcular una posición que sea aproximadamente el 80% de la página
        const scrollPosition = document.body.scrollHeight * 0.8;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 500);
    });
  }

  navigateToInicio() {
    if (this.currentRoute === '/' || this.currentRoute === '/inicio') {
      // Si ya estamos en inicio, solo hacer scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si estamos en otra página, navegar a inicio
      this.router.navigate(['/inicio']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  navigateToAboutUs() {
    if (this.currentRoute.startsWith('/abaut-us')) {
      // Si ya estamos en nosotros, solo hacer scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si estamos en otra página, navegar a nosotros
      this.router.navigate(['/abaut-us']).then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Métodos para empresa
  loadCompanySaldos() {
    if (this.data.rol !== 'empresa') return;
    
    this.loadingSaldo = true;
    this._companyService.obtenerEmpresa(this.token).subscribe(
      (response: any) => {
        if (response && response.data && response.data.id) {
          this._companyService.obtenerSaldo(response.data.id).subscribe(
            (saldoResponse: any) => {
              this.saldosEmpresa = saldoResponse.data || [];
              this.loadingSaldo = false;
            },
            (error: any) => {
              console.error('Error al cargar saldos:', error);
              this.loadingSaldo = false;
            }
          );
        } else {
          console.error('No se pudo obtener ID de empresa');
          this.loadingSaldo = false;
        }
      },
      (error: any) => {
        console.error('Error al obtener empresa:', error);
        this.loadingSaldo = false;
      }
    );
  }

  openHistorialModal() {
    this.isHistorialModalVisible = true;
    this.loadHistorialPublicaciones();
  }

  closeHistorialModal() {
    this.isHistorialModalVisible = false;
  }

  loadHistorialPublicaciones() {
    if (this.data.rol !== 'empresa') return;
    
    this.loadingHistorial = true;
    this._companyService.obtenerEmpresa(this.token).subscribe(
      (response: any) => {
        if (response && response.data && response.data.id) {
          this._companyService.obtenerPublicaciones(response.data.id).subscribe(
            (publicationsResponse: any) => {
              // Guardar todas las publicaciones primero
              this.historialPublicacionesCompleto = (publicationsResponse.data || []).map((pub: any) => ({
                id: pub.id,
                title: pub.title,
                salary: pub.salary,
                created_at: pub.created_at,
                featured: pub.featured,
                is_deleted: pub.is_deleted,
                postulaciones_count: pub.postulaciones_count || 0
              }));
              
              // Aplicar filtro inicial
              this.aplicarFiltroPublicaciones();
              this.loadingHistorial = false;
            },
            (error: any) => {
              console.error('Error al cargar historial de publicaciones:', error);
              this.loadingHistorial = false;
            }
          );
        }
      },
      (error: any) => {
        console.error('Error al obtener empresa:', error);
        this.loadingHistorial = false;
      }
    );
  }

  aplicarFiltroPublicaciones() {
    if (this.mostrarSoloDeshabilitadas) {
      this.historialPublicaciones = this.historialPublicacionesCompleto.filter(pub => pub.is_deleted);
    } else {
      this.historialPublicaciones = [...this.historialPublicacionesCompleto];
    }
  }

  getPublicacionesHabilitadas(): number {
    return this.historialPublicacionesCompleto.filter(p => !p.is_deleted).length;
  }

  getPublicacionesSuspendidas(): number {
    return this.historialPublicacionesCompleto.filter(p => p.is_deleted).length;
  }

  getTotalSaldo(): number {
    return this.saldosEmpresa.reduce((total, saldo) => total + (saldo.quantity || 0), 0);
  }

  getSaldoNormal(): number {
    const saldosNormales = this.saldosEmpresa.filter(s => s.type?.toLowerCase() === 'normal');
    return saldosNormales.reduce((total, saldo) => total + (saldo.quantity || 0), 0);
  }

  getSaldoDestacado(): number {
    const saldosDestacados = this.saldosEmpresa.filter(s => s.type?.toLowerCase() === 'destacada');
    return saldosDestacados.reduce((total, saldo) => total + (saldo.quantity || 0), 0);
  }

  getSaldosNormalesDetalle(): any[] {
    const saldosNormales = this.saldosEmpresa.filter(s => s.type?.toLowerCase() === 'normal' && s.quantity > 0);
    return this.agruparSaldosPorDias(saldosNormales);
  }

  getSaldosDestacadosDetalle(): any[] {
    const saldosDestacados = this.saldosEmpresa.filter(s => s.type?.toLowerCase() === 'destacada' && s.quantity > 0);
    return this.agruparSaldosPorDias(saldosDestacados);
  }

  // Función auxiliar para agrupar saldos por días y sumar cantidades
  private agruparSaldosPorDias(saldos: any[]): any[] {
    const agrupados: { [key: number]: any } = {};
    
    saldos.forEach(saldo => {
      const dias = saldo.days || (saldo.type?.toLowerCase() === 'normal' ? 15 : 30);
      
      if (agrupados[dias]) {
        // Si ya existe un saldo para esos días, sumar la cantidad
        agrupados[dias].quantity += saldo.quantity;
      } else {
        // Si no existe, crear nuevo entry
        agrupados[dias] = {
          days: dias,
          quantity: saldo.quantity,
          type: saldo.type
        };
      }
    });
    
    // Convertir el objeto agrupado a array y ordenar por días
    return Object.values(agrupados).sort((a, b) => a.days - b.days);
  }

  getSaldoNormalDetails(): any {
    return this.saldosEmpresa.find(s => s.type?.toLowerCase() === 'normal') || null;
  }

  // Métodos para actualizar precios dinámicamente
  updatePrecioNormalIndividual(event: any): void {
    const dias = parseInt(event.target.value);
    this.precioNormalIndividual = this.preciosNormales[dias] || 0;
  }

  updatePrecioPackNormal(event: any): void {
    const cantidad = parseInt(event.target.value);
    this.precioPackNormal = this.preciosPackNormal[cantidad] || 0;
  }

  updatePrecioDestacadaIndividual(event: any): void {
    const dias = parseInt(event.target.value);
    this.precioDestacadaIndividual = this.preciosDestacadas[dias] || 0;
  }

  updatePrecioPackDestacada(event: any): void {
    const cantidad = parseInt(event.target.value);
    this.precioPackDestacada = this.preciosPackDestacada[cantidad] || 0;
  }

  getPublicacionesDestacadas(): number {
    return this.historialPublicaciones.filter(p => p.featured).length;
  }

  getTotalPostulaciones(): number {
    return this.historialPublicaciones.reduce((total, p) => total + p.postulaciones_count, 0);
  }

  hasSaldos(): boolean {
    return this.saldosEmpresa.length > 0;
  }

  // Método auxiliar para obtener descripción del tipo de publicación
  getTipoPromocionDescripcion(tipo: string): string {
    switch(tipo) {
      case 'normal':
        return 'Publicación Normal';
      case 'destacado':
        return 'Publicación Destacada';
      default:
        return 'Publicación';
    }
  }

  // Método auxiliar para verificar si hay algún tipo específico de publicación
  hasTipoPromocion(tipo: string): boolean {
    return this.saldosEmpresa.some(s => s.type?.toLowerCase() === tipo.toLowerCase() && s.quantity > 0);
  }

  // Método para cargar los saldos disponibles desde la base de datos
  loadSaldosDisponibles() {
    this.loadingSaldosDisponibles = true;
    this._companyService.obtenerSaldosDisponibles().subscribe(
      (response: any) => {
        this.saldosDisponibles = response.data || [];
        this.procesarPreciosDinamicos();
        this.loadingSaldosDisponibles = false;
      },
      (error: any) => {
        console.error('Error al cargar saldos disponibles:', error);
        this.loadingSaldosDisponibles = false;
        // En caso de error, usar precios por defecto
        this.setDefaultPrices();
      }
    );
  }

  // Procesar los precios dinámicos desde los saldos disponibles
  procesarPreciosDinamicos() {
    // Resetear objetos de precios
    this.preciosNormales = {};
    this.preciosPackNormal = {};
    this.preciosDestacadas = {};
    this.preciosPackDestacada = {};

    this.saldosDisponibles.forEach(saldo => {
      const tipo = saldo.type?.toLowerCase();
      const dias = saldo.days;
      const pack = saldo.pack || 1;
      const precio = saldo.precio;

      if (tipo === 'normal') {
        if (pack === 1) {
          // Publicaciones normales individuales (varían por días)
          this.preciosNormales[dias] = precio;
          
          // Establecer precio inicial para la tarjeta (15 días por defecto)
          if (dias === 15) {
            this.precioNormalIndividual = precio;
          }
        } else {
          // Packs normales (varían por cantidad)
          this.preciosPackNormal[pack] = precio;
          
          // Establecer precio inicial para la tarjeta (3 publicaciones por defecto)
          if (pack === 3) {
            this.precioPackNormal = precio;
          }
        }
      } else if (tipo === 'destacada') {
        if (pack === 1) {
          // Publicaciones destacadas individuales (varían por días)
          this.preciosDestacadas[dias] = precio;
          
          // Establecer precio inicial para la tarjeta (15 días por defecto)
          if (dias === 15) {
            this.precioDestacadaIndividual = precio;
          }
        } else {
          // Packs destacadas (varían por cantidad)
          this.preciosPackDestacada[pack] = precio;
          
          // Establecer precio inicial para la tarjeta (3 publicaciones por defecto)
          if (pack === 3) {
            this.precioPackDestacada = precio;
          }
        }
      }
    });
  }

  // Establecer precios por defecto en caso de error
  setDefaultPrices() {
    this.preciosNormales = { 15: 1000, 30: 1500, 60: 2000 };
    this.preciosPackNormal = { 3: 5400, 5: 8000, 10: 14000, 20: 24000, 30: 33000 };
    this.preciosDestacadas = { 15: 3000, 30: 4200, 60: 5400 };
    this.preciosPackDestacada = { 3: 11340, 5: 16800, 10: 29400, 20: 50400, 30: 69300 };
    
    this.precioNormalIndividual = 1000;
    this.precioPackNormal = 5400;
    this.precioDestacadaIndividual = 3000;
    this.precioPackDestacada = 11340;
  }

  // Métodos para confirmar compras
  confirmarCompraNormalIndividual() {
    const saldoSeleccionado = this.saldosDisponibles.find(s => 
      s.type === 'Normal' && s.pack === 1 && s.days === 15
    );
    
    this.selectedCompra = {
      tipo: 'normal_individual',
      titulo: 'Publicación Normal Individual',
      descripcion: `1 Publicación Normal por 15 días`,
      precio: this.precioNormalIndividual,
      saldo: saldoSeleccionado
    };
    this.showConfirmModal = true;
  }

  confirmarCompraPackNormal() {
    const saldoSeleccionado = this.saldosDisponibles.find(s => 
      s.type === 'Normal' && s.pack === 3 && s.days === 60
    );
    
    this.selectedCompra = {
      tipo: 'pack_normal',
      titulo: 'Pack Normal',
      descripcion: `3 Publicaciones Normales por 60 días`,
      precio: this.precioPackNormal,
      saldo: saldoSeleccionado
    };
    this.showConfirmModal = true;
  }

  confirmarCompraDestacadaIndividual() {
    const saldoSeleccionado = this.saldosDisponibles.find(s => 
      s.type === 'Destacada' && s.pack === 1 && s.days === 15
    );
    
    this.selectedCompra = {
      tipo: 'destacada_individual',
      titulo: '✨ Publicación Destacada Individual',
      descripcion: `1 Publicación Destacada por 15 días`,
      precio: this.precioDestacadaIndividual,
      saldo: saldoSeleccionado
    };
    this.showConfirmModal = true;
  }

  confirmarCompraPackDestacada() {
    const saldoSeleccionado = this.saldosDisponibles.find(s => 
      s.type === 'Destacada' && s.pack === 3 && s.days === 30
    );
    
    this.selectedCompra = {
      tipo: 'pack_destacada',
      titulo: '🌟 Pack Destacadas',
      descripcion: `3 Publicaciones Destacadas por 30 días`,
      precio: this.precioPackDestacada,
      saldo: saldoSeleccionado
    };
    this.showConfirmModal = true;
  }

  // Métodos para manejar el modal de confirmación
  cerrarModalConfirmacion() {
    this.showConfirmModal = false;
    this.selectedCompra = null;
    this.processingPurchase = false;
  }

  ejecutarCompra() {
    if (!this.selectedCompra || !this.selectedCompra.saldo) {
      alert('Error: No se pudo procesar la compra. Inténtalo de nuevo.');
      return;
    }

    this.processingPurchase = true;

    this._companyService.comprarSaldo(this.selectedCompra.saldo.id).subscribe(
      (response: any) => {
        console.log('Compra exitosa:', response);
        
        // Mostrar mensaje de éxito
        alert(`¡Compra realizada exitosamente!\n${this.selectedCompra.descripcion}\nTotal pagado: $${this.selectedCompra.precio}`);
        
        // Cerrar modal
        this.cerrarModalConfirmacion();
        
        // Recargar saldos de la empresa
        this.loadCompanySaldos();
        
        // Cerrar modal de compra principal
        this.modalClose();
      },
      (error: any) => {
        console.error('Error en la compra:', error);
        this.processingPurchase = false;
        
        let errorMsg = 'Error al procesar la compra. Inténtalo de nuevo.';
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        }
        alert(errorMsg);
      }
    );
  }

}
