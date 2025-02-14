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


  getAllUsers(page: number = 1, itemsPerPage: number = 10): Observable<{ data: any[], current_page: number, total_pages: number, total_users: number }> {
    let params = new HttpParams().set('page', page.toString()).set('itemsPerPage', itemsPerPage.toString());
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.get<{ data: any[], current_page: number, total_pages: number, total_users: number }>(global.url + 'admin/users', { headers: headers, params: params }).pipe(
      map(response => response)
    );
  }


  searchUsers(params: any): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    let httpParams = new HttpParams();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this._http.get(global.url + 'admin/users/search', { headers: headers, params: httpParams });
  }


  updatePublication(id: number, data: any): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.patch(global.url + 'admin/publications/update/' + id, data, { headers: headers });
  }


  destroyPublication(id: number): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.delete(global.url + 'admin/publications/delete/' + id, { headers: headers });
  }


  softDeletePublication(id: number): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.patch(global.url + 'admin/publications/soft-delete/' + id, {}, { headers: headers });
  }


  deactivateUser(id: number): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.patch(global.url + 'admin/users/deactivate/' + id, {}, { headers: headers });
  }


  deleteUser(id: number): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.delete(global.url + 'admin/users/delete/' + id, { headers: headers });
  }


  getAllMensajes(solicitud?: boolean, page: number = 1, itemsPerPage: number = 10): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    let params = new HttpParams().set('page', page.toString()).set('itemsPerPage', itemsPerPage.toString());
    if (solicitud !== undefined) {
      params = params.set('solicitud', solicitud.toString());
    }
    return this._http.get(global.url + 'admin/mensajes', { headers: headers, params: params });
  }


  searchMensajes(params: any): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    let httpParams = new HttpParams();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return this._http.get(global.url + 'admin/mensajes/search', { headers: headers, params: httpParams });
  }


  deleteMensaje(id: number): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.delete(global.url + 'admin/mensajes/' + id, { headers: headers });
  }


  approveUser(id: number): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.post(global.url + 'admin/approve-user/' + id, {}, { headers: headers });
  }
  
  rejectUser(id: number, descripcion: string): Observable<any> {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    return this._http.post(global.url + 'admin/reject-user/' + id, { descripcion: descripcion }, { headers: headers });
  }
}