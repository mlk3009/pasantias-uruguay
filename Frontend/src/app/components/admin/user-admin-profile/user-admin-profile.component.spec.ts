import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAdminProfileComponent } from './user-admin-profile.component';

describe('UserAdminProfileComponent', () => {
  let component: UserAdminProfileComponent;
  let fixture: ComponentFixture<UserAdminProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAdminProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserAdminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
