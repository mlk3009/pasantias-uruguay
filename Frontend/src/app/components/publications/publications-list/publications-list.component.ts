import { Component, OnInit } from '@angular/core';
import { PublicationService } from '../../../services/publication.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-publications-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publications-list.component.html',
  styleUrl: './publications-list.component.css',
  providers: [PublicationService],
})
export class PublicationsListComponent implements OnInit {
  
  public publicaciones: any[] = [];

  constructor(
    private publicationService: PublicationService
  ){}

  ngOnInit(): void {
    this.obtenerPublicaciones();
  }

  obtenerPublicaciones(): void {
    this.publicationService.getPublications()
      .subscribe(

        (response: any) => {
          // console.log(response);
          this.publicaciones = response.publications;
        },


        (error: any) => {
          console.error('Error al obtener las publicaciones:', error);
        }
      );
  }
}
