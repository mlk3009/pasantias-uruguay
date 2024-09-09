import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';

import { NavComponent } from '../home/nav/nav.component';
import { FooterComponent } from '../home/footer/footer.component';
import { UserProfileEnterpriseComponent } from './user-profile-enterprise/user-profile-enterprise.component';

@Component({
  selector: 'app-enterprise',
  standalone: true,
  imports: [ CommonModule, NavComponent, FooterComponent, UserProfileEnterpriseComponent],
  templateUrl: './enterprise.component.html',
  styleUrl: './enterprise.component.css'
})
export class EnterpriseComponent {

}
