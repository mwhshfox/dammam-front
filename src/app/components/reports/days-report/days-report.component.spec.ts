import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysReportComponent } from './days-report.component';

describe('DaysReportComponent', () => {
  let component: DaysReportComponent;
  let fixture: ComponentFixture<DaysReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaysReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaysReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
