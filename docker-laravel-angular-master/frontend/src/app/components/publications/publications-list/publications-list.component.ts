import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.css'],
  standalone: true,
  imports: [],
})
export class PublicationsListComponent implements AfterViewInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;

  ngAfterViewInit() {
  }

  onArrowLeftClick() {
    const carousel = document.getElementById('carousel');
    if (carousel) {
        carousel.scrollLeft -= carousel.offsetWidth;
    }
}

onArrowRightClick() {
    const carousel = document.getElementById('carousel');
    if (carousel) {
        carousel.scrollLeft += carousel.offsetWidth;
    }
}
}