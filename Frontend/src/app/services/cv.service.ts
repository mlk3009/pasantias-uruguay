import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Cv } from '../models/cv';
import { global } from './global';
import { Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() back: EventEmitter<any> = new EventEmitter();

  constructor(public _http: HttpClient, private cookieService: CookieService) {}


  loadForm(token: string, cv: any) {
    let json = JSON.stringify(cv);
    let params = json;

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this._http.post(global.url + 'cv', params, { headers: headers });
  }

  getFicha(token: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http.get(global.url + 'getFicha/' + id, { headers: headers });
  }

  generarPDF(cvId: number) {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http.get(global.url + 'cvPDF/' + cvId, { headers: headers, responseType: 'text' }).toPromise();
  }

  getToken() {
    let token = this.cookieService.get('token');
    if (token && token != 'undefined') {
      return token;
    } else {
      return null;
    }
  }



  editFicha(token: string, ficha: string): Observable<any> {
    let json = ficha;
    let params = json;

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this._http.put(global.url + 'editFicha', params, {
      headers: headers,
    });
  }
}
