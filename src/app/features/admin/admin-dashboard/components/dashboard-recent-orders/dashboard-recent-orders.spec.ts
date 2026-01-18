import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRecentOrders } from './dashboard-recent-orders';

describe('DashboardRecentOrders', () => {
  let component: DashboardRecentOrders;
  let fixture: ComponentFixture<DashboardRecentOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRecentOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRecentOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
