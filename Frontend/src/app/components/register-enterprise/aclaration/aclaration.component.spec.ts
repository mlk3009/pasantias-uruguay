import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AclarationComponent } from './aclaration.component';

describe('AclarationComponent', () => {
  let component: AclarationComponent;
  let fixture: ComponentFixture<AclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AclarationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
