import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../models/user";
import { global } from "./global";

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(public _http: HttpClient) { }

  register(user: User): Observable<any> {
    let json = JSON.stringify(user);
    let params = json;

    let headers = new HttpHeaders().set('Content-Type', 'application/raw');
    return this._http.post(global.url + 'register', params, { headers: headers });
  }

  login(user: User): Observable<any> {

    var loginInformation = {
      'email': user.email,
      'password': user.password
    };

    let params = JSON.stringify(loginInformation);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(global.url + 'login', params, { headers: headers });
  }

  obtenerUsuario(token: string): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http.get(global.url + 'user', { headers: headers });
  }

  restore(user: User): Observable<any> {
    var json = {
      'email': user.email
    };
    let params = JSON.stringify(json);

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(global.url + 'restore', params, { headers: headers });
  }

  checkCode(email: any, code: any): Observable<any> {
    var json = {
      'email': email,
      'code': code
    };

    let params = JSON.stringify(json);

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(global.url + 'checkCode', params, { headers: headers });
  }

  changePassword(email: any, password: any): Observable<any> {
    var json = {
      'email': email,
      'password': password
    };

    let params = JSON.stringify(json);

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(global.url + 'changePassword', params, { headers: headers });
  }

}
