import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReservationByIdComponent } from './show-reservation-by-id.component';

describe('ShowReservationByIdComponent', () => {
  let component: ShowReservationByIdComponent;
  let fixture: ComponentFixture<ShowReservationByIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReservationByIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowReservationByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
