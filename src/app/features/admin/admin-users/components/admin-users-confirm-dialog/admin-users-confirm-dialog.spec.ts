import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUsersConfirmDialog } from './admin-users-confirm-dialog';

describe('AdminUsersConfirmDialog', () => {
  let component: AdminUsersConfirmDialog;
  let fixture: ComponentFixture<AdminUsersConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersConfirmDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUsersConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
