import { TestBed } from '@angular/core/testing';

import { TaskeenService } from './taskeen.service';

describe('TaskeenService', () => {
  let service: TaskeenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskeenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
