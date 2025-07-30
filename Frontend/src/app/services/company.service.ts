import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { global } from './global';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(public _http: HttpClient, private cookieService: CookieService) {}

  getToken() {
    let token = this.cookieService.get('token');
    if (token && token != 'undefined') {
      return token;
    } else {
      return null;
    }
  }

  obtenerEmpresa(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http.get(global.url + 'company', { headers: headers });
  }

  obtenerEmpresaByPhone(phone: string): Observable<any> {
    return this._http.get(global.url + `companybyphone/${phone}`);
  }

  obtenerPublicaciones(empresaId: string, categoria?: string, cantidad?: number): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      let params = new HttpParams();
      if (categoria) {
        params = params.set('categoria', categoria);
      }
      if (cantidad) {
        params = params.set('cantidad', cantidad.toString());
      }

      return this._http.get(`${global.url}company/publications/${empresaId}`, { headers: headers, params: params });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  obtenerPostulantes(empresaId: string): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return this._http.get(global.url + `company/applicants/${empresaId}`, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  actualizarEstadoPostulacion(publicationId: string, estudianteId: string, estado: string): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      const body = { estado: estado };
      return this._http.put(global.url + `actualizar-postulacion/${publicationId}/${estudianteId}`, body, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  createMensaje(userId: number, desc: string): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      const body = { user_id: userId, mensaje: desc };
      return this._http.post(global.url + 'mensajes', body, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  createPublication(publicationData: any): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this._http.post(global.url + 'publications/store', publicationData, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  obtenerSaldo(empresaId: string): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return this._http.get(global.url + `company/saldo/${empresaId}`, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  updatePartial(id: string, updatedPublication: any): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this._http.patch(global.url + `publications/updatePartial/${id}`, updatedPublication, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

obtenerEstadisticasEmpresa(empresaId: string): Observable<any> {
  const token = this.getToken();
  if (token) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    
    let params = new HttpParams();
    params = params.set('empresa_id', empresaId.toString());
    
    return this._http.get(global.url + 'empresa/estadisticas', { headers: headers, params: params });
  } else {
    throw new Error('Token no encontrado');
  }
}

contactarEstudiante(publicationId: number, estudianteId: number, tipoContacto: string, empresaId: number): Observable<any> {
  const token = this.getToken();
  if (token) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const data = {
      publication_id: publicationId,
      estudiante_id: estudianteId,
      tipo_contacto: tipoContacto,
      empresa_id: empresaId
    };
    return this._http.post(global.url + 'empresa/contactar-estudiante', data, { headers: headers });
  } else {
    throw new Error('Token no encontrado');
  }
}

  obtenerSaldosDisponibles(): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return this._http.get(global.url + 'saldos/disponibles', { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  comprarSaldo(saldoId: number): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this._http.post(global.url + 'saldos/comprar', { saldo_id: saldoId }, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }
}