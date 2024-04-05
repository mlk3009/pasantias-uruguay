import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  public loading: boolean = false;

  ngOninit() {
    initFlowbite();
  }
}
