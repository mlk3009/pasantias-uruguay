import { Component, AfterViewInit, ViewChild, ElementRef, QueryList,  ViewChildren} from '@angular/core';


@Component({
  selector: 'app-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.css'],
  standalone: true,
  imports: [],
})
export class PublicationsListComponent implements AfterViewInit {
  @ViewChild('carousel', { static: false }) carousel: ElementRef | undefined;
  @ViewChildren('card') cards: QueryList<ElementRef> | undefined;

  ngAfterViewInit() {
  }

  onArrowLeftClick() {
    const carousel = document.getElementById('carousel');
    const cardWidth = document.getElementsByClassName('card')[0]?.clientWidth || 0;
    if (carousel) {
      carousel.scrollLeft -= cardWidth;
    }
  }

  onArrowRightClick() {
    const carousel = document.getElementById('carousel');
    const cardWidth = document.getElementsByClassName('card')[0]?.clientWidth || 0;
    if (carousel) {
      carousel.scrollLeft += cardWidth;
    }
  }
}