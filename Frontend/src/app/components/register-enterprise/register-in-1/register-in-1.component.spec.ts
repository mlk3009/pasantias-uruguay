import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterIn1Component } from './register-in-1.component';

describe('RegisterIn1Component', () => {
  let component: RegisterIn1Component;
  let fixture: ComponentFixture<RegisterIn1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterIn1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterIn1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
