import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailsHero } from './event-details-hero';

describe('EventDetailsHero', () => {
  let component: EventDetailsHero;
  let fixture: ComponentFixture<EventDetailsHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailsHero]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDetailsHero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
