import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventHistory } from './event-history';

describe('EventHistory', () => {
  let component: EventHistory;
  let fixture: ComponentFixture<EventHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
