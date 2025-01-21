import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from '../models/user';
import { global } from './global';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',

})
export class UserService {
  private previousImageId: string | null = null;

  constructor(public _http: HttpClient, private cookieService: CookieService) { }

  getToken() {
    let token = this.cookieService.get('token');
    if (token && token != 'undefined') {
      return token;
    } else {
      return null;
    }
  }

  logout(): Observable<any> {
    const token = this.getToken(); // Llamar a getToken() para obtener el token
    return this._http.post(global.url + 'logout', {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });
}

storeImage(file: File, userId?: number): Observable<any> {
  const formData = new FormData();
  formData.append('image', file);
  if (userId !== undefined) {
    formData.append('user_id', userId.toString());
  }
  let headers = new HttpHeaders();

  return this._http.post(global.url + 'upload-image', formData, {
    headers: headers,
  }).pipe(
    tap((response: any) => {
      console.log('Imagen cargada exitosamente', response);
    })
  );
}

  deleteImage(imageId: string): Observable<any> {
    return this._http.delete(global.url + `delete-image/${imageId}`);
  }

  register(user: User): Observable<any> {
    let json = JSON.stringify(user);
    let params = json;

    let headers = new HttpHeaders().set('Content-Type', 'application/raw');
    return this._http.post(global.url + 'register', params, {
      headers: headers,
    });
  }

  login(user: User): Observable<any> {
    var loginInformation = {
      email: user.email,
      password: user.password,
    };

    let params = JSON.stringify(loginInformation);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(global.url + 'login', params, { headers: headers });
  }

  update(data: any, token: string): Observable<any> {
    let json = JSON.stringify(data);
    let params = json;

    let headers = new HttpHeaders({
      'Content-Type': 'application/raw',
      Authorization: `Bearer ${token}`
    });

    return this._http.post(global.url + 'updateProfile', params, {
      headers: headers,
    });
  }


  obtenerUsuario(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._http.get(global.url + 'user', { headers: headers });
  }

  obtenerUsuarioByPhone(phone: string): Observable<any> {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return this._http.get(global.url + `userbyphone/${phone}`, { headers: headers });
    } else {
      throw new Error('Token no encontrado');
    }
  }

  restore(user: User): Observable<any> {
    var json = {
      email: user.email,
    };
    let params = JSON.stringify(json);

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(global.url + 'restore', params, {
      headers: headers,
    });
  }

  checkCode(email: any, code: any): Observable<any> {
    var json = {
      email: email,
      code: code,
    };

    let params = JSON.stringify(json);

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(global.url + 'checkCode', params, {
      headers: headers,
    });
  }

  changePassword(email: any, password: any): Observable<any> {
    var json = {
      email: email,
      password: password,
    };

    let params = JSON.stringify(json);

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(global.url + 'changePassword', params, {
      headers: headers,
    });
  }

  addUserTags(estudiante_id: number, etiqueta_id: number): Observable<any> {
    const json = {
      estudiante_id: estudiante_id,
      etiqueta_id: etiqueta_id
    };

    const params = JSON.stringify(json);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(global.url + 'addUserTag', params, { headers: headers });
  }

  contactUs(email: string, asunto: string, descripcion: string): Observable<any> {
    const body = { email: email, asunto: asunto, descripcion: descripcion };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this._http.post(global.url + 'contactUs', body, { headers }).pipe(
      tap((response: any) => {
        console.log('Correo enviado correctamente', response);
      })
    );
  }

  contactMe(email: string, asunto: string, descripcion: string, emailDestino: string): Observable<any> {
    const body = { email: email, asunto: asunto, descripcion: descripcion, emailDestino: emailDestino };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this._http.post(global.url + 'contactMe', body, { headers }).pipe(
      tap((response: any) => {
        console.log('Correo enviado correctamente', response);
      })
    );
  }

  // Método para obtener todas las etiquetas, estará acá momentaneamente hasta que se cree un servicio para las etiquetas
  getEtiquetas(): Observable<etiqueta[]> {
    return this._http.get<{ Tags: etiqueta[], status: number }>(global.url + 'showTags').pipe(
      map(response => {
        // Asegúrate de que la respuesta contiene la propiedad Tags y es un array
        if (response && Array.isArray(response.Tags)) {
          return response.Tags;
        } else {
          console.error('La respuesta no contiene un array de etiquetas:', response);
          return [];
        }
      }),
    );
  }
  
  getUserEtiquetas(userId: number): Observable<any[]> {
    return this._http.get<{ 'etiquetas del estudiante': any[], status: number }>(`${global.url}showUserTag/${userId}`).pipe(
        map(response => {
            if (response && Array.isArray(response['etiquetas del estudiante'])) {
                return response['etiquetas del estudiante'];
            } else {
                console.error('La respuesta no contiene un array de etiquetas del estudiante:', response);
                return [];
            }
        }),
    );
}

    // Obtener datos del estudiante
    getStudentData(token: string, estudiante_id: number): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
  
      return this._http.get(`${global.url}postulante/${estudiante_id}`, { headers: headers });
    }

}
export interface etiqueta {
  id: number;
  name: string;
}