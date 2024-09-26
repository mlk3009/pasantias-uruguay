import { Component, OnInit, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { NavPublicationsComponent } from './nav-publications/nav-publications.component';
import { PrincipalImagePublicationsComponent } from './principal-image-publications/principal-image-publications.component';


import { PublicationsListComponent } from './publications-list/publications-list.component';
import { FooterComponent } from '../home/footer/footer.component';
import { NavComponent } from '../home/nav/nav.component';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule, PublicationsListComponent, PrincipalImagePublicationsComponent, FooterComponent, NavPublicationsComponent, NavComponent],
  templateUrl: './publications.component.html',
  styleUrl: './publications.component.css'
})
export class PublicationsComponent {
  
}
