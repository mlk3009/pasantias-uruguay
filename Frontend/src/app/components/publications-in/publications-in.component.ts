import { Component, OnInit, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';

import { NavPublicationsComponent } from '../publications/nav-publications/nav-publications.component';
import { PrincipalImageInComponent } from './principal-image-in/principal-image-in.component';
import { CategoriesContentComponent } from './categories-content/categories-content.component';
import { FooterComponent } from '../home/footer/footer.component';
import { PreviousComponent } from './previousNext/previous.component';

@Component({
  selector: 'app-publications-in',
  standalone: true,
  imports: [CommonModule, NavPublicationsComponent, PrincipalImageInComponent, CategoriesContentComponent, FooterComponent, PreviousComponent],
  templateUrl: './publications-in.component.html',
  styleUrl: './publications-in.component.css'
})
export class PublicationsInComponent {

}
