import { Component } from '@angular/core';
import { CommonModule, ViewportScroller  } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ CommonModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

}
