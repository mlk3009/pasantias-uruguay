import { Component } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { CvService } from '../../../services/cv.service';
import { PublicationService } from '../../../services/publication.service';
import { NavigationExtras } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';


@Component({
  selector: 'app-user-profile-student',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile-student.component.html',
  styleUrl: './user-profile-student.component.css',
  providers: [UserService, CvService, PublicationService],
})
export class UserProfileStudentComponent {
  downloadPDF(): void {
    if (this.data.cv) {
      const pdfUrl = `http://localhost:8000/pdfs/cv_${this.data.cv}.pdf`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `cv_${this.data.cv}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No tienes un CV disponible o el PDF no ha sido generado.');
    }
  }
  loading: boolean = false;
  dataLoaded: boolean = false; // Nueva propiedad para controlar si los datos están cargados
  data: any = {};
  userEtiquetas: any[] = [];
  etiquetas: any[] = [];
  userImageUrl: string = '';
  recommendedPublications: any[] = []; // Nuevas publicaciones recomendadas
  

  constructor(
    private _userService: UserService,
    private _cvService: CvService,
    private _publicationService: PublicationService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const token = this._userService.getToken(); 
    if (token) {
      // Primero cargar los datos del usuario
      this._userService.obtenerUsuario(token).pipe(
        switchMap((userResponse) => {
          this.data = userResponse.data;
          console.log(this.data);
          
          // Configurar imagen del usuario
          if (this.data.id_image) {
            this.userImageUrl = `http://localhost:8000/images/uploads/${this.data.image}`;
          } else {
            this.userImageUrl = 'http://localhost:8000/images/user.png'; 
          }
          
          // Cargar etiquetas generales y del usuario en paralelo
          return forkJoin({
            userEtiquetas: this._userService.getUserEtiquetas(this.data.id),
            etiquetas: this._userService.getEtiquetas()
          });
        }),
        switchMap((etiquetasResponse) => {
          this.userEtiquetas = etiquetasResponse.userEtiquetas;
          this.etiquetas = etiquetasResponse.etiquetas;
          console.log('Etiquetas del usuario:', this.userEtiquetas);
          
          // Si no hay etiquetas del usuario, no buscar publicaciones
          if (this.userEtiquetas.length === 0) {
            return of({ publications: [] });
          }
          
          // Buscar publicaciones para cada etiqueta
          const publicationSearches = this.userEtiquetas.map(etiqueta => 
            this._publicationService.searchPublications({
              etiqueta: etiqueta.name,
              limit: 10
            }).pipe(
              catchError(error => {
                console.error(`Error al obtener publicaciones para etiqueta ${etiqueta.name}:`, error);
                return of([]);
              })
            )
          );
          
          return forkJoin(publicationSearches).pipe(
            switchMap((publicationsArrays) => {
              // Procesar las publicaciones
              let publicationsByTag: { [key: string]: any[] } = {};
              this.userEtiquetas.forEach((etiqueta, index) => {
                publicationsByTag[etiqueta.name] = publicationsArrays[index] || [];
              });
              
              this.distributePublications(publicationsByTag);
              
              return of({ publications: 'loaded' });
            })
          );
        }),
        catchError(error => {
          console.error('Error al cargar datos:', error);
          this.dataLoaded = true; // Marcar como cargado incluso si hay error
          return of(null);
        })
      ).subscribe({
        next: () => {
          this.dataLoaded = true; // Marcar que TODOS los datos han sido cargados
          console.log('Todos los datos cargados completamente');
        },
        error: (error) => {
          console.error('Error final:', error);
          this.dataLoaded = true; // Asegurar que se muestre algo incluso si hay error
        }
      });
    } else {
      this._router.navigate(['/login']);
    }
  }

  getUserEtiquetas(userId: number): void {
    this._userService.getUserEtiquetas(userId).subscribe({
      next: (userEtiquetas) => {
        this.userEtiquetas = userEtiquetas;
        console.log(this.userEtiquetas); // Verifica que las etiquetas del usuario se asignen correctamente
        // Después de obtener las etiquetas del usuario, buscar publicaciones relacionadas
        this.getRecommendedPublications();
      },
      error: (error) => {
        console.error('Error al obtener las etiquetas del usuario:', error);
      }
    });
  }

  getEtiquetas(): void {
    this._userService.getEtiquetas().subscribe({
      next: (etiquetas) => {
        this.etiquetas = etiquetas;
        console.log(this.etiquetas); // Verifica que las etiquetas se asignen correctamente
      },
      error: (error) => {
        console.error('Error al obtener las etiquetas:', error);
      }
    });
  }

  getRecommendedPublications(): void {
    if (this.userEtiquetas.length === 0) {
      return; // No hay etiquetas del usuario, no buscar publicaciones
    }

    // Array para almacenar publicaciones organizadas por etiqueta
    let publicationsByTag: { [key: string]: any[] } = {};
    let searchesCompleted = 0;
    const totalSearches = this.userEtiquetas.length;

    // Buscar publicaciones para cada etiqueta individualmente
    this.userEtiquetas.forEach((etiqueta, index) => {
      const searchParams = {
        etiqueta: etiqueta.name, // Cambiar 'search' por 'etiqueta' para búsqueda específica
        limit: 10 // Buscar más publicaciones para tener opciones
      };

      this._publicationService.searchPublications(searchParams).subscribe({
        next: (publications) => {
          // Guardar publicaciones por etiqueta
          publicationsByTag[etiqueta.name] = publications;
          console.log(`🔍 Búsqueda para etiqueta "${etiqueta.name}":`, {
            parametroUsado: 'etiqueta', // Ahora usa el parámetro correcto
            cantidadEncontrada: publications.length,
            limiteSolicitado: searchParams.limit,
            estructuraPrimeraPublicacion: publications[0] || 'Sin publicaciones'
          });
          searchesCompleted++;
          
          // Cuando todas las búsquedas estén completas
          if (searchesCompleted === totalSearches) {
            this.distributePublications(publicationsByTag);
          }
        },
        error: (error) => {
          console.error(`Error al obtener publicaciones para etiqueta ${etiqueta.name}:`, error);
          publicationsByTag[etiqueta.name] = []; // Array vacío si hay error
          searchesCompleted++;
          
          // Incluso si hay error, verificar si todas las búsquedas terminaron
          if (searchesCompleted === totalSearches) {
            this.distributePublications(publicationsByTag);
          }
        }
      });
    });
  }

  distributePublications(publicationsByTag: { [key: string]: any[] }): void {
    let finalPublications: any[] = [];
    
    console.log(`🎯 Distribuyendo publicaciones para ${this.userEtiquetas.length} etiquetas:`, publicationsByTag);
    
    // Función auxiliar para ordenar publicaciones priorizando featured
    const sortPublicationsByFeatured = (publications: any[]): any[] => {
      return publications.sort((a, b) => {
        // Primero por featured (true antes que false)
        if (a.featured !== b.featured) {
          return b.featured ? 1 : -1;
        }
        // Luego por fecha de creación (más reciente primero)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    };
    
    if (this.userEtiquetas.length === 1) {
      // 1 etiqueta: 3 publicaciones de esa etiqueta
      const tagName = this.userEtiquetas[0].name;
      const publications = sortPublicationsByFeatured(publicationsByTag[tagName] || []);
      finalPublications = publications.slice(0, 3);
      console.log(`📊 1 etiqueta (${tagName}): ${publications.length} publicaciones disponibles, tomando ${finalPublications.length} (${finalPublications.filter((p: any) => p.featured).length} destacadas)`);
    } 
    else if (this.userEtiquetas.length === 2) {
      // 2 etiquetas: 2 publicaciones de la primera, 1 de la segunda
      const firstTagName = this.userEtiquetas[0].name;
      const secondTagName = this.userEtiquetas[1].name;
      
      const firstTagPublications = sortPublicationsByFeatured(publicationsByTag[firstTagName] || []);
      const secondTagPublications = sortPublicationsByFeatured(publicationsByTag[secondTagName] || []);
      
      console.log(`📊 2 etiquetas: ${firstTagName} (${firstTagPublications.length} publicaciones), ${secondTagName} (${secondTagPublications.length} publicaciones)`);
      
      // Tomar 2 de la primera etiqueta (priorizando featured)
      finalPublications = finalPublications.concat(firstTagPublications.slice(0, 2));
      console.log(`➕ Agregadas ${firstTagPublications.slice(0, 2).length} publicaciones de ${firstTagName} (${firstTagPublications.slice(0, 2).filter((p: any) => p.featured).length} destacadas)`);
      
      // Tomar 1 de la segunda etiqueta, evitando duplicados
      const secondTagFiltered = secondTagPublications.filter((publication: any) => 
        !finalPublications.some((existing: any) => existing.id === publication.id)
      );
      finalPublications = finalPublications.concat(secondTagFiltered.slice(0, 1));
      console.log(`➕ Agregadas ${secondTagFiltered.slice(0, 1).length} publicaciones de ${secondTagName} (${secondTagFiltered.slice(0, 1).filter((p: any) => p.featured).length} destacadas)`);
    } 
    else {
      // 3 o más etiquetas: 1 publicación de cada una (máximo 3)
      const maxTags = Math.min(3, this.userEtiquetas.length);
      
      for (let i = 0; i < maxTags; i++) {
        const tagName = this.userEtiquetas[i].name;
        const tagPublications = sortPublicationsByFeatured(publicationsByTag[tagName] || []);
        console.log(`📊 Etiqueta ${i + 1}: ${tagName} tiene ${tagPublications.length} publicaciones`);
        
        // Filtrar publicaciones que no estén duplicadas
        const filteredPublications = tagPublications.filter((publication: any) => 
          !finalPublications.some((existing: any) => existing.id === publication.id)
        );
        
        if (filteredPublications.length > 0) {
          finalPublications.push(filteredPublications[0]);
          console.log(`➕ Agregada 1 publicación de ${tagName}: ${filteredPublications[0].nombre || filteredPublications[0].name}`);
        } else {
          console.log(`❌ No hay publicaciones disponibles para ${tagName}`);
        }
      }
    }

    this.recommendedPublications = finalPublications;
    console.log(`✅ Publicaciones finales (${this.userEtiquetas.length} etiquetas):`, {
      totalPublicaciones: this.recommendedPublications.length,
      publicaciones: this.recommendedPublications.map((p: any) => ({ 
        id: p.id, 
        nombre: p.nombre || p.name || p.title,
        empresa: p.empresa?.name || p.company 
      }))
    });
  }

  modal(){
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  modalClose() {
    const modal = document.getElementById('contactModal') as HTMLElement;
    modal.style.display = 'none';
  }

  openPDF(): void {
    if (this.data.cv) {
      // Construir la URL directa del PDF
      const pdfUrl = `http://localhost:8000/pdfs/cv_${this.data.cv}.pdf`;
      window.open(pdfUrl, '_blank');
    } else {
      alert('No tienes un CV disponible o el PDF no ha sido generado.');
    }
  }

}