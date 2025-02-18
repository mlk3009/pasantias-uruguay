import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { global } from './global'; // Importa global
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  constructor(private _http: HttpClient, private cookieService: CookieService) {}

  getToken() {
    let token = this.cookieService.get('token');
    if (token && token != 'undefined') {
      return token;
    } else {
      return null;
    }
  }

  getPublications(category?: string, featured?: boolean | null, empresaId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (category) {
      params = params.append('category', category);
    }
    if (featured !== null && featured !== undefined) {
      params = params.append('featured', featured.toString());
    }
    if (empresaId) {
      params = params.append('empresa_id', empresaId);
    }

    const headers = new HttpHeaders({});
    return this._http.get<any[]>(global.url + 'publications', { headers: headers, params: params }).pipe(
      map(response => Array.isArray(response) ? response : [response])
    );
  }

  getTopCategories(limit: number): Observable<any[]> {
    return this._http.get<any[]>(`${global.url}top-categories/${limit}`).pipe(
      map(response => response)
    );
  }

  loadPublication(token: string, publication: any): Observable<any> {
    let params = JSON.stringify(publication);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this._http.post(global.url + 'publications', params, {
      headers: headers,
    });
  }

  getPublicationById(id: string): Observable<any> {
    return this._http.get<any>(`${global.url}publications/show/${id}`).pipe(
      map(response => response)
    );
  }

  createPostulacion(postulacion: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this._http.post<any>(`${global.url}postular`, postulacion, { headers: headers }).pipe(
      map(response => response)
    );
  }
  
  guardarPublicacion(guarda: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this._http.post<any>(`${global.url}guardar-publicacion`, guarda, { headers: headers }).pipe(
      map(response => response)
    );
  }

  createPublication(publication: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this._http.post<any>(`${global.url}publications/store`, publication, { headers: headers }).pipe(
      map(response => response)
    );
  }

  updatePartial(id: string, publication: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this._http.patch<any>(`${global.url}publications/updatePartial/${id}`, publication, { headers: headers }).pipe(
      map(response => response)
    );
  }

  searchPublications(params: any): Observable<any[]> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  
    let httpParams = new HttpParams();
    for (let key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    }
  
    return this._http.get<any[]>(global.url + 'publications/search', { headers: headers, params: httpParams }).pipe(
      map(response => Array.isArray(response) ? response : [response]),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => new Error('No se encontraron publicaciones.'));
        } else {
          return throwError(() => error);
        }
      })
    );
  }
}