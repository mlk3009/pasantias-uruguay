import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarSolicitudesComponent } from './administrar-solicitudes.component';

describe('AdministrarSolicitudesComponent', () => {
  let component: AdministrarSolicitudesComponent;
  let fixture: ComponentFixture<AdministrarSolicitudesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrarSolicitudesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdministrarSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
