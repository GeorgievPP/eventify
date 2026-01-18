import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AckConfirmDialog } from './ack-confirm-dialog';

describe('AckConfirmDialog', () => {
  let component: AckConfirmDialog;
  let fixture: ComponentFixture<AckConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AckConfirmDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AckConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
