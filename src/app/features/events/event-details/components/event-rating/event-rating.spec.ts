import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRating } from './event-rating';

describe('EventRating', () => {
  let component: EventRating;
  let fixture: ComponentFixture<EventRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
