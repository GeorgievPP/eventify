import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersFilters } from './orders-filters';

describe('OrdersFilters', () => {
  let component: OrdersFilters;
  let fixture: ComponentFixture<OrdersFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
