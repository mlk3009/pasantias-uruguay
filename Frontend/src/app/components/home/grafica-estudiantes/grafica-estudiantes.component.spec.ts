import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficaEstudiantesComponent } from './grafica-estudiantes.component';

describe('GaficaEstudiantesComponent', () => {
  let component: GraficaEstudiantesComponent;
  let fixture: ComponentFixture<GraficaEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficaEstudiantesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GraficaEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
