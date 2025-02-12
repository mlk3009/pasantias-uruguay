import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = this.userService.getToken();
    if (token) {
      return this.userService.obtenerUsuario(token).pipe(
        map(response => {
          const user = response.data;
          if (user && user.rol === 'empresa') {
            return true;
          } else {
            this.router.navigate(['/login']);
            return false;
          }
        })
      );
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}