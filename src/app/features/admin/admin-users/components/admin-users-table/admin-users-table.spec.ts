import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUsersTable } from './admin-users-table';

describe('AdminUsersTable', () => {
  let component: AdminUsersTable;
  let fixture: ComponentFixture<AdminUsersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUsersTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
