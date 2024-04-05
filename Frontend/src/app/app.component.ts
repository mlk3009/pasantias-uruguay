import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { RestoreComponent } from './components/restore/restore.component';

import { SpinnerModule } from './components/spinner/spinner.module';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    RouterOutlet,
    RouterModule,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    HttpClientModule,
    RestoreComponent,
    SpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [UserService]
})
export class AppComponent {
  title = 'pasantias';

  ngOnInit(): void {
    initFlowbite();
  }
}
