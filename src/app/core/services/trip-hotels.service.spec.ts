import { TestBed } from '@angular/core/testing';

import { TripHotelsService } from './trip-hotels.service';

describe('TripHotelsService', () => {
  let service: TripHotelsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripHotelsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
