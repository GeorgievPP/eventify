import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPeriod } from './dashboard-period';

describe('DashboardPeriod', () => {
  let component: DashboardPeriod;
  let fixture: ComponentFixture<DashboardPeriod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPeriod]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPeriod);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
