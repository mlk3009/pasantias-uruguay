import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { NavComponent } from './nav/nav.component';
import { PrincipalImageComponent } from './principal-image/principal-image.component';
import { NosotrosComponent} from './nosotros/nosotros.component';
import { OfertasComponent} from './ofertas/ofertas.component';
import { FooterComponent} from './footer/footer.component';
import { PublicacionesComponent} from './publicaciones/publicaciones.component';
import { ContactComponent } from './contact/contact.component';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavComponent, PrincipalImageComponent, NosotrosComponent, OfertasComponent, FooterComponent, PublicacionesComponent, ContactComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  public loading: boolean = false;

  ngOninit() {
    initFlowbite();
  }
}
