import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsPortal } from './jobs-portal';

describe('JobsPortal', () => {
  let component: JobsPortal;
  let fixture: ComponentFixture<JobsPortal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsPortal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsPortal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
