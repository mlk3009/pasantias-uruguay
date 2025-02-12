import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { global } from './global'; 
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private _http: HttpClient, private cookieService: CookieService) {}

  getToken() {
    let token = this.cookieService.get('token');
    if (token && token != 'undefined') {
      return token;
    } else {
      return null;
    }
  }











}
