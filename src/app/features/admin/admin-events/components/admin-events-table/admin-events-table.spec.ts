import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventsTable } from './admin-events-table';

describe('AdminEventsTable', () => {
  let component: AdminEventsTable;
  let fixture: ComponentFixture<AdminEventsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEventsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
