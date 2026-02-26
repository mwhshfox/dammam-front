import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTaskeenComponent } from './all-taskeen.component';

describe('AllTaskeenComponent', () => {
  let component: AllTaskeenComponent;
  let fixture: ComponentFixture<AllTaskeenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTaskeenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllTaskeenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
