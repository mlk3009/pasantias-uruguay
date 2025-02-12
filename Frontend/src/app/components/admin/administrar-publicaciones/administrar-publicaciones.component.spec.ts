import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarPublicacionesComponent } from './administrar-publicaciones.component';

describe('AdministrarPublicacionesComponent', () => {
  let component: AdministrarPublicacionesComponent;
  let fixture: ComponentFixture<AdministrarPublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrarPublicacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdministrarPublicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
