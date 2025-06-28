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
  
  // Propiedades para manejar el estado de edición
  public isEditMode: boolean = false;
  public currentCvId: string = '';
  public currentEditData: any = null;

  constructor(public _http: HttpClient, private cookieService: CookieService) {}

  // Métodos para manejar el estado de edición
  setEditMode(isEdit: boolean, cvId: string = ''): void {
    this.isEditMode = isEdit;
    this.currentCvId = cvId;
  }

  getEditMode(): boolean {
    return this.isEditMode;
  }

  getCurrentCvId(): string {
    return this.currentCvId;
  }

  // Nuevos métodos para manejar datos de edición
  setCurrentEditData(data: any): void {
    this.currentEditData = data;
  }

  getCurrentEditData(): any {
    return this.currentEditData;
  }

  clearEditData(): void {
    this.currentEditData = null;
  }

  loadForm(token: string, cv: any) {
    let json = JSON.stringify(cv);
    let params = json;

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this._http.post(global.url + 'cv', params, { headers: headers });
  }

  getFicha(token: string, id: string): Observable<any> {
    console.log('getFicha - Token enviado:', token);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log('getFicha - Headers:', headers);
    console.log('getFicha - URL completa:', global.url + 'cv-for-edit');

    // Usar cv-for-edit para obtener todos los datos del CV para edición
    return this._http.get(global.url + 'cv-for-edit', { headers: headers });
  }

  generarPDF(cvId: number) {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http.get(global.url + 'cvPDF/' + cvId, { headers: headers, responseType: 'text' }).toPromise();
  }

  // Método para forzar la regeneración del PDF
  regenerarPDF(cvId: number) {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Usar la nueva ruta POST para regenerar el PDF
    return this._http.post(global.url + 'cvPDF/' + cvId + '/regenerate', {}, { headers: headers, responseType: 'text' }).toPromise();
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

  updateCV(token: string, cvId: string, cv: any) {
    let json = JSON.stringify(cv);
    let params = json;

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token);
    return this._http.put(global.url + 'cv/' + cvId, params, { headers: headers });
  }

  // Método para obtener la URL directa del PDF
  getPDFUrl(cvId: number): string {
    const token = this.getToken();
    if (!token || !cvId) {
      return '';
    }
    return global.url + 'cvPDF/' + cvId + '?token=' + token;
  }

}
