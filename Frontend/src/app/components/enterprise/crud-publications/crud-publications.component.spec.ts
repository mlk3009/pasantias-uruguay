import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CRUDPublicationsComponent } from './crud-publications.component';

describe('CRUDPublicationsComponent', () => {
  let component: CRUDPublicationsComponent;
  let fixture: ComponentFixture<CRUDPublicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRUDPublicationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CRUDPublicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
