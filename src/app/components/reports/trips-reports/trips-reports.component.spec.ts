import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsReportsComponent } from './trips-reports.component';

describe('TripsReportsComponent', () => {
  let component: TripsReportsComponent;
  let fixture: ComponentFixture<TripsReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
