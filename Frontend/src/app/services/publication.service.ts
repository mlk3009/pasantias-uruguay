import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { global } from './global';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  constructor(public _http: HttpClient) {}

  // Obtener publicaciones
  getPublications(): Observable<any> {
    const headers = new HttpHeaders({});
    return this._http.get(global.url + 'publications', { headers: headers });
  }

  // Cargar publicaciones
  loadPublication(token: string, publication: any): Observable<any> {
    let params = JSON.stringify(publication);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this._http.post(global.url + '/publications', params, {
      headers: headers,
    });
  }
}
