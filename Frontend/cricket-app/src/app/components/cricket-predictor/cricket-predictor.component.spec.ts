import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CricketPredictorComponent } from './cricket-predictor.component';

describe('CricketPredictorComponent', () => {
  let component: CricketPredictorComponent;
  let fixture: ComponentFixture<CricketPredictorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CricketPredictorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CricketPredictorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
