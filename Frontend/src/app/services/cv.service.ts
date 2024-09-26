import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Cv } from '../models/cv';
import { global } from './global';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() back: EventEmitter<any> = new EventEmitter();

  constructor(public _http: HttpClient) {}


  loadForm(token: string, cv: any) {
    let json = JSON.stringify(cv);
    let params = json;

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    console.log('Solicitud HTTP:', { headers: headers });
    return this._http.post(global.url + 'cv', params, { headers: headers });
  }

  getFicha(token: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http.get(global.url + 'getFicha/' + id, { headers: headers });
  }

  editFicha(token: string, ficha: string): Observable<any> {
    let json = ficha;
    let params = json;

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    console.log('Solicitud HTTP:', { headers: headers });
    return this._http.put(global.url + 'editFicha', params, {
      headers: headers,
    });
  }
}
