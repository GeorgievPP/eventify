import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemsEditor } from './order-items-editor';

describe('OrderItemsEditor', () => {
  let component: OrderItemsEditor;
  let fixture: ComponentFixture<OrderItemsEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderItemsEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderItemsEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
