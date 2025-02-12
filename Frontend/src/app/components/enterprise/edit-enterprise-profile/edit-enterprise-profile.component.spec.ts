import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEnterpriseProfileComponent } from './edit-enterprise-profile.component';

describe('EditEnterpriseProfileComponent', () => {
  let component: EditEnterpriseProfileComponent;
  let fixture: ComponentFixture<EditEnterpriseProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEnterpriseProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditEnterpriseProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
