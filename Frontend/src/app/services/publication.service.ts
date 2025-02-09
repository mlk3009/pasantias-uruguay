import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  getPublications(category?: string, featured?: boolean | null): Observable<any[]> {
    let params = new HttpParams();
    if (category) {
      params = params.append('category', category);
    }
    if (featured !== null && featured !== undefined) {
      params = params.append('featured', featured.toString());
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
}