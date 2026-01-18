import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTopEvents } from './dashboard-top-events';

describe('DashboardTopEvents', () => {
  let component: DashboardTopEvents;
  let fixture: ComponentFixture<DashboardTopEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTopEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTopEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
