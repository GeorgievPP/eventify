import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventComments } from './event-comments';

describe('EventComments', () => {
  let component: EventComments;
  let fixture: ComponentFixture<EventComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventComments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
