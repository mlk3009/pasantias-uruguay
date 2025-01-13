import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';

import { NavComponent } from '../home/nav/nav.component';
import { FooterComponent } from '../home/footer/footer.component';
import { UserProfileStudentComponent } from './user-profile-student/user-profile-student.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, NavComponent, UserProfileStudentComponent, FooterComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent {

}

