import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizeTaskeenComponent } from './organize-taskeen.component';

describe('OrganizeTaskeenComponent', () => {
  let component: OrganizeTaskeenComponent;
  let fixture: ComponentFixture<OrganizeTaskeenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizeTaskeenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizeTaskeenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
