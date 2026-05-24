import { TestBed } from '@angular/core/testing';

import { CricketApiService } from './cricket-api.service';

describe('CricketApiService', () => {
  let service: CricketApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CricketApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
