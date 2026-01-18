import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUsersToolbar } from './admin-users-toolbar';

describe('AdminUsersToolbar', () => {
  let component: AdminUsersToolbar;
  let fixture: ComponentFixture<AdminUsersToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersToolbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUsersToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
