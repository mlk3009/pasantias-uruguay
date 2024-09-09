import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileStudentComponent } from './user-profile-student.component';

describe('UserProfileStudentComponent', () => {
  let component: UserProfileStudentComponent;
  let fixture: ComponentFixture<UserProfileStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileStudentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserProfileStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
