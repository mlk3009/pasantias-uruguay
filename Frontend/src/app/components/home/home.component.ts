import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { NavComponent } from './nav/nav.component';
import { PrincipalImageComponent } from './principal-image/principal-image.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { OfertasComponent } from './ofertas/ofertas.component';
import { FooterComponent } from './footer/footer.component';
import { PublicacionesComponent } from './publicaciones/publicaciones.component';
import { ContactComponent } from './contact/contact.component';
import { ValidAcountComponent } from '../register/valid-acount/valid-acount.component';
import { SliderComponent } from './slider/slider.component';
import { CategoriesComponent } from './categories/categories.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavComponent, PrincipalImageComponent, NosotrosComponent, OfertasComponent, FooterComponent, PublicacionesComponent, ContactComponent, ValidAcountComponent, SliderComponent, CategoriesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  public loading: boolean = false;
  public isLoggedIn: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.isLoggedIn = !!this.userService.getToken();
    initFlowbite();
  }
}