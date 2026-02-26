import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsForReservationComponent } from './trips-for-reservation.component';

describe('TripsForReservationComponent', () => {
  let component: TripsForReservationComponent;
  let fixture: ComponentFixture<TripsForReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsForReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsForReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
