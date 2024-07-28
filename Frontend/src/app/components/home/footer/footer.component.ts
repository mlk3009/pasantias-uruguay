import { Component } from '@angular/core';
import { CommonModule, ViewportScroller  } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

}
