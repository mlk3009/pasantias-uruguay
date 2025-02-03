import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { global } from './global'; // Importa global

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  constructor(private _http: HttpClient) {}

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
}