import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditReservationComponent } from './add-edit-reservation.component';

describe('AddEditReservationComponent', () => {
  let component: AddEditReservationComponent;
  let fixture: ComponentFixture<AddEditReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
