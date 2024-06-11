import { Component, OnInit, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';

import { NavComponent } from '../home/nav/nav.component';
import { PrincipalImageComponent } from '../home/principal-image/principal-image.component';
import { PublicationsListComponent } from './publications-list/publications-list.component';
import { FooterComponent } from '../home/footer/footer.component';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule, NavComponent, PublicationsListComponent, PrincipalImageComponent, FooterComponent],
  templateUrl: './publications.component.html',
  styleUrl: './publications.component.css'
})
export class PublicationsComponent {
  
}