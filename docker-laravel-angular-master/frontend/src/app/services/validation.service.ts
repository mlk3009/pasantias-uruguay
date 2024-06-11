import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { global } from './global';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor(public _http: HttpClient) {}

  // Validar email
  validateEmail(email: string, code: string): Observable<any> {
    let params = { email: email, code: code };

    console.log(params);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this._http.post(global.url + 'checkEmailCode', params, {
      headers: headers,
    });
  }
}
