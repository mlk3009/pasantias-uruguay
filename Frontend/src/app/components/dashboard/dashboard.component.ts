import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePublicationComponent } from './create-publication/create-publication.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CreatePublicationComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
}
