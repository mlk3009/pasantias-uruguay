import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsideCvComponent } from './inside-cv.component';

describe('InsideCvComponent', () => {
  let component: InsideCvComponent;
  let fixture: ComponentFixture<InsideCvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsideCvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InsideCvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
