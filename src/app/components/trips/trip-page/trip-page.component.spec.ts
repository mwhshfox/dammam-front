import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPageComponent } from './trip-page.component';

describe('TripPageComponent', () => {
  let component: TripPageComponent;
  let fixture: ComponentFixture<TripPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
