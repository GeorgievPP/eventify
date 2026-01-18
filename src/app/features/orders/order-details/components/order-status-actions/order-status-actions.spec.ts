import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStatusActions } from './order-status-actions';

describe('OrderStatusActions', () => {
  let component: OrderStatusActions;
  let fixture: ComponentFixture<OrderStatusActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderStatusActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderStatusActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
