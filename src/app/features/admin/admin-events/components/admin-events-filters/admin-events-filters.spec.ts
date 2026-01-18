import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventsFilters } from './admin-events-filters';

describe('AdminEventsFilters', () => {
  let component: AdminEventsFilters;
  let fixture: ComponentFixture<AdminEventsFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventsFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEventsFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
