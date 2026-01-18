import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventItem } from './event-item';

describe('EventItem', () => {
  let component: EventItem;
  let fixture: ComponentFixture<EventItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
