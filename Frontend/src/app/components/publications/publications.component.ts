import { Component, OnInit, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';

import { PrincipalImagePublicationsComponent } from './principal-image-publications/principal-image-publications.component';


import { PublicationsListComponent } from './publications-list/publications-list.component';
import { FooterComponent } from '../home/footer/footer.component';
import { NavComponent } from '../home/nav/nav.component';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule, PublicationsListComponent, PrincipalImagePublicationsComponent, FooterComponent, NavComponent],
  templateUrl: './publications.component.html',
  styleUrl: './publications.component.css'
})
export class PublicationsComponent {
  ngOninit() {
    initFlowbite();
  }
}
