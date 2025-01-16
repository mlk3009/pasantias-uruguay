import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbautusComponent } from './abautus.component';

describe('AbautusComponent', () => {
  let component: AbautusComponent;
  let fixture: ComponentFixture<AbautusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbautusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AbautusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
