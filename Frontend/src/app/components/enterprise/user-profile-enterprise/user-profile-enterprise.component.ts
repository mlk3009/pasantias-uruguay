import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePublicationComponent } from './create-publication/create-publication.component';

@Component({
  selector: 'app-user-profile-enterprise',
  standalone: true,
  imports: [CreatePublicationComponent, CommonModule],
  templateUrl: './user-profile-enterprise.component.html',
  styleUrl: './user-profile-enterprise.component.css'
})
export class UserProfileEnterpriseComponent {
  createPublication: boolean = false; // Hacer que esto dependa de la url, sacar el valor default.
}
