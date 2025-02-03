import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterIn2Component } from './register-in-2.component';

describe('RegisterIn2Component', () => {
  let component: RegisterIn2Component;
  let fixture: ComponentFixture<RegisterIn2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterIn2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterIn2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
