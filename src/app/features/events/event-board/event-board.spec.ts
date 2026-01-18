import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventBoard } from './event-board';

describe('EventBoard', () => {
  let component: EventBoard;
  let fixture: ComponentFixture<EventBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
