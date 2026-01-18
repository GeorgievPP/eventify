import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSearchFilters } from './event-search-filters';

describe('EventSearchFilters', () => {
  let component: EventSearchFilters;
  let fixture: ComponentFixture<EventSearchFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSearchFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSearchFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
