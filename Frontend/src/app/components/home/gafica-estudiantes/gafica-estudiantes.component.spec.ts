import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaficaEstudiantesComponent } from './gafica-estudiantes.component';

describe('GaficaEstudiantesComponent', () => {
  let component: GaficaEstudiantesComponent;
  let fixture: ComponentFixture<GaficaEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaficaEstudiantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GaficaEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
