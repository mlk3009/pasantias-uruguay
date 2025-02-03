import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulantesComponent } from './postulantes.component';

describe('PostulantesComponent', () => {
  let component: PostulantesComponent;
  let fixture: ComponentFixture<PostulantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostulantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostulantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
