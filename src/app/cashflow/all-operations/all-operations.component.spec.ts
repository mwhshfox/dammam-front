import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllOperationsComponent } from './all-operations.component';

describe('AllOperationsComponent', () => {
  let component: AllOperationsComponent;
  let fixture: ComponentFixture<AllOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllOperationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
