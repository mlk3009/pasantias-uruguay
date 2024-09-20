import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Ficha } from '../models/ficha';
import { global } from './global';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditUserService {
  @Output() status: EventEmitter<any> = new EventEmitter();

  public editUser: boolean = false;

  constructor(public _http: HttpClient) {}

  change(value: any) {
    this.editUser = value;
  }
}
