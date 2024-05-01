import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publication } from '../../../models/publication';
import { Requeriments } from '../../../models/publication';
import { Router } from '@angular/router';
import { PublicationService } from '../../../services/publication.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
@Component({
  selector: 'app-create-publication',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-publication.component.html',
  styleUrl: './create-publication.component.css',
  providers: [PublicationService],
})
export class CreatePublicationComponent {
  token: any = localStorage.getItem('token');
  publication: Publication = new Publication();
  requeriments: Requeriments = { title: '', level: '' };

  postulationLink: boolean = false;

  constructor(
    private _router: Router,
    private _publicationService: PublicationService
  ) {}

  ngOninit() {
    initFlowbite();
    if (!this.token) {
      this._router.navigate(['/login']);
    }
  }

  addRequeriment() {
    this.publication.requeriments.push(this.requeriments);
    this.requeriments = { title: '', level: '' };
  }

  save() {
    this._publicationService
      .loadPublication(this.token, this.publication)
      .subscribe(
        (response) => {
          this._router.navigate(['/publications']);
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
