import { Component, ViewChildren, ViewChild, ElementRef, QueryList, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../../services/publication.service';
import { Observable,forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-user-profile-enterprise',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-profile-enterprise.component.html',
  styleUrls: ['./user-profile-enterprise.component.css']
})
export class UserProfileEnterpriseComponent implements OnInit, AfterViewInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
  empresa: any = {};
  publicaciones: any[] = [];
  loading: boolean = false;
  isPhoneAccess: boolean = false; // Variable para determinar si se accedió mediante phone
  userImageUrl: string = '';
  empresaImageUrl: string = '';
  muro2ImageUrl: string = '';
  muroImageUrl: string = '';
  displayedPublications: any[] = [];
  categoryPublications: { [key: string]: any[] } = {};
  data: any;
  ApexCharts: any;
  
  // Propiedades para estadísticas
  estadisticas: any = {
    total_publicaciones: 0,
    total_visitas: 0,
    total_postulaciones: 0,
    ratio_postulacion: 0,
    visitas_por_dia: []
  };
  
  desc1Title: string = '';
  desc1Paragraph1: string = '';
  desc1Paragraph2: string = '';
  desc2Title: string = '';
  desc2Paragraph1: string = '';
  desc2Paragraph2: string = '';
  desc3Title: string = '';
  desc3Paragraph: string = '';
  selectedView: 'empresarial' | 'cliente' = 'empresarial';

  constructor(
    private companyService: CompanyService,
    private userService: UserService,
    private publicationService: PublicationService,
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
          this.getPublications(this.empresa.id);
          this.cargarImagenesEmpresa(this.empresa.images);
          this.cargarEstadisticas();
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
          this.getPublications(this.empresa.id);
          this.cargarImagenesEmpresa(this.empresa.images);
          this.cargarEstadisticas();
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


    this.route.paramMap.subscribe(params => {
      const category = params.get('category') || undefined;
      this.getPublications(category);
    });

    if (token) {
      this.userService.obtenerUsuario(token).subscribe({
        next: (response) => {
          this.data = response.data;
          // console.log(this.data);
          this.loadAdditionalPublications(this.data.id);
        },
        error: (error) => {
          console.error(error);
          this.loadAdditionalPublications(null);
        }
      });
    } else {
      this.loadAdditionalPublications(null);
    }
  }

  cargarImagenesEmpresa(images: any[]): void {
    const profileImage = images.find((img: any) => img.desc === 'profile');
    const empresaImage = images.find((img: any) => img.desc === 'empresaimg');
    const muro2Image = images.find((img: any) => img.desc === 'muro2');
    const muroImage = images.find((img: any) => img.desc === 'muro');

    if (profileImage) {
      this.userImageUrl = `http://localhost:8000/images/uploads/${profileImage.image}`;
    } else {
      this.userImageUrl = 'http://localhost:8000/images/user.png';
    }

    if (empresaImage) {
      this.empresaImageUrl = `http://localhost:8000/images/uploads/${empresaImage.image}`;
    } else {
      this.empresaImageUrl = 'http://localhost:8000/images/empresa.png';
    }

    if (muro2Image) {
      this.muro2ImageUrl = `http://localhost:8000/images/uploads/${muro2Image.image}`;
    } else {
      this.muro2ImageUrl = 'http://localhost:8000/images/default-muro2.png';
    }

    if (muroImage) {
      this.muroImageUrl = `http://localhost:8000/images/uploads/${muroImage.image}`;
    } else {
      this.muroImageUrl = 'http://localhost:8000/images/default-muro.png';
    }
  }

  getPublications(category?: string, featured: boolean = true): void {
    this.publicationService.getPublications(category, featured).subscribe(
      (response) => {
        if (response && response.length > 0 && response[0].publications) {
          this.displayedPublications = response[0].publications;
          this.displayedPublications.forEach(publication => {
            publication.imageUrl = publication.image 
              ? `http://localhost:8000/images/uploads/${publication.image}` 
              : 'http://localhost:8000/images/defaultpub.jpg';
          });
        } else {
          this.displayedPublications = [];
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  loadAdditionalPublications(userId: number | null): void {
      if (userId) {
        this.userService.getUserEtiquetas(userId).pipe(
          switchMap(etiquetas => {
            const categories = etiquetas.map(etiqueta => etiqueta.name);
            if (categories.length < 3) {
              return this.getTopCategories(3 - categories.length).pipe(
                map(topCategories => categories.concat(topCategories))
              );
            }
            return [categories];
          }),
          switchMap(categories => {
            const requests = categories.map(category => this.publicationService.getPublications(category, true));
            return forkJoin(requests);
          })
        ).subscribe(
          responses => {
            responses.forEach((response, index) => {
              if (response && response.length > 0 && response[0].publications) {
                this.categoryPublications[`category${index + 1}`] = response[0].publications;
              }
            });
            // console.log(this.categoryPublications);
          },
          error => {
            console.error(error);
          }
        );
      } else {
        this.getTopCategories(3).pipe(
          switchMap(categories => {
            const requests = categories.map(category => this.publicationService.getPublications(category, true));
            return forkJoin(requests);
          })
        ).subscribe(
          responses => {
            responses.forEach((response, index) => {
              if (response && response.length > 0 && response[0].publications) {
                this.categoryPublications[`category${index + 1}`] = response[0].publications;
              }
            });
            // console.log(this.categoryPublications);
          },
          error => {
            console.error(error);
          }
        );
      }
    }

    getTopCategories(limit: number): Observable<string[]> {
        return this.publicationService.getTopCategories(limit).pipe(
          map(response => response.map(category => category.name))
        );
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

  ngAfterViewInit(): void {
    // Las gráficas se renderizarán después de cargar las estadísticas
    if (this.estadisticas && this.estadisticas.total_publicaciones > 0) {
      this.renderLegendChart();
      this.renderColumnChart();
    }
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


  renderLegendChart(): void {
    // Verificar que las estadísticas estén cargadas
    if (!this.estadisticas || !this.estadisticas.visitas_por_dia) {
      console.log('No se pueden renderizar las gráficas: estadísticas no disponibles');
      return;
    }

    // Preparar datos de visitas por día
    const fechas = this.estadisticas.visitas_por_dia.map((item: any) => {
      const fecha = new Date(item.fecha);
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });
    
    const visitasReales = this.estadisticas.visitas_por_dia.map((item: any) => item.visitas);
    
    // Generar datos simulados para "semana anterior" (como referencia)
    const visitasAnterior = visitasReales.map((visita: number) => Math.max(0, visita + Math.floor(Math.random() * 200) - 100));

    const options = {
      series: [
        {
          name: "Semana anterior",
          data: visitasAnterior,
          color: "#1A56DB",
        },
        {
          name: "Esta semana",
          data: visitasReales,
          color: "#7E3BF2",
        },
      ],
      chart: {
        height: "100%",
        maxWidth: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      legend: {
        show: true
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -26
        },
      },
      xaxis: {
        categories: fechas,
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        labels: {
          formatter: function (value: number) {
            return value;
          }
        }
      },
    };

    const chartElement = document.getElementById("legend-chart");
    if (chartElement && typeof ApexCharts !== 'undefined') {
      // Limpiar el contenido anterior
      chartElement.innerHTML = '';
      const chart = new ApexCharts(chartElement, options);
      chart.render();
    }
  }

  renderColumnChart(): void {
    // Verificar que las estadísticas estén cargadas
    if (!this.estadisticas || !this.estadisticas.visitas_por_dia) {
      console.log('No se pueden renderizar las gráficas: estadísticas no disponibles');
      return;
    }

    // Preparar datos basados en visitas reales
    const diasSemana = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const visitasPorDia = this.estadisticas.visitas_por_dia.slice(-7); // Últimos 7 días
    
    // Datos de postulaciones (calculamos un estimado basado en el ratio)
    const postulacionesPorDia = visitasPorDia.map((item: any, index: number) => ({
      x: diasSemana[index] || `Día ${index + 1}`,
      y: Math.floor(item.visitas * (this.estadisticas.ratio_postulacion / 100))
    }));
    
    // Datos de visualizaciones reales
    const visualizacionesPorDia = visitasPorDia.map((item: any, index: number) => ({
      x: diasSemana[index] || `Día ${index + 1}`,
      y: item.visitas
    }));

    const options: ApexCharts.ApexOptions = {
      colors: ["#1A56DB", "#FDBA8C"],
      series: [
        {
          name: "Postulaciones",
          color: "#1A56DB",
          data: postulacionesPorDia,
        },
        {
          name: "Visualizaciones",
          color: "#FDBA8C",
          data: visualizacionesPorDia,
        },
      ],
      chart: {
        type: "bar",
        height: "320px",
        fontFamily: "Inter, sans-serif",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "70%",
          borderRadiusApplication: "end",
          borderRadius: 8,
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
      states: {
        hover: {
          filter: {
            type: "darken",
          },
        },
      },
      stroke: {
        show: true,
        width: 0,
        colors: ["transparent"],
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -14
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        floating: false,
        labels: {
          show: true,
          style: {
            fontFamily: "Inter, sans-serif",
            cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
          }
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
      fill: {
        opacity: 1,
      },
    };

    const chartElement = document.getElementById("column-chart");
    if (chartElement && typeof ApexCharts !== 'undefined') {
      // Limpiar el contenido anterior
      chartElement.innerHTML = '';
      const chart = new ApexCharts(chartElement, options);
      chart.render();
    }
  }

setView(view: 'empresarial' | 'cliente'): void {
  this.selectedView = view;
  
  // Si se cambia a vista empresarial y no se han cargado las estadísticas, cargarlas
  if (view === 'empresarial' && this.empresa.id && this.estadisticas.total_publicaciones === 0) {
    this.cargarEstadisticas();
  }
  
  // Si cambiamos a vista empresarial y ya tenemos estadísticas, renderizar las gráficas
  if (view === 'empresarial' && this.estadisticas && this.estadisticas.total_publicaciones > 0) {
    setTimeout(() => {
      this.renderLegendChart();
      this.renderColumnChart();
    }, 100);
  }
}

cargarEstadisticas(): void {
  if (!this.empresa.id) {
    console.log('No se puede cargar estadísticas: empresa.id no está definido');
    return;
  }
  
  console.log('Cargando estadísticas para empresa ID:', this.empresa.id);
  
  this.companyService.obtenerEstadisticasEmpresa(this.empresa.id).subscribe({
    next: (response: any) => {
      console.log('Respuesta de estadísticas:', response);
      this.estadisticas = response;
      console.log('Estadísticas asignadas:', this.estadisticas);
      
      // Renderizar las gráficas después de cargar las estadísticas
      setTimeout(() => {
        this.renderLegendChart();
        this.renderColumnChart();
      }, 100);
    },
    error: (error: any) => {
      console.error('Error al cargar estadísticas:', error);
    }
  });
}
  
}

