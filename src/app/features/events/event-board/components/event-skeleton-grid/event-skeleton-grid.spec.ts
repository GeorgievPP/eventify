import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSkeletonGrid } from './event-skeleton-grid';

describe('EventSkeletonGrid', () => {
  let component: EventSkeletonGrid;
  let fixture: ComponentFixture<EventSkeletonGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSkeletonGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSkeletonGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
