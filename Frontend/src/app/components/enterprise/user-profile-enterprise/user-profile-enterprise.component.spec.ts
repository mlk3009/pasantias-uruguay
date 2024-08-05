import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileEnterpriseComponent } from './user-profile-enterprise.component';

describe('UserProfileEnterpriseComponent', () => {
  let component: UserProfileEnterpriseComponent;
  let fixture: ComponentFixture<UserProfileEnterpriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileEnterpriseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserProfileEnterpriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
